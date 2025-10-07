from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class PostCreate(BaseModel):
    title: str
    content: str


class PostResponse(BaseModel):
    post_id: int
    title: str
    content: str
    user_id: int
    created_at: datetime
    sentiment_label: Optional[str] = None
    sentiment_confidence: Optional[float] = None
    is_sarcastic: Optional[bool] = None
    sarcasm_confidence: Optional[float] = None
    analyzed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PostAnalysis(BaseModel):
    text: str
    sentiment: dict
    sarcasm: dict
    needs_review: bool


class PostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
