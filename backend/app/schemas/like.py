from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class LikeResponse(BaseModel):
    like_id: int
    user_id: int
    post_id: Optional[int] = None
    comment_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

class LikeStats(BaseModel):
    total_likes: int
    user_has_liked: bool
