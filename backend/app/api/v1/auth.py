from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token
from app.services.auth_service import AuthService
from app.utils.security import create_access_token
from app.config import settings
from app.models.user import User
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(
            (User.user_name == user.user_name) | (User.user_email == user.user_email)
        ).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Username or email already exists")

        # Create the user first
        db_user = AuthService.create_user(db, user.user_name, user.user_email, user.password)

        # Try to make first user admin (non-critical operation)
        try:
            user_count = db.query(func.count(User.user_id)).scalar()
            if user_count == 1:  # This is the first user
                db_user.is_admin = True
                db.commit()
                db.refresh(db_user)
                logger.info(f"First user {db_user.user_name} created with admin privileges")
        except Exception as e:
            logger.warning(f"Could not check/set admin status: {e}")
            # Continue anyway - user is still created

        return db_user

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = AuthService.authenticate_user(db, user.username, user.password)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.user_name}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
