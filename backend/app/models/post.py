from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class Post(Base):
    __tablename__ = "posts"

    # Original fields
    post_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    title = Column(String(255))
    content = Column(Text)
    is_deleted = Column(Boolean, default=False)

    # AI Analysis fields
    sentiment_label = Column(String(20))
    sentiment_confidence = Column(Float)
    is_sarcastic = Column(Boolean, default=False)
    sarcasm_confidence = Column(Float)
    analyzed_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="posts")
    comments = relationship("Comment", back_populates="post")
    likes = relationship("Like", back_populates="post")
