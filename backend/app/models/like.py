from sqlalchemy import Column, Integer, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class Like(Base):
    __tablename__ = "likes"

    like_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    post_id = Column(Integer, ForeignKey("posts.post_id"), nullable=True)
    comment_id = Column(Integer, ForeignKey("comments.comment_id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="likes")
    post = relationship("Post", back_populates="likes")
    comment = relationship("Comment", back_populates="likes")

    # Ensure a user can only like a post/comment once
    __table_args__ = (
        UniqueConstraint('user_id', 'post_id', name='unique_user_post_like'),
        UniqueConstraint('user_id', 'comment_id', name='unique_user_comment_like'),
    )
