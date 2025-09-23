from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CommentCreate(BaseModel):
    content: str
    parent_comment_id: Optional[int] = None

class CommentResponse(BaseModel):
    comment_id: int
    post_id: int
    user_id: int
    content: str
    created_at: datetime
    parent_comment_id: Optional[int] = None
    sentiment_label: Optional[str] = None
    sentiment_confidence: Optional[float] = None
    is_sarcastic: Optional[bool] = None
    sarcasm_confidence: Optional[float] = None

    class Config:
        from_attributes = True
