from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

# Video model representing a video entry
class Video(Base):
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)  
    title = Column(String, index=True)  
    description = Column(String) 
    creation_date = Column(DateTime)  
    video_path = Column(String) 
    thumbnail_path = Column(String)  
    views_count = Column(Integer, default=0)  
    comments = relationship("Comment", back_populates="video") 

# Comment model representing a comment on a video
class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)  
    video_id = Column(Integer, ForeignKey("videos.id"))  
    comment = Column(String)  
    creation_date = Column(DateTime)  
    video = relationship("Video", back_populates="comments")  

# FavoriteVideo model representing a user's favorite video
class FavoriteVideo(Base):
    __tablename__ = "favorite_videos"

    id = Column(Integer, primary_key=True, index=True)  
    video_id = Column(Integer, ForeignKey("videos.id"))  
    favorite_date = Column(DateTime)  
    video = relationship("Video", lazy='joined')  
