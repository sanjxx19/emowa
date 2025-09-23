from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    user_name = Column(String(100), unique=True, index=True)
    user_email = Column(String(255), unique=True, index=True)
    password_hash = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    profile_pic_url = Column(String(500), nullable=True)

    # Relationships
    posts = relationship("Post", back_populates="user")
    comments = relationship("Comment", back_populates="user")
    following = relationship(
        "UserRelation",
        foreign_keys="UserRelation.follower_id",
        back_populates="follower"
    )
    followers = relationship(
        "UserRelation",
        foreign_keys="UserRelation.followed_id",
        back_populates="followed"
    )
