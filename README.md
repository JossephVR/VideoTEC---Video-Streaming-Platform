# VideoTEC - Video-Streaming-Platform

## Description

This is a video platform built with a FastAPI backend and a simple JavaScript and HTML frontend. The platform allows users to upload, view, and manage videos, as well as interact with video content through comments and favorites. It supports functionalities such as video search, displaying the most viewed videos, and video uploads with custom thumbnails.

## Features

- **Video Upload**: Upload videos with optional custom thumbnails.
- **Video Display**: View videos with thumbnails, titles, and view counts.
- **Search Functionality**: Search for videos based on keywords.
- **Most Viewed Videos**: Display the most viewed videos.
- **Favorites**: Add videos to favorites and toggle favorite status.
- **Comments**: Post and view comments for each video.

## Tech Stack

### Backend:
- **FastAPI**: A modern web framework for building APIs with Python 3.7+.
- **SQLAlchemy**: ORM for interacting with the SQLite database.
- **SQLite**: A lightweight database for storing video and user data.

### Frontend:
- **HTML**: Markup language for structuring content.
- **JavaScript**: Used for handling video interactions and interactivity on the frontend.
- **CSS (Tailwind)**: A utility-first CSS framework for styling the application.

## Details:

### API Endpoints

#### Videos

- GET /videos/ – Get a list of all videos.

- GET /videos/{id} – Get details of a specific video.

- POST /videos/ – Upload a new video.

- PUT /favorites/ – Add a video to favorites.

- DELETE /favorites/{video_id} – Remove a video from favorites.

- GET /videos/{id}/comments/ – Get comments for a specific video.

- POST /videos/{id}/comments/ – Post a comment for a specific video.

#### Search
- GET /search/ – Search for videos based on a query.

## Setup Instructions

### Backend Setup

#### Create a virtual environment and activate it:

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
```

#### Install dependencies

```bash
pip install -r requirements.txt
```

#### Run the FastAPI server

```bash
uvicorn app.main:app --reload
```

The backend will now be running on http://localhost:8000.

### Frontend Setup
Navigate to the frontend directory
```bash
cd frontend
```

Then run:
```bash
python -m http.server 5500
```

go to http://localhost:5500

Ensure the backend is running and the frontend will be able to interact with it for video uploads, fetching data, and other API calls.

### Database
This project uses SQLite for data storage. The database can be initialized by starting the application, which will automatically create the necessary tables.

# Credits:

## Authors:
- Alejandro Jiménez Ulloa
- Josseph Valverde Robles

