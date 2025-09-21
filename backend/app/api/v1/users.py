from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.user import UserResponse
from fastapi import HTTPException

router = APIRouter()

@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# Add to app/api/v1/users.py
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
