# ============================================================================
# CARTOON STREAMING PLATFORM - PYTHON BACKEND
# FastAPI + SQLite for production-grade video streaming
# ============================================================================

from fastapi import FastAPI, File, UploadFile, HTTPException, Query, Depends, Response
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, JSON, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from datetime import datetime
from typing import Optional, List
import os
import shutil
from pathlib import Path
import mimetypes

# ============================================================================
# DATABASE SETUP
# ============================================================================

DATABASE_URL = "sqlite:///./cartoons.db"
UPLOAD_DIRECTORY = Path("./uploads/videos")
THUMBNAILS_DIRECTORY = Path("./uploads/thumbnails")

# Create directories if they don't exist
UPLOAD_DIRECTORY.mkdir(parents=True, exist_ok=True)
THUMBNAILS_DIRECTORY.mkdir(parents=True, exist_ok=True)

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ============================================================================
# DATABASE MODELS
# ============================================================================

class Cartoon(Base):
    """Cartoon series model"""
    __tablename__ = "cartoons"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, unique=True, index=True)
    description = Column(String)
    image_url = Column(String)
    rating = Column(Float, default=8.5)
    year = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    categories = relationship("Category", back_populates="cartoon", cascade="all, delete-orphan")
    episodes = relationship("Episode", back_populates="cartoon", cascade="all, delete-orphan")

class Category(Base):
    """Category (Season, Arc, etc.) model"""
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    cartoon_id = Column(Integer, ForeignKey("cartoons.id"))
    name = Column(String, index=True)
    order = Column(Integer, default=0)
    
    # Relationships
    cartoon = relationship("Cartoon", back_populates="categories")
    episodes = relationship("Episode", back_populates="category", cascade="all, delete-orphan")

class Episode(Base):
    """Episode model"""
    __tablename__ = "episodes"

    id = Column(Integer, primary_key=True, index=True)
    cartoon_id = Column(Integer, ForeignKey("cartoons.id"))
    category_id = Column(Integer, ForeignKey("categories.id"))
    episode_number = Column(Integer)
    name = Column(String, index=True)
    description = Column(String)
    video_path = Column(String)  # Path to video file
    duration = Column(Integer)  # Duration in seconds
    thumbnail_url = Column(String)
    audio_languages = Column(JSON, default=["english"])  # Available audio languages
    upload_date = Column(DateTime, default=datetime.utcnow)
    views = Column(Integer, default=0)
    
    # Relationships
    cartoon = relationship("Cartoon", back_populates="episodes")
    category = relationship("Category", back_populates="episodes")

# Create tables
Base.metadata.create_all(bind=engine)

# ============================================================================
# PYDANTIC MODELS (Request/Response schemas)
# ============================================================================

class EpisodeCreate(BaseModel):
    episode_number: int
    name: str
    description: str = ""
    duration: int = 1440  # Default 24 minutes in seconds
    audio_languages: list = ["english"]

class EpisodeResponse(BaseModel):
    id: int
    episode_number: int
    name: str
    description: str
    duration: int
    audio_languages: list
    thumbnail_url: Optional[str] = None
    upload_date: datetime
    views: int

    class Config:
        from_attributes = True

class CategoryCreate(BaseModel):
    name: str
    order: int = 0

class CategoryResponse(BaseModel):
    id: int
    name: str
    order: int
    episodes: List[EpisodeResponse] = []

    class Config:
        from_attributes = True

class CartoonCreate(BaseModel):
    title: str
    description: str
    image_url: str = ""
    rating: float = 8.5
    year: int = 2024

class CartoonResponse(BaseModel):
    id: int
    title: str
    description: str
    image_url: str
    rating: float
    year: int
    created_at: datetime
    categories: List[CategoryResponse] = []
    episodes: List[EpisodeResponse] = []

    class Config:
        from_attributes = True

# ============================================================================
# FASTAPI APP INITIALIZATION
# ============================================================================

app = FastAPI(
    title="Cartoon Streaming Platform API",
    description="Backend API for Netflix-style cartoon streaming",
    version="1.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for video/image serving
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.mount("/static", StaticFiles(directory="frontend"), name="static")

# ============================================================================
# DEPENDENCY INJECTION
# ============================================================================

def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ============================================================================
# CARTOON ENDPOINTS
# ============================================================================

@app.post("/api/cartoons", response_model=CartoonResponse, tags=["Cartoons"])
def create_cartoon(cartoon: CartoonCreate, db: Session = Depends(get_db)):
    """Create a new cartoon series"""
    # Check if cartoon already exists
    existing = db.query(Cartoon).filter(Cartoon.title == cartoon.title).first()
    if existing:
        raise HTTPException(status_code=400, detail="Cartoon already exists")
    
    db_cartoon = Cartoon(**cartoon.dict())
    db.add(db_cartoon)
    db.commit()
    db.refresh(db_cartoon)
    return db_cartoon

@app.get("/api/cartoons", response_model=List[CartoonResponse], tags=["Cartoons"])
def get_cartoons(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    """Get all cartoons with pagination"""
    cartoons = db.query(Cartoon).offset(skip).limit(limit).all()
    return cartoons

@app.get("/api/cartoons/{cartoon_id}", response_model=CartoonResponse, tags=["Cartoons"])
def get_cartoon(cartoon_id: int, db: Session = Depends(get_db)):
    """Get a specific cartoon by ID"""
    cartoon = db.query(Cartoon).filter(Cartoon.id == cartoon_id).first()
    if not cartoon:
        raise HTTPException(status_code=404, detail="Cartoon not found")
    return cartoon

@app.get("/api/cartoons/search", response_model=List[CartoonResponse], tags=["Cartoons"])
def search_cartoons(q: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    """Search cartoons by title"""
    cartoons = db.query(Cartoon).filter(Cartoon.title.ilike(f"%{q}%")).all()
    return cartoons

# ============================================================================
# CATEGORY ENDPOINTS
# ============================================================================

@app.post("/api/cartoons/{cartoon_id}/categories", response_model=CategoryResponse, tags=["Categories"])
def create_category(cartoon_id: int, category: CategoryCreate, db: Session = Depends(get_db)):
    """Create a new category/season for a cartoon"""
    cartoon = db.query(Cartoon).filter(Cartoon.id == cartoon_id).first()
    if not cartoon:
        raise HTTPException(status_code=404, detail="Cartoon not found")
    
    db_category = Category(cartoon_id=cartoon_id, **category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@app.get("/api/cartoons/{cartoon_id}/categories", response_model=List[CategoryResponse], tags=["Categories"])
def get_categories(cartoon_id: int, db: Session = Depends(get_db)):
    """Get all categories for a cartoon"""
    cartoon = db.query(Cartoon).filter(Cartoon.id == cartoon_id).first()
    if not cartoon:
        raise HTTPException(status_code=404, detail="Cartoon not found")
    
    categories = db.query(Category).filter(Category.cartoon_id == cartoon_id).order_by(Category.order).all()
    return categories

# ============================================================================
# EPISODE ENDPOINTS
# ============================================================================

@app.post("/api/cartoons/{cartoon_id}/categories/{category_id}/episodes", tags=["Episodes"])
async def upload_episode(
    cartoon_id: int,
    category_id: int,
    file: UploadFile = File(...),
    thumbnail: Optional[UploadFile] = File(None),
    episode_number: int = 1,
    name: str = "Episode",
    description: str = "",
    duration: int = 1440,
    db: Session = Depends(get_db)
):
    """Upload a new episode video and optional thumbnail"""
    
    # Validate cartoon and category exist
    cartoon = db.query(Cartoon).filter(Cartoon.id == cartoon_id).first()
    if not cartoon:
        raise HTTPException(status_code=404, detail="Cartoon not found")
    
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Save video file
    file_extension = Path(file.filename).suffix or ".mp4"
    safe_filename = f"{cartoon_id}_{category_id}_{episode_number}{file_extension}"
    file_path = UPLOAD_DIRECTORY / safe_filename
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Video upload failed: {str(e)}")

    thumbnail_url = None
    if thumbnail is not None and thumbnail.filename:
        thumb_ext = Path(thumbnail.filename).suffix or ".png"
        thumb_filename = f"{cartoon_id}_{category_id}_{episode_number}_thumb{thumb_ext}"
        thumb_path = THUMBNAILS_DIRECTORY / thumb_filename
        try:
            with open(thumb_path, "wb") as thumb_buffer:
                shutil.copyfileobj(thumbnail.file, thumb_buffer)
            thumbnail_url = f"/uploads/thumbnails/{thumb_filename}"
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Thumbnail upload failed: {str(e)}")

    # Create episode record
    db_episode = Episode(
        cartoon_id=cartoon_id,
        category_id=category_id,
        episode_number=episode_number,
        name=name,
        description=description,
        video_path=f"/uploads/videos/{safe_filename}",
        thumbnail_url=thumbnail_url,
        duration=duration,
    )
    
    db.add(db_episode)
    db.commit()
    db.refresh(db_episode)
    
    return {
        "id": db_episode.id,
        "message": "Episode uploaded successfully",
        "video_path": db_episode.video_path,
        "thumbnail_url": db_episode.thumbnail_url
    }

@app.get("/api/cartoons/{cartoon_id}/categories/{category_id}/episodes", tags=["Episodes"])
def get_episodes(
    cartoon_id: int,
    category_id: int,
    db: Session = Depends(get_db)
):
    """Get all episodes for a category"""
    
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    episodes = db.query(Episode).filter(Episode.category_id == category_id).order_by(Episode.episode_number).all()
    
    return [
        {
            "id": ep.id,
            "episode_number": ep.episode_number,
            "name": ep.name,
            "description": ep.description,
            "duration": ep.duration,
            "video_path": ep.video_path,
            "audio_languages": ep.audio_languages,
            "upload_date": ep.upload_date,
            "views": ep.views
        }
        for ep in episodes
    ]

@app.get("/api/episodes/{episode_id}/watch", tags=["Episodes"])
def watch_episode(episode_id: int, db: Session = Depends(get_db)):
    """Get episode details for watching"""
    episode = db.query(Episode).filter(Episode.id == episode_id).first()
    if not episode:
        raise HTTPException(status_code=404, detail="Episode not found")
    
    # Increment view count
    episode.views += 1
    db.commit()
    
    return {
        "id": episode.id,
        "name": episode.name,
        "video_url": episode.video_path,
        "duration": episode.duration,
        "audio_languages": episode.audio_languages,
        "views": episode.views
    }

# ============================================================================
# HEALTH CHECK & STATS
# ============================================================================

@app.get("/api/health", tags=["Health"])
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Cartoon Streaming Platform API",
        "version": "1.0.0"
    }

@app.get("/api/stats", tags=["Stats"])
def get_stats(db: Session = Depends(get_db)):
    """Get platform statistics"""
    total_cartoons = db.query(Cartoon).count()
    total_episodes = db.query(Episode).count()
    total_views = db.query(Episode).with_entities(func.sum(Episode.views)).scalar() or 0
    
    return {
        "total_cartoons": total_cartoons,
        "total_episodes": total_episodes,
        "total_views": int(total_views),
        "storage_used_gb": sum(
            os.path.getsize(f) / (1024 ** 3)
            for f in UPLOAD_DIRECTORY.glob("*")
            if f.is_file()
        )
    }

# ============================================================================
# ROOT ENDPOINT
# ============================================================================

@app.get("/", tags=["Root"])
def read_root():
    """Serve the frontend UI if available, otherwise show API details."""
    index_path = Path("frontend/index.html")
    if index_path.exists():
        return FileResponse(index_path)
    return {
        "message": "Welcome to Cartoon Streaming Platform API",
        "documentation": "/docs",
        "endpoints": {
            "cartoons": "/api/cartoons",
            "categories": "/api/cartoons/{cartoon_id}/categories",
            "episodes": "/api/cartoons/{cartoon_id}/categories/{category_id}/episodes",
            "health": "/api/health",
            "stats": "/api/stats"
        }
    }

@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    """Return no content for favicon requests to prevent browser 404 errors."""
    return Response(status_code=204)

# ============================================================================
# STARTUP EVENT
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Initialize database with sample data"""
    db = SessionLocal()
    
    # Check if data already exists
    if db.query(Cartoon).count() == 0:
        # Sample data
        cartoon1 = Cartoon(
            title="Ben 10",
            description="Ben discovers a mysterious device and becomes the hero Ben 10!",
            image_url="https://via.placeholder.com/400x225?text=Ben+10",
            rating=8.8,
            year=2005
        )
        db.add(cartoon1)
        db.commit()
        db.refresh(cartoon1)
        
        # Add categories
        cat1 = Category(cartoon_id=cartoon1.id, name="Ben 10", order=0)
        cat2 = Category(cartoon_id=cartoon1.id, name="Omnitrix", order=1)
        cat3 = Category(cartoon_id=cartoon1.id, name="Omniverse", order=2)
        
        db.add_all([cat1, cat2, cat3])
        db.commit()
        
        print("✅ Sample data initialized successfully!")
    
    db.close()

# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Custom HTTP exception handler"""
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail}
    )

# ============================================================================
# RUN SERVER
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    print("""
    ╔════════════════════════════════════════════════════════════════╗
    ║        CARTOON STREAMING PLATFORM - BACKEND SERVER            ║
    ║  🎬 Starting server on http://localhost:8000                  ║
    ║  📚 API Docs available at http://localhost:8000/docs          ║
    ║  ⚙️ Admin panel will be available via frontend                ║
    ╚════════════════════════════════════════════════════════════════╝
    """)
    uvicorn.run(app, host="0.0.0.0", port=8000)
