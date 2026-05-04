from fastapi import APIRouter, HTTPException, Depends
from database.mongodb import get_db
from auth.jwt_handler import get_current_user
from utils.response import success_response
from services.ml_recommender import get_recommender
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/cf", tags=["Collaborative Filtering"])


@router.get("/for-you")
async def get_for_you_recommendations(current_user: dict = Depends(get_current_user)):
    """
    Get personalized CF-powered recommendations for the current user.
    Returns destination documents enriched with CF scores.
    """
    db = get_db()
    rec = get_recommender()

    if not rec.is_trained:
        # Fallback: return popular destinations from the catalog
        popular = await _get_catalog_popular(db, limit=10)
        return success_response(
            data=popular,
            message="CF model not trained yet — showing popular destinations",
        )

    user_id = current_user["sub"]
    top_ids = rec.predict_for_user(user_id, n=10)

    if not top_ids:
        popular = await _get_catalog_popular(db, limit=10)
        return success_response(data=popular, message="Not enough data for personalization — showing popular")

    # Fetch full destination docs
    destinations = []
    for did in top_ids:
        try:
            dest = await db.destinations.find_one({"_id": ObjectId(did)})
            if dest:
                destinations.append(_serialize_destination(dest))
        except Exception:
            continue

    return success_response(
        data=destinations,
        message=f"Personalized: {len(destinations)} recommendations",
    )


@router.get("/similar/{destination_id}")
async def get_similar_destinations(destination_id: str, current_user: dict = Depends(get_current_user)):
    """
    Get destinations similar to the given one using CF item embeddings.
    """
    db = get_db()
    rec = get_recommender()

    if not rec.is_trained:
        # Fallback: find destinations with matching tags
        try:
            source = await db.destinations.find_one({"_id": ObjectId(destination_id)})
        except Exception:
            source = await db.destinations.find_one({"name": destination_id})

        if source:
            similar = await _get_tag_similar(db, source, limit=5)
            return success_response(data=similar, message="Tag-based similarity (model not trained)")
        return success_response(data=[], message="Destination not found")

    similar_ids = rec.get_similar_items(destination_id, n=6)

    destinations = []
    for did in similar_ids:
        try:
            dest = await db.destinations.find_one({"_id": ObjectId(did)})
            if dest:
                destinations.append(_serialize_destination(dest))
        except Exception:
            continue

    return success_response(
        data=destinations,
        message=f"Found {len(destinations)} similar destinations",
    )


@router.get("/similar-by-name/{destination_name}")
async def get_similar_by_name(destination_name: str, current_user: dict = Depends(get_current_user)):
    """
    Get similar destinations by name (convenience endpoint for frontend).
    """
    db = get_db()
    rec = get_recommender()

    # Find the destination document by name
    dest = await db.destinations.find_one({"name": {"$regex": f"^{destination_name}$", "$options": "i"}})

    if not dest:
        # Try partial match
        dest = await db.destinations.find_one({"name": {"$regex": destination_name, "$options": "i"}})

    if not dest:
        return success_response(data=[], message="Destination not found in catalog")

    dest_id = str(dest["_id"])

    if rec.is_trained:
        similar_ids = rec.get_similar_items(dest_id, n=6)
        destinations = []
        for did in similar_ids:
            try:
                d = await db.destinations.find_one({"_id": ObjectId(did)})
                if d:
                    destinations.append(_serialize_destination(d))
            except Exception:
                continue
        return success_response(data=destinations, message=f"Found {len(destinations)} similar destinations")
    else:
        similar = await _get_tag_similar(db, dest, limit=6)
        return success_response(data=similar, message="Tag-based similarity (model not trained)")


@router.post("/train")
async def train_cf_model(current_user: dict = Depends(get_current_user)):
    """Manually trigger CF model training (admin or any user for now)."""
    db = get_db()
    rec = get_recommender()

    result = await rec.train(db)
    return success_response(data=result, message=result.get("message", "Training complete"))


@router.get("/status")
async def get_cf_status(current_user: dict = Depends(get_current_user)):
    """Get CF model status and statistics."""
    rec = get_recommender()
    db = get_db()

    status = rec.get_status()
    status["total_interactions_in_db"] = await db.interactions.count_documents({})
    status["total_destinations_in_db"] = await db.destinations.count_documents({})

    return success_response(data=status)


# ── Helpers ──────────────────────────────────────────────────────────────────


def _serialize_destination(dest: dict) -> dict:
    """Convert a MongoDB destination document to a serializable dict."""
    return {
        "id": str(dest["_id"]),
        "name": dest.get("name", ""),
        "country": dest.get("country", ""),
        "travel_type": dest.get("travel_type", []),
        "budget_tier": dest.get("budget_tier", ""),
        "climate": dest.get("climate", ""),
        "region": dest.get("region", ""),
        "description": dest.get("description", ""),
        "coordinates": dest.get("coordinates"),
        "avg_cost_per_day": dest.get("avg_cost_per_day"),
        "rating": dest.get("rating"),
        "best_season": dest.get("best_season", ""),
        "images": dest.get("images", []),
    }


async def _get_catalog_popular(db, limit: int = 10) -> list:
    """Get popular destinations from catalog (fallback when CF isn't trained)."""
    # Use interaction counts if available, otherwise random sample
    pipeline = [
        {"$group": {
            "_id": "$destination_name",
            "count": {"$sum": 1},
        }},
        {"$sort": {"count": -1}},
        {"$limit": limit},
    ]

    popular_names = []
    async for doc in db.interactions.aggregate(pipeline):
        popular_names.append(doc["_id"])

    if popular_names:
        destinations = []
        for name in popular_names:
            dest = await db.destinations.find_one({"name": name})
            if dest:
                destinations.append(_serialize_destination(dest))
        if destinations:
            return destinations

    # No interactions yet — return a diverse sample from catalog
    sample_pipeline = [{"$sample": {"size": limit}}]
    destinations = []
    async for dest in db.destinations.aggregate(sample_pipeline):
        destinations.append(_serialize_destination(dest))
    return destinations


async def _get_tag_similar(db, source_dest: dict, limit: int = 5) -> list:
    """Find destinations with overlapping travel_type tags (fallback similarity)."""
    tags = source_dest.get("travel_type", [])
    source_id = source_dest["_id"]

    if not tags:
        # Just return random
        destinations = []
        async for dest in db.destinations.aggregate([
            {"$match": {"_id": {"$ne": source_id}}},
            {"$sample": {"size": limit}},
        ]):
            destinations.append(_serialize_destination(dest))
        return destinations

    cursor = db.destinations.find({
        "_id": {"$ne": source_id},
        "travel_type": {"$in": tags},
    }).limit(limit)

    destinations = []
    async for dest in cursor:
        destinations.append(_serialize_destination(dest))
    return destinations
