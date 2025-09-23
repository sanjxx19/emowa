from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class UserRelation(Base):
    __tablename__ = "user_relations"

    relation_id = Column(Integer, primary_key=True, index=True)
    follower_id = Column(Integer, ForeignKey("users.user_id"))
    followed_id = Column(Integer, ForeignKey("users.user_id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    follower = relationship("User", foreign_keys=[follower_id], back_populates="following")
    followed = relationship("User", foreign_keys=[followed_id], back_populates="followers")
