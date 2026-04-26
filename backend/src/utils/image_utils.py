import os
import uuid
from PIL import Image
from pathlib import Path
from fastapi import UploadFile

UPLOAD_DIR = Path("uploads/profile_images")
MAX_SIZE = (400, 400) # Standard avatar size

def ensure_upload_dir():
    """Creates the upload directory if it doesn't exist."""
    if not UPLOAD_DIR.exists():
        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

async def process_and_save_avatar(file: UploadFile, user_id: uuid.UUID) -> str:
    """
    Processes the uploaded image:
    1. Resizes to 400x400 (aspect ratio maintained with thumbnail).
    2. Converts to WebP format with 80% quality.
    3. Saves to local filesystem.
    Returns the relative path to the saved file.
    """
    ensure_upload_dir()
    
    # Generate unique filename using user_id to ensure one image per user
    filename = f"{user_id}.webp"
    file_path = UPLOAD_DIR / filename
    
    # Open image using Pillow
    img = Image.open(file.file)
    
    # Convert to RGB if necessary (e.g. for PNG with transparency)
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")
        
    # Resize keeping aspect ratio
    img.thumbnail(MAX_SIZE)
    
    # Save as WebP
    img.save(file_path, "WEBP", quality=80)
    
    return f"/{UPLOAD_DIR}/{filename}"
