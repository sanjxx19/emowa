from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List, Optional
from app.database import get_db
from app.api.deps import get_current_user
from app.models.post import Post
from app.models.user import User
from app.schemas.post import PostCreate, PostResponse, PostAnalysis, PostUpdate
from app.services.ai_service import ai_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

def analyze_post_content(post_id: int, content: str, db_session):
    """Background task to analyze post content"""
    try:
        analysis = ai_service.analyze_text_complete(content)

        # Update post with analysis results
        post = db_session.query(Post).filter(Post.post_id == post_id).first()
        if post:
            post.sentiment_label = analysis["sentiment"]["sentiment_label"]
            post.sentiment_confidence = analysis["sentiment"]["confidence"]
            post.is_sarcastic = analysis["sarcasm"]["is_sarcastic"]
            post.sarcasm_confidence = analysis["sarcasm"]["confidence"]
            db_session.commit()

    except Exception as e:
        logger.error(f"Failed to analyze post {post_id}: {e}")

def post_to_response(post: Post) -> dict:
    """Convert Post model to response dict with user_name"""
    return {
        "post_id": post.post_id,
        "title": post.title,
        "content": post.content,
        "user_id": post.user_id,
        "user_name": post.user.user_name,
        "created_at": post.created_at,
        "sentiment_label": post.sentiment_label,
        "sentiment_confidence": post.sentiment_confidence,
        "is_sarcastic": post.is_sarcastic,
        "sarcasm_confidence": post.sarcasm_confidence,
        "analyzed_at": post.analyzed_at
    }

@router.post("/", response_model=PostResponse)
def create_post(
    post: PostCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Create post
    db_post = Post(
        title=post.title,
        content=post.content,
        user_id=current_user.user_id
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)

    # Analyze content in background
    background_tasks.add_task(analyze_post_content, db_post.post_id, post.content, db)

    return post_to_response(db_post)

@router.get("/", response_model=List[PostResponse])
def get_posts(
    skip: int = 0,
    limit: int = 20,
    sentiment_filter: Optional[str] = None,
    include_sarcastic: bool = True,
    db: Session = Depends(get_db)
):
    query = db.query(Post).join(User).filter(Post.is_deleted == False)

    if sentiment_filter:
        query = query.filter(Post.sentiment_label == sentiment_filter.lower())

    if not include_sarcastic:
        query = query.filter(Post.is_sarcastic == False)

    posts = query.order_by(desc(Post.created_at)).offset(skip).limit(limit).all()
    return [post_to_response(post) for post in posts]

@router.get("/{post_id}", response_model=PostResponse)
def get_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).join(User).filter(Post.post_id == post_id, Post.is_deleted == False).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post_to_response(post)

@router.get("/{post_id}/analysis", response_model=PostAnalysis)
def get_post_analysis(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.post_id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    analysis = ai_service.analyze_text_complete(post.content)
    return analysis

@router.post("/analyze", response_model=PostAnalysis)
def analyze_text(text: str):
    if not text:
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    analysis = ai_service.analyze_text_complete(text)
    return analysis

@router.get("/analytics/sentiment")
def get_sentiment_analytics(db: Session = Depends(get_db)):
    # Sentiment distribution
    sentiment_counts = db.query(
        Post.sentiment_label,
        func.count(Post.post_id).label('count')
    ).filter(Post.sentiment_label.isnot(None)).group_by(Post.sentiment_label).all()

    # Sarcasm stats
    total_posts = db.query(func.count(Post.post_id)).filter(Post.is_sarcastic.isnot(None)).scalar()
    sarcastic_posts = db.query(func.count(Post.post_id)).filter(Post.is_sarcastic == True).scalar()

    return {
        "sentiment_distribution": [
            {"sentiment": row.sentiment_label, "count": row.count}
            for row in sentiment_counts
        ],
        "sarcasm_stats": {
            "total_analyzed": total_posts,
            "sarcastic_count": sarcastic_posts,
            "sarcasm_percentage": round((sarcastic_posts / total_posts) * 100, 2) if total_posts > 0 else 0
        }
    }

@router.delete("/{post_id}")
def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    post = db.query(Post).filter(Post.post_id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if post.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")

    post.is_deleted = True
    db.commit()
    return {"message": "Post deleted successfully"}

@router.get("/user/{user_id}", response_model=List[PostResponse])
def get_user_posts(
    user_id: int,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    posts = db.query(Post).join(User).filter(
        Post.user_id == user_id,
        Post.is_deleted == False
    ).order_by(desc(Post.created_at)).offset(skip).limit(limit).all()
    return [post_to_response(post) for post in posts]

@router.put("/{post_id}", response_model=PostResponse)
def update_post(
    post_id: int,
    post_update: PostUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update post title and/or content"""
    post = db.query(Post).join(User).filter(Post.post_id == post_id, Post.is_deleted == False).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if post.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this post")

    if post_update.title is not None:
        post.title = post_update.title

    if post_update.content is not None:
        post.content = post_update.content
        # Re-analyze content if it changed
        background_tasks.add_task(analyze_post_content, post.post_id, post.content, db)

    db.commit()
    db.refresh(post)
    return post_to_response(post)


@router.post("/{post_id}/like")
def like_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Like a post"""
    from app.models.like import Like

    # Check if post exists
    post = db.query(Post).filter(Post.post_id == post_id, Post.is_deleted == False).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Check if already liked
    existing_like = db.query(Like).filter(
        Like.user_id == current_user.user_id,
        Like.post_id == post_id
    ).first()

    if existing_like:
        raise HTTPException(status_code=400, detail="Post already liked")

    # Create like
    like = Like(user_id=current_user.user_id, post_id=post_id)
    db.add(like)
    db.commit()

    return {"message": "Post liked successfully"}


@router.delete("/{post_id}/like")
def unlike_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Unlike a post"""
    from app.models.like import Like

    like = db.query(Like).filter(
        Like.user_id == current_user.user_id,
        Like.post_id == post_id
    ).first()

    if not like:
        raise HTTPException(status_code=404, detail="Like not found")

    db.delete(like)
    db.commit()

    return {"message": "Post unliked successfully"}


@router.get("/{post_id}/likes")
def get_post_likes(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get like statistics for a post"""
    from app.models.like import Like
    from sqlalchemy import func

    # Check if post exists
    post = db.query(Post).filter(Post.post_id == post_id, Post.is_deleted == False).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Get total likes
    total_likes = db.query(func.count(Like.like_id)).filter(Like.post_id == post_id).scalar()

    # Check if current user liked it
    user_has_liked = db.query(Like).filter(
        Like.user_id == current_user.user_id,
        Like.post_id == post_id
    ).first() is not None

    return {
        "total_likes": total_likes,
        "user_has_liked": user_has_liked
    }
