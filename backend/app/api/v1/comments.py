from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.api.deps import get_current_user
from app.models.comment import Comment
from app.models.post import Post
from app.models.user import User
from app.schemas.comment import CommentCreate, CommentResponse
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

    return db_comment

@router.get("/{post_id}/comments", response_model=List[CommentResponse])
def get_comments(post_id: int, db: Session = Depends(get_db)):
    comments = db.query(Comment).filter(Comment.post_id == post_id).all()
    return comments
