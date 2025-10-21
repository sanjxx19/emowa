from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.post import Post
from app.models.comment import Comment

router = APIRouter()

def verify_admin(current_user: User = Depends(get_current_user)):
    """Dependency to verify user is an admin"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

@router.get("/stats")
def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_admin)
):
    """Get platform statistics for admin dashboard"""

    # Total users
    total_users = db.query(func.count(User.user_id)).scalar()

    # Total posts (not deleted)
    total_posts = db.query(func.count(Post.post_id)).filter(
        Post.is_deleted == False
    ).scalar()

    # Total comments
    total_comments = db.query(func.count(Comment.comment_id)).scalar()

    # Posts needing review (highly negative sentiment)
    posts_needing_review = db.query(func.count(Post.post_id)).filter(
        Post.sentiment_label == "negative",
        Post.sentiment_confidence > 0.8,
        Post.is_deleted == False
    ).scalar()

    return {
        "total_users": total_users,
        "total_posts": total_posts,
        "total_comments": total_comments,
        "posts_needing_review": posts_needing_review
    }

@router.get("/recent-users")
def get_recent_users(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_admin)
):
    """Get recently registered users"""
    users = db.query(User).order_by(
        desc(User.created_at)
    ).limit(limit).all()

    return users

@router.get("/flagged-posts")
def get_flagged_posts(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_admin)
):
    """Get posts flagged for review"""
    posts = db.query(Post).join(User).filter(
        Post.sentiment_label == "negative",
        Post.sentiment_confidence > 0.8,
        Post.is_deleted == False
    ).order_by(desc(Post.created_at)).offset(skip).limit(limit).all()

    # Format response with user info
    return [{
        "post_id": post.post_id,
        "title": post.title,
        "content": post.content,
        "user_id": post.user_id,
        "user_name": post.user.user_name,
        "sentiment_label": post.sentiment_label,
        "sentiment_confidence": post.sentiment_confidence,
        "created_at": post.created_at
    } for post in posts]

@router.delete("/posts/{post_id}")
def admin_delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_admin)
):
    """Admin can delete any post"""
    post = db.query(Post).filter(Post.post_id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    post.is_deleted = True
    db.commit()

    return {"message": "Post deleted successfully"}

@router.put("/users/{user_id}/admin")
def toggle_admin_status(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_admin)
):
    """Toggle admin status for a user"""
    if user_id == current_user.user_id:
        raise HTTPException(
            status_code=400,
            detail="Cannot modify your own admin status"
        )

    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_admin = not user.is_admin
    db.commit()
    db.refresh(user)

    return {
        "message": f"Admin status {'granted' if user.is_admin else 'revoked'}",
        "is_admin": user.is_admin
    }

@router.get("/users")
def get_all_users(
    skip: int = 0,
    limit: int = 50,
    search: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_admin)
):
    """Get all users with optional search"""
    query = db.query(User)

    if search:
        query = query.filter(
            (User.user_name.contains(search)) |
            (User.user_email.contains(search))
        )

    users = query.offset(skip).limit(limit).all()
    total = query.count()

    return {
        "users": users,
        "total": total,
        "skip": skip,
        "limit": limit
    }
