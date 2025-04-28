from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List
import os
from . import crud, models, schemas
from .database import engine, get_db
from .schemas import Video as VideoSchema

# Create all database tables
models.Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI()

# Configure CORS (Cross-Origin Resource Sharing) settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow requests from all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Mount static directories for serving video and thumbnail files
app.mount("/static/videos", StaticFiles(directory="videos"), name="videos")
app.mount("/static/thumbnails", StaticFiles(directory="thumbnails"), name="thumbnails")

# Endpoint to upload a video and an optional thumbnail
@app.post("/videos/", response_model=schemas.Video)
async def create_video(
    title: str = Form(...),
    description: str = Form(None),
    video_file: UploadFile = File(...),
    thumbnail_file: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    # Validate the video file type
    if video_file.content_type != 'video/mp4':
        raise HTTPException(status_code=400, detail="Invalid video format. Only .mp4 is allowed.")
    
    video_content = await video_file.read()
    
    # Validate video size (max 10 MB)
    if len(video_content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Video file is too large. Maximum size is 10 MB.")
    
    await video_file.seek(0)

    # Save the video file
    video_filename = f"{crud.generate_unique_filename()}.mp4"
    video_path = os.path.join("videos", video_filename)
    with open(video_path, "wb") as buffer:
        buffer.write(video_content)
    
    # Handle the optional thumbnail
    thumbnail_path = None
    if thumbnail_file:
        # Validate thumbnail format (only .jpg allowed)
        if thumbnail_file.content_type != 'image/jpeg':
            raise HTTPException(status_code=400, detail="Invalid thumbnail format. Only .jpg is allowed.")
        
        thumbnail_content = await thumbnail_file.read()
        
        # Validate thumbnail size (max 2 MB)
        if len(thumbnail_content) > 2 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Thumbnail file is too large. Maximum size is 2 MB.")
        
        await thumbnail_file.seek(0)
        
        # Save the thumbnail file
        thumbnail_filename = f"{crud.generate_unique_filename()}.jpg"
        thumbnail_path = os.path.join("thumbnails", thumbnail_filename)
        with open(thumbnail_path, "wb") as buffer:
            buffer.write(thumbnail_content)
    
    # Create video data for database
    video_data = schemas.VideoCreate(title=title, description=description)
    db_video = crud.create_video(db, video_data, video_path, thumbnail_path)
    
    return db_video

# Endpoint to get a list of videos with pagination
@app.get("/videos/", response_model=List[schemas.Video])
def read_videos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    videos = crud.get_videos(db, skip=skip, limit=limit)
    favorite_video_ids = crud.get_favorite_video_ids(db)
    video_list = []
    
    # Add 'is_favorite' field to each video in the list
    for video in videos:
        video_data = VideoSchema.model_validate(video)
        video_data.is_favorite = video.id in favorite_video_ids
        video_list.append(video_data)
    
    return video_list

# Endpoint to get details of a specific video by ID
@app.get("/videos/{video_id}", response_model=schemas.Video)
def read_video(video_id: int, db: Session = Depends(get_db)):
    db_video = crud.increment_video_views(db, video_id=video_id)
    if db_video is None:
        raise HTTPException(status_code=404, detail="Video not found")
    
    is_favorite = crud.is_video_favorite(db, video_id=video_id)
    video_data = schemas.Video.model_validate(db_video)
    video_data.is_favorite = is_favorite
    return video_data

# Endpoint to post a comment on a specific video
@app.post("/videos/{video_id}/comments/", response_model=schemas.Comment)
def create_comment(video_id: int, comment: schemas.CommentCreate, db: Session = Depends(get_db)):
    return crud.create_comment(db=db, comment=comment, video_id=video_id)

# Endpoint to get all comments for a specific video
@app.get("/videos/{video_id}/comments/", response_model=List[schemas.Comment])
def read_comments(video_id: int, db: Session = Depends(get_db)):
    comments = crud.get_comments(db, video_id=video_id)
    return comments

# Endpoint to add a video to favorites
@app.put("/favorites/", response_model=schemas.FavoriteVideo)
def create_favorite(favorite: schemas.FavoriteVideoCreate, db: Session = Depends(get_db)):
    return crud.create_favorite_video(db=db, favorite=favorite)

# Endpoint to remove a video from favorites
@app.delete("/favorites/{video_id}", response_model=schemas.FavoriteVideo)
def remove_favorite(video_id: int, db: Session = Depends(get_db)):
    db_favorite = crud.remove_favorite_video(db, video_id=video_id)
    if db_favorite is None:
        raise HTTPException(status_code=404, detail="Favorite video not found")
    return db_favorite

# Endpoint to get a list of favorite videos
@app.get("/favorites/", response_model=List[schemas.FavoriteVideo])
def read_favorites(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    favorites = crud.get_favorite_videos(db, skip=skip, limit=limit)
    return favorites

# Endpoint to search for videos by query
@app.get("/search/", response_model=List[schemas.Video])
def search_videos(query: str, db: Session = Depends(get_db)):
    videos = crud.search_videos(db, query)
    favorite_video_ids = crud.get_favorite_video_ids(db)
    
    # Add 'is_favorite' field to each video in the search result
    for video in videos:
        video.is_favorite = video.id in favorite_video_ids
    
    return videos

# Endpoint to get the most viewed videos
@app.get("/most-viewed/", response_model=List[schemas.Video])
def get_most_viewed_videos(limit: int = 10, db: Session = Depends(get_db)):
    videos = crud.get_most_viewed_videos(db, limit=limit)
    favorite_video_ids = crud.get_favorite_video_ids(db)
    
    # Add 'is_favorite' field to each video in the most viewed list
    for video in videos:
        video.is_favorite = video.id in favorite_video_ids
    
    return videos
