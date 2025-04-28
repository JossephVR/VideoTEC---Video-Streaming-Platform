from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional

# Base model for comment, with text field limited to 100 characters
class CommentBase(BaseModel):
    comment: str = Field(..., max_length=100)

# Model for creating a new comment
class CommentCreate(CommentBase):
    pass

# Model for an existing comment, including ID, video ID, and creation date
class Comment(CommentBase):
    id: int
    video_id: int
    creation_date: datetime

    class Config:
        from_attributes = True

# Base model for video, with title and optional description
class VideoBase(BaseModel):
    title: str = Field(..., max_length=100)
    description: Optional[str] = Field(None, max_length=300)

# Model for creating a new video
class VideoCreate(VideoBase):
    pass

# Model for an existing video, including ID, paths, view count, and associated comments
class Video(VideoBase):
    id: int
    creation_date: datetime
    video_path: str
    thumbnail_path: Optional[str] = None
    views_count: int
    is_favorite: bool = False
    comments: List[Comment] = []

    class Config:
        from_attributes = True

# Base model for favorite video entry, only includes video ID
class FavoriteVideoBase(BaseModel):
    video_id: int

# Model for creating a new favorite video
class FavoriteVideoCreate(FavoriteVideoBase):
    pass

# Model for an existing favorite video, including favorite date and associated video
class FavoriteVideo(FavoriteVideoBase):
    id: int
    favorite_date: datetime
    video: Video

    class Config:
        from_attributes = True
