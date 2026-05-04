"""
LightFM-based Hybrid Collaborative Filtering recommender.

Combines user-item interactions with item content features
(travel_type, budget_tier, climate, region) for personalized ranking.
"""
import os
import pickle
import logging
import asyncio
from typing import List, Dict, Any, Optional, Tuple
from collections import defaultdict

import numpy as np
from scipy.sparse import coo_matrix, csr_matrix
from lightfm import LightFM
from lightfm.data import Dataset

logger = logging.getLogger(__name__)

MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "trained_models")
MODEL_PATH = os.path.join(MODEL_DIR, "lightfm_travel.pkl")
DATASET_PATH = os.path.join(MODEL_DIR, "lightfm_dataset.pkl")

# Interaction type weights
INTERACTION_WEIGHTS = {
    "view": 1.0,
    "like": 3.0,
    "save": 4.0,
    "plan": 5.0,
}

# Minimum interactions to start training
MIN_INTERACTIONS = 5


class CFRecommender:
    """Hybrid Collaborative Filtering recommender using LightFM."""

    def __init__(self):
        self.model: Optional[LightFM] = None
        self.dataset: Optional[Dataset] = None
        self.user_id_map: Dict[str, int] = {}
        self.item_id_map: Dict[str, int] = {}
        self.reverse_item_map: Dict[int, str] = {}
        self.reverse_user_map: Dict[int, str] = {}
        self.item_features_matrix: Optional[csr_matrix] = None
        self.interaction_matrix: Optional[coo_matrix] = None
        self.is_trained: bool = False
        self.n_users: int = 0
        self.n_items: int = 0
        self.n_interactions: int = 0
        self._pending_count: int = 0
        self._item_metadata: Dict[str, Dict] = {}  # dest_id -> full doc

        os.makedirs(MODEL_DIR, exist_ok=True)
        self._load_model()

    def _load_model(self):
        """Load a previously trained model from disk."""
        try:
            if os.path.exists(MODEL_PATH) and os.path.exists(DATASET_PATH):
                with open(MODEL_PATH, "rb") as f:
                    saved = pickle.load(f)
                self.model = saved["model"]
                self.user_id_map = saved["user_id_map"]
                self.item_id_map = saved["item_id_map"]
                self.reverse_item_map = saved["reverse_item_map"]
                self.reverse_user_map = saved["reverse_user_map"]
                self.is_trained = True
                self.n_users = len(self.user_id_map)
                self.n_items = len(self.item_id_map)
                self.n_interactions = saved.get("n_interactions", 0)

                with open(DATASET_PATH, "rb") as f:
                    ds = pickle.load(f)
                self.dataset = ds["dataset"]
                self.item_features_matrix = ds.get("item_features_matrix")

                logger.info(
                    f"✅ Loaded CF model: {self.n_users} users, {self.n_items} items"
                )
        except Exception as e:
            logger.warning(f"⚠️  Could not load CF model: {e}")
            self.is_trained = False

    def _save_model(self):
        """Persist trained model to disk."""
        try:
            with open(MODEL_PATH, "wb") as f:
                pickle.dump({
                    "model": self.model,
                    "user_id_map": self.user_id_map,
                    "item_id_map": self.item_id_map,
                    "reverse_item_map": self.reverse_item_map,
                    "reverse_user_map": self.reverse_user_map,
                    "n_interactions": self.n_interactions,
                }, f)
            with open(DATASET_PATH, "wb") as f:
                pickle.dump({
                    "dataset": self.dataset,
                    "item_features_matrix": self.item_features_matrix,
                }, f)
            logger.info("💾 CF model saved to disk")
        except Exception as e:
            logger.error(f"Failed to save CF model: {e}")

    async def train(self, db) -> Dict[str, Any]:
        """
        Train the LightFM model from scratch using all interactions in MongoDB.
        
        Args:
            db: Motor database instance
        
        Returns:
            Training stats dict
        """
        # 1. Fetch all destinations (items)
        destinations = []
        async for dest in db.destinations.find({}):
            dest["_id"] = str(dest["_id"])
            destinations.append(dest)

        if len(destinations) < 2:
            return {"success": False, "message": "Not enough destinations in catalog", "n_destinations": len(destinations)}

        # 2. Fetch all interactions
        interactions = []
        async for inter in db.interactions.find({}):
            inter["_id"] = str(inter["_id"])
            interactions.append(inter)

        if len(interactions) < MIN_INTERACTIONS:
            return {
                "success": False,
                "message": f"Not enough interactions (need {MIN_INTERACTIONS}, have {len(interactions)})",
                "n_interactions": len(interactions),
                "n_destinations": len(destinations),
            }

        # 3. Build user/item ID sets
        user_ids = list(set(i["user_id"] for i in interactions))
        item_ids = list(set(str(d["_id"]) for d in destinations))

        # Build destination name → id lookup for resolving interactions
        name_to_id = {}
        id_to_dest = {}
        for d in destinations:
            did = str(d["_id"])
            name_to_id[d["name"].lower()] = did
            id_to_dest[did] = d

        # 4. Collect unique item features
        all_features = set()
        for d in destinations:
            for tt in d.get("travel_type", []):
                all_features.add(f"type:{tt}")
            if d.get("budget_tier"):
                all_features.add(f"budget:{d['budget_tier']}")
            if d.get("climate"):
                all_features.add(f"climate:{d['climate']}")
            if d.get("region"):
                all_features.add(f"region:{d['region']}")

        # 5. Build LightFM Dataset
        dataset = Dataset()
        dataset.fit(
            users=user_ids,
            items=item_ids,
            item_features=list(all_features),
        )

        # 6. Build interactions list (user_id, item_id, weight)
        valid_interactions = []
        for inter in interactions:
            uid = inter["user_id"]
            # Resolve destination_id
            did = inter.get("destination_id")
            if did and did in id_to_dest:
                pass  # Already have valid ID
            else:
                # Try to resolve by name
                dname = inter.get("destination_name", "").lower()
                did = name_to_id.get(dname)
            
            if uid in user_ids and did and did in id_to_dest:
                w = inter.get("weight", 1.0) * INTERACTION_WEIGHTS.get(
                    inter.get("interaction_type", "view"), 1.0
                )
                valid_interactions.append((uid, did, w))

        if len(valid_interactions) < MIN_INTERACTIONS:
            return {
                "success": False,
                "message": f"Not enough valid interactions (need {MIN_INTERACTIONS}, have {len(valid_interactions)})",
                "n_interactions": len(valid_interactions),
            }

        # 7. Build interaction matrix
        interaction_matrix, weights_matrix = dataset.build_interactions(
            [(uid, did, w) for uid, did, w in valid_interactions]
        )

        # 8. Build item features matrix
        item_feature_tuples = []
        for d in destinations:
            did = str(d["_id"])
            features = []
            for tt in d.get("travel_type", []):
                features.append(f"type:{tt}")
            if d.get("budget_tier"):
                features.append(f"budget:{d['budget_tier']}")
            if d.get("climate"):
                features.append(f"climate:{d['climate']}")
            if d.get("region"):
                features.append(f"region:{d['region']}")
            if features:
                item_feature_tuples.append((did, features))

        item_features_matrix = dataset.build_item_features(item_feature_tuples)

        # 9. Train LightFM model
        model = LightFM(
            loss="warp",
            no_components=64,
            learning_rate=0.05,
            item_alpha=1e-6,
            user_alpha=1e-6,
        )
        model.fit(
            interaction_matrix,
            item_features=item_features_matrix,
            sample_weight=weights_matrix,
            epochs=30,
            num_threads=2,
            verbose=False,
        )

        # 10. Store everything
        self.model = model
        self.dataset = dataset

        user_map, _, item_map, _ = dataset.mapping()
        self.user_id_map = dict(user_map)
        self.item_id_map = dict(item_map)
        self.reverse_item_map = {v: k for k, v in self.item_id_map.items()}
        self.reverse_user_map = {v: k for k, v in self.user_id_map.items()}
        self.item_features_matrix = item_features_matrix
        self.interaction_matrix = interaction_matrix
        self.is_trained = True
        self.n_users = len(self.user_id_map)
        self.n_items = len(self.item_id_map)
        self.n_interactions = len(valid_interactions)
        self._pending_count = 0
        self._item_metadata = id_to_dest

        self._save_model()

        return {
            "success": True,
            "message": "CF model trained successfully",
            "n_users": self.n_users,
            "n_items": self.n_items,
            "n_interactions": self.n_interactions,
            "n_features": len(all_features),
        }

    def predict_for_user(self, user_id: str, n: int = 10) -> List[str]:
        """
        Get top-N destination IDs for a given user.
        
        Returns list of destination MongoDB ObjectId strings.
        """
        if not self.is_trained or not self.model:
            return []

        if user_id not in self.user_id_map:
            # Cold-start: return globally popular items
            return self._get_popular_items(n)

        user_idx = self.user_id_map[user_id]
        n_items = len(self.item_id_map)
        item_indices = np.arange(n_items)

        scores = self.model.predict(
            user_idx,
            item_indices,
            item_features=self.item_features_matrix,
        )

        # Get top N by score
        top_indices = np.argsort(-scores)[:n]
        return [self.reverse_item_map[idx] for idx in top_indices if idx in self.reverse_item_map]

    def _get_popular_items(self, n: int = 10) -> List[str]:
        """Fallback: return items with highest average scores across all users."""
        if not self.is_trained or not self.model:
            return []

        n_items = len(self.item_id_map)
        n_users = len(self.user_id_map)

        if n_users == 0 or n_items == 0:
            return []

        # Average scores across all users
        all_scores = np.zeros(n_items)
        for user_idx in range(min(n_users, 50)):  # Cap at 50 users for speed
            scores = self.model.predict(
                user_idx,
                np.arange(n_items),
                item_features=self.item_features_matrix,
            )
            all_scores += scores

        all_scores /= min(n_users, 50)
        top_indices = np.argsort(-all_scores)[:n]
        return [self.reverse_item_map[idx] for idx in top_indices if idx in self.reverse_item_map]

    def get_similar_items(self, destination_id: str, n: int = 5) -> List[str]:
        """
        Get N most similar destinations to the given one (item-item similarity).
        Uses the item embedding vectors from the trained model.
        """
        if not self.is_trained or not self.model:
            return []

        if destination_id not in self.item_id_map:
            return []

        item_idx = self.item_id_map[destination_id]

        # Get item embeddings (biases + representations)
        item_embeddings = self.model.get_item_representations(
            features=self.item_features_matrix
        )
        # item_embeddings is a tuple: (biases, representations)
        item_vectors = item_embeddings[1]  # shape: (n_items, n_components)

        target_vector = item_vectors[item_idx]
        # Cosine similarity
        norms = np.linalg.norm(item_vectors, axis=1)
        norms[norms == 0] = 1e-10  # avoid division by zero
        similarities = item_vectors @ target_vector / (norms * np.linalg.norm(target_vector))

        # Exclude self
        similarities[item_idx] = -1

        top_indices = np.argsort(-similarities)[:n]
        return [self.reverse_item_map[idx] for idx in top_indices if idx in self.reverse_item_map]

    def increment_pending(self):
        """Track pending interactions since last train."""
        self._pending_count += 1

    @property
    def should_retrain(self) -> bool:
        """Check if we have enough pending interactions to retrain."""
        return self._pending_count >= 10

    def get_status(self) -> Dict[str, Any]:
        """Get current model status."""
        return {
            "is_trained": self.is_trained,
            "n_users": self.n_users,
            "n_items": self.n_items,
            "n_interactions": self.n_interactions,
            "pending_since_last_train": self._pending_count,
            "model_path": MODEL_PATH,
            "model_exists_on_disk": os.path.exists(MODEL_PATH),
        }


# ── Module-level singleton ──
_recommender: Optional[CFRecommender] = None


def get_recommender() -> CFRecommender:
    """Get or create the singleton CFRecommender instance."""
    global _recommender
    if _recommender is None:
        _recommender = CFRecommender()
    return _recommender
