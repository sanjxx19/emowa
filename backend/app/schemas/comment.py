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
    user_name: str  # Added user_name
    content: str
    created_at: datetime
    updated_at: datetime  # Added for edit tracking
    parent_comment_id: Optional[int] = None
    sentiment_label: Optional[str] = None
    sentiment_confidence: Optional[float] = None
    is_sarcastic: Optional[bool] = None
    sarcasm_confidence: Optional[float] = None
    like_count: int = 0  # Added like_count
    user_has_liked: bool = False  # Added user_has_liked

    class Config:
        from_attributes = True


class CommentUpdate(BaseModel):
    content: Optional[str] = None
