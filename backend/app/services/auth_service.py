from sqlalchemy.orm import Session
from app.models.user import User
from app.utils.security import get_password_hash, verify_password
from typing import Optional


class AuthService:
    @staticmethod
    def create_user(db: Session, user_name: str, user_email: str, password: str) -> User:
        hashed_password = get_password_hash(password)
        db_user = User(
            user_name=user_name,
            user_email=user_email,
            password_hash=hashed_password
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
        user = db.query(User).filter(User.user_name == username).first()
        if not user or not verify_password(password, user.password_hash):
            return None
        return user

    @staticmethod
    def get_user_by_username(db: Session, username: str) -> Optional[User]:
        return db.query(User).filter(User.user_name == username).first()
