from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from database.mongodb import get_db
from models.interactions import InteractionCreate
from auth.jwt_handler import get_current_user
from utils.response import success_response
from bson import ObjectId
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/interactions", tags=["Interactions"])


@router.post("")
async def log_interaction(
    interaction: InteractionCreate,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user),
):
    """Log a user interaction with a destination for CF model training."""
    db = get_db()
    user_id = current_user["sub"]

    # Resolve destination_id if name is provided but ID isn't
    dest_id = interaction.destination_id
    if not dest_id and interaction.destination_name:
        dest = await db.destinations.find_one({"name": interaction.destination_name})
        if dest:
            dest_id = str(dest["_id"])

    doc = {
        "user_id": user_id,
        "destination_id": dest_id,
        "destination_name": interaction.destination_name,
        "country": interaction.country or "",
        "interaction_type": interaction.interaction_type,
        "weight": interaction.weight or 1.0,
        "created_at": datetime.utcnow(),
    }

    await db.interactions.insert_one(doc)

    # Track pending count & trigger auto-retrain if threshold met
    try:
        from services.ml_recommender import get_recommender
        rec = get_recommender()
        rec.increment_pending()
        if rec.should_retrain:
            background_tasks.add_task(_background_retrain, db)
    except Exception as e:
        logger.warning(f"CF auto-retrain check failed: {e}")

    return success_response(
        message=f"Interaction '{interaction.interaction_type}' logged",
        status_code=201,
    )


@router.get("/history")
async def get_interaction_history(current_user: dict = Depends(get_current_user)):
    """Get current user's interaction history."""
    db = get_db()
    cursor = db.interactions.find({"user_id": current_user["sub"]}).sort("created_at", -1).limit(50)
    interactions = []
    async for inter in cursor:
        interactions.append({
            "id": str(inter["_id"]),
            "destination_name": inter.get("destination_name", ""),
            "country": inter.get("country", ""),
            "interaction_type": inter.get("interaction_type", "view"),
            "weight": inter.get("weight", 1.0),
            "created_at": str(inter.get("created_at", "")),
        })
    return success_response(data=interactions)


@router.get("/popular")
async def get_popular_destinations(current_user: dict = Depends(get_current_user)):
    """Get globally most-interacted destinations."""
    db = get_db()

    pipeline = [
        {"$group": {
            "_id": "$destination_name",
            "country": {"$first": "$country"},
            "total_weight": {"$sum": "$weight"},
            "count": {"$sum": 1},
        }},
        {"$sort": {"total_weight": -1}},
        {"$limit": 10},
    ]

    results = []
    async for doc in db.interactions.aggregate(pipeline):
        results.append({
            "destination_name": doc["_id"],
            "country": doc.get("country", ""),
            "total_weight": doc["total_weight"],
            "interaction_count": doc["count"],
        })

    return success_response(data=results)


async def _background_retrain(db):
    """Background task to retrain CF model."""
    try:
        from services.ml_recommender import get_recommender
        rec = get_recommender()
        result = await rec.train(db)
        logger.info(f"🔄 Auto-retrained CF model: {result}")
    except Exception as e:
        logger.error(f"Auto-retrain failed: {e}")
