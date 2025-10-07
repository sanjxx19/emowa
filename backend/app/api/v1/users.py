from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.user import UserUpdate
from app.schemas.user import UserResponse
from fastapi import HTTPException
from app.utils.security import get_password_hash

router = APIRouter()

@router.put("/me", response_model=UserResponse)
def update_current_user(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update current user's profile (email, profile_pic_url, password)"""
    if user_update.user_email is not None:
        # Check if email already exists
        existing_user = db.query(User).filter(
            User.user_email == user_update.user_email,
            User.user_id != current_user.user_id
        ).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already in use")
        current_user.user_email = user_update.user_email

    if user_update.profile_pic_url is not None:
        current_user.profile_pic_url = user_update.profile_pic_url

    if user_update.password is not None:
        current_user.password_hash = get_password_hash(user_update.password)

    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/{user_id}/follow")
def follow_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if user_id == current_user.user_id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")

    # Check if user exists
    user_to_follow = db.query(User).filter(User.user_id == user_id).first()
    if not user_to_follow:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if already following
    from app.models.user_relation import UserRelation
    existing_relation = db.query(UserRelation).filter(
        UserRelation.follower_id == current_user.user_id,
        UserRelation.followed_id == user_id
    ).first()

    if existing_relation:
        raise HTTPException(status_code=400, detail="Already following this user")

    # Create follow relationship
    relation = UserRelation(
        follower_id=current_user.user_id,
        followed_id=user_id
    )
    db.add(relation)
    db.commit()

    return {"message": "Successfully followed user"}

@router.delete("/{user_id}/follow")
def unfollow_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.models.user_relation import UserRelation
    relation = db.query(UserRelation).filter(
        UserRelation.follower_id == current_user.user_id,
        UserRelation.followed_id == user_id
    ).first()

    if not relation:
        raise HTTPException(status_code=404, detail="Not following this user")

    db.delete(relation)
    db.commit()

    return {"message": "Successfully unfollowed user"}
