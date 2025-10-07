from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class Comment(Base):
    __tablename__ = "comments"

    comment_id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.post_id"))
    user_id = Column(Integer, ForeignKey("users.user_id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    content = Column(Text)
    parent_comment_id = Column(Integer, ForeignKey("comments.comment_id"), nullable=True)

    # AI Analysis fields
    sentiment_label = Column(String(20))
    sentiment_confidence = Column(Float)
    is_sarcastic = Column(Boolean, default=False)
    sarcasm_confidence = Column(Float)
    analyzed_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    post = relationship("Post", back_populates="comments")
    user = relationship("User", back_populates="comments")
    parent_comment = relationship("Comment", remote_side=[comment_id])
    likes = relationship("Like", back_populates="comment")
