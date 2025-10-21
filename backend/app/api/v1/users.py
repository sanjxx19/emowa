from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.user import UserUpdate, UserResponse
from app.utils.security import get_password_hash
from app.models.user_relation import UserRelation

router = APIRouter()

@router.put("/me", response_model=UserResponse)
def update_current_user(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update current user's profile (email, profile_pic_url, password)"""
    if user_update.user_email is not None:
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


@router.get("/{user_id}/stats")
def get_user_stats(user_id: int, db: Session = Depends(get_db)):
    """Get user statistics including followers and following count"""
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    followers_count = db.query(func.count(UserRelation.relation_id)).filter(
        UserRelation.followed_id == user_id
    ).scalar() or 0

    following_count = db.query(func.count(UserRelation.relation_id)).filter(
        UserRelation.follower_id == user_id
    ).scalar() or 0

    from app.models.post import Post
    posts_count = db.query(func.count(Post.post_id)).filter(
        Post.user_id == user_id,
        Post.is_deleted == False
    ).scalar() or 0

    return {
        "followers_count": followers_count,
        "following_count": following_count,
        "posts_count": posts_count
    }


@router.get("/{user_id}/follow-status")
def get_follow_status(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Check if current user is following the specified user"""
    is_following = db.query(UserRelation).filter(
        UserRelation.follower_id == current_user.user_id,
        UserRelation.followed_id == user_id
    ).first() is not None

    return {"is_following": is_following}


@router.post("/{user_id}/follow")
def follow_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if user_id == current_user.user_id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")

    user_to_follow = db.query(User).filter(User.user_id == user_id).first()
    if not user_to_follow:
        raise HTTPException(status_code=404, detail="User not found")

    existing_relation = db.query(UserRelation).filter(
        UserRelation.follower_id == current_user.user_id,
        UserRelation.followed_id == user_id
    ).first()

    if existing_relation:
        raise HTTPException(status_code=400, detail="Already following this user")

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
    relation = db.query(UserRelation).filter(
        UserRelation.follower_id == current_user.user_id,
        UserRelation.followed_id == user_id
    ).first()

    if not relation:
        raise HTTPException(status_code=404, detail="Not following this user")

    db.delete(relation)
    db.commit()

    return {"message": "Successfully unfollowed user"}


@router.get("/{user_id}/followers")
def get_followers(
    user_id: int,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get list of users following this user"""
    followers = db.query(User).join(
        UserRelation,
        UserRelation.follower_id == User.user_id
    ).filter(
        UserRelation.followed_id == user_id
    ).offset(skip).limit(limit).all()

    return followers


@router.get("/{user_id}/following")
def get_following(
    user_id: int,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get list of users this user is following"""
    following = db.query(User).join(
        UserRelation,
        UserRelation.followed_id == User.user_id
    ).filter(
        UserRelation.follower_id == user_id
    ).offset(skip).limit(limit).all()

    return following
