from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class InteractionCreate(BaseModel):
    destination_id: Optional[str] = None
    destination_name: str
    country: Optional[str] = ""
    interaction_type: str = "view"  # view, save, like, plan
    weight: Optional[float] = 1.0


class InteractionDB(BaseModel):
    id: Optional[str] = None
    user_id: str
    destination_id: Optional[str] = None
    destination_name: str
    country: Optional[str] = ""
    interaction_type: str = "view"
    weight: float = 1.0
    created_at: datetime = Field(default_factory=datetime.utcnow)


class InteractionResponse(BaseModel):
    id: str
    destination_name: str
    country: Optional[str] = ""
    interaction_type: str
    weight: float
    created_at: datetime
