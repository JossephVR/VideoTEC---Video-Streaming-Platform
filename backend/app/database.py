from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Database URL for SQLite (local file)
SQLALCHEMY_DATABASE_URL = "sqlite:///./videotec.db"

# Create an engine to connect to the database
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Create a session factory for interacting with the database
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all models
Base = declarative_base()

# Dependency to get a database session
def get_db():
    db = SessionLocal()  # Open session
    try:
        yield db  # Return session
    finally:
        db.close()  # Close session after use
