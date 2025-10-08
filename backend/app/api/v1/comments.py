from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from app.database import get_db
from app.api.deps import get_current_user
from app.models.comment import Comment
from app.models.post import Post
from app.models.user import User
from app.models.like import Like
from app.schemas.comment import CommentCreate, CommentResponse, CommentUpdate
from app.services.ai_service import ai_service
import logging
logger = logging.getLogger(__name__)

router = APIRouter()

def analyze_comment_content(comment_id: int, content: str, db_session):
    """Background task to analyze comment content"""
    try:
        analysis = ai_service.analyze_text_complete(content)

        comment = db_session.query(Comment).filter(Comment.comment_id == comment_id).first()
        if comment:
            comment.sentiment_label = analysis["sentiment"]["sentiment_label"]
            comment.sentiment_confidence = analysis["sentiment"]["confidence"]
            comment.is_sarcastic = analysis["sarcasm"]["is_sarcastic"]
            comment.sarcasm_confidence = analysis["sarcasm"]["confidence"]
            db_session.commit()

    except Exception as e:
        logger.error(f"Failed to analyze comment {comment_id}: {e}")

def comment_to_response(comment: Comment, current_user_id: Optional[int] = None, db: Session = None) -> dict:
    """Convert Comment model to response dict with user_name and like info"""
    # Get like count
    like_count = 0
    user_has_liked = False

    if db:
        like_count = db.query(func.count(Like.like_id)).filter(Like.comment_id == comment.comment_id).scalar() or 0

        if current_user_id:
            user_has_liked = db.query(Like).filter(
                Like.user_id == current_user_id,
                Like.comment_id == comment.comment_id
            ).first() is not None

    return {
        "comment_id": comment.comment_id,
        "post_id": comment.post_id,
        "user_id": comment.user_id,
        "user_name": comment.user.user_name,
        "content": comment.content,
        "created_at": comment.created_at,
        "updated_at": comment.analyzed_at or comment.created_at,  # Use analyzed_at as proxy for updated_at
        "parent_comment_id": comment.parent_comment_id,
        "sentiment_label": comment.sentiment_label,
        "sentiment_confidence": comment.sentiment_confidence,
        "is_sarcastic": comment.is_sarcastic,
        "sarcasm_confidence": comment.sarcasm_confidence,
        "like_count": like_count,
        "user_has_liked": user_has_liked
    }

@router.post("/{post_id}/comments", response_model=CommentResponse)
def create_comment(
    post_id: int,
    comment: CommentCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if post exists
    post = db.query(Post).filter(Post.post_id == post_id, Post.is_deleted == False).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Create comment
    db_comment = Comment(
        post_id=post_id,
        user_id=current_user.user_id,
        content=comment.content,
        parent_comment_id=comment.parent_comment_id
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)

    # Analyze content in background
    background_tasks.add_task(analyze_comment_content, db_comment.comment_id, comment.content, db)

    return comment_to_response(db_comment, current_user.user_id, db)

@router.get("/{post_id}/comments", response_model=List[CommentResponse])
def get_comments(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = None
):
    """Get all comments for a post - public endpoint"""
    comments = db.query(Comment).join(User).filter(Comment.post_id == post_id).all()

    current_user_id = current_user.user_id if current_user else None
    return [comment_to_response(comment, current_user_id, db) for comment in comments]


@router.put("/{post_id}/comments/{comment_id}", response_model=CommentResponse)
def update_comment(
    post_id: int,
    comment_id: int,
    comment_update: CommentUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update comment content"""
    comment = db.query(Comment).join(User).filter(
        Comment.comment_id == comment_id,
        Comment.post_id == post_id
    ).first()

    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if comment.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this comment")

    if comment_update.content is not None:
        comment.content = comment_update.content
        # Re-analyze content
        background_tasks.add_task(analyze_comment_content, comment.comment_id, comment.content, db)

    db.commit()
    db.refresh(comment)
    return comment_to_response(comment, current_user.user_id, db)


@router.delete("/{post_id}/comments/{comment_id}")
def delete_comment(
    post_id: int,
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a comment"""
    comment = db.query(Comment).filter(
        Comment.comment_id == comment_id,
        Comment.post_id == post_id
    ).first()

    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if comment.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")

    db.delete(comment)
    db.commit()

    return {"message": "Comment deleted successfully"}


@router.post("/{post_id}/comments/{comment_id}/like")
def like_comment(
    post_id: int,
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Like a comment"""
    # Check if comment exists
    comment = db.query(Comment).filter(
        Comment.comment_id == comment_id,
        Comment.post_id == post_id
    ).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    # Check if already liked
    existing_like = db.query(Like).filter(
        Like.user_id == current_user.user_id,
        Like.comment_id == comment_id
    ).first()

    if existing_like:
        raise HTTPException(status_code=400, detail="Comment already liked")

    # Create like
    like = Like(user_id=current_user.user_id, comment_id=comment_id)
    db.add(like)
    db.commit()

    return {"message": "Comment liked successfully"}


@router.delete("/{post_id}/comments/{comment_id}/like")
def unlike_comment(
    post_id: int,
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Unlike a comment"""
    like = db.query(Like).filter(
        Like.user_id == current_user.user_id,
        Like.comment_id == comment_id
    ).first()

    if not like:
        raise HTTPException(status_code=404, detail="Like not found")

    db.delete(like)
    db.commit()

    return {"message": "Comment unliked successfully"}


@router.get("/{post_id}/comments/{comment_id}/likes")
def get_comment_likes(
    post_id: int,
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get like statistics for a comment"""
    # Check if comment exists
    comment = db.query(Comment).filter(
        Comment.comment_id == comment_id,
        Comment.post_id == post_id
    ).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    # Get total likes
    total_likes = db.query(func.count(Like.like_id)).filter(Like.comment_id == comment_id).scalar()

    # Check if current user liked it
    user_has_liked = db.query(Like).filter(
        Like.user_id == current_user.user_id,
        Like.comment_id == comment_id
    ).first() is not None

    return {
        "total_likes": total_likes,
        "user_has_liked": user_has_liked
    }
