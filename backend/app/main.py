from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from app.database import engine, Base
from app.api.v1 import auth, users, posts, comments
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Social Media API with AI Sentiment Analysis",
    description="A comprehensive social media platform with AI-powered sentiment and sarcasm detection",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,  # Cache preflight response for 1 hour
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["db.varunadhityagb.live", "localhost", "127.0.0.1"]
)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["authentication"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(posts.router, prefix="/api/v1/posts", tags=["posts"])
app.include_router(comments.router, prefix="/api/v1/posts", tags=["comments"])

@app.get("/")
def root():
    return {"message": "Social Media API with AI Sentiment Analysis is running!"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "social-media-api"}
