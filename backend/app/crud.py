from sqlalchemy.orm import Session
from sqlalchemy import or_
from . import models, schemas
from datetime import datetime
import uuid

# Generate a unique filename using UUID
def generate_unique_filename():
    return str(uuid.uuid4())

# Get a specific video by ID
def get_video(db: Session, video_id: int):
    return db.query(models.Video).filter(models.Video.id == video_id).first()

# Get a list of videos, with pagination (skip, limit)
def get_videos(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Video).offset(skip).limit(limit).all()

# Create a new video entry in the database
def create_video(db: Session, video: schemas.VideoCreate, video_path: str, thumbnail_path: str = None):
    db_video = models.Video(**video.dict(), creation_date=datetime.now(), video_path=video_path, thumbnail_path=thumbnail_path)
    db.add(db_video)
    db.commit()
    db.refresh(db_video)
    return db_video

# Get all comments for a specific video
def get_comments(db: Session, video_id: int):
    return db.query(models.Comment).filter(models.Comment.video_id == video_id).all()

# Add a new comment to a video
def create_comment(db: Session, comment: schemas.CommentCreate, video_id: int):
    db_comment = models.Comment(**comment.dict(), video_id=video_id, creation_date=datetime.now())
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

# Get a list of favorite videos, with pagination
def get_favorite_videos(db: Session, skip: int = 0, limit: int = 10):
    return db.query(models.FavoriteVideo).order_by(models.FavoriteVideo.favorite_date.desc()).offset(skip).limit(limit).all()

# Add a video to the user's favorites
def create_favorite_video(db: Session, favorite: schemas.FavoriteVideoCreate):
    # Check if the video is already marked as a favorite
    db_favorite = db.query(models.FavoriteVideo).filter(models.FavoriteVideo.video_id == favorite.video_id).first()

    if db_favorite:
        return db_favorite  # Return the existing favorite entry if it exists

    # Create a new favorite entry if it doesn't exist
    db_favorite = models.FavoriteVideo(**favorite.dict(), favorite_date=datetime.now())
    db.add(db_favorite)
    db.commit()
    db.refresh(db_favorite)
    return db_favorite

# Remove a video from the user's favorites
def remove_favorite_video(db: Session, video_id: int):
    db_favorite = db.query(models.FavoriteVideo).filter(models.FavoriteVideo.video_id == video_id).first()
    if db_favorite:
        db.delete(db_favorite)
        db.commit()
    return db_favorite

# Increment the view count for a video
def increment_video_views(db: Session, video_id: int):
    db_video = db.query(models.Video).filter(models.Video.id == video_id).first()
    if db_video:
        db_video.views_count += 1
        db.commit()
        db.refresh(db_video)
    return db_video

# Search videos by title or description
def search_videos(db: Session, query: str):
    return db.query(models.Video).filter(
        or_(
            models.Video.title.ilike(f"%{query}%"),
            models.Video.description.ilike(f"%{query}%")
        )
    ).all()

# Get the most viewed videos, up to a specified limit
def get_most_viewed_videos(db: Session, limit: int = 10):
    return db.query(models.Video).order_by(models.Video.views_count.desc()).limit(limit).all()

# Check if a video is marked as a favorite
def is_video_favorite(db: Session, video_id: int):
    return db.query(models.FavoriteVideo).filter(models.FavoriteVideo.video_id == video_id).first() is not None

# Get all favorite video IDs
def get_favorite_video_ids(db: Session):
    return {fav.video_id for fav in db.query(models.FavoriteVideo).all()}
