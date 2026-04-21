import os
import uuid
from pathlib import Path
from PIL import Image
import io
from fastapi import UploadFile, HTTPException
from src.config import get_settings
from src.logger import logger

settings = get_settings()

class ImageService:
    """Service for handling image uploads, WebP conversion, and deletion."""
    
    ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    MAX_FILE_SIZE_MB = 5
    MAX_DIMENSIONS = (1200, 1200)  # Standardize for web performance
    OUTPUT_QUALITY = 80             # WebP quality

    @staticmethod
    async def save_image(
        upload_file: UploadFile,
        subfolder: str,  # "events", "profiles", "tenants"
    ) -> str:
        """
        Saves and converts uploaded image to WebP format.
        Optimizes for size and performance.
        """
        # 1. Validate content type
        if upload_file.content_type not in ImageService.ALLOWED_CONTENT_TYPES:
            raise HTTPException(
                status_code=422,
                detail=f"Geçersiz dosya türü. İzin verilenler: JPEG, PNG, WebP"
            )

        # 2. Read and validate file size
        content = await upload_file.read()
        size_mb = len(content) / (1024 * 1024)
        if size_mb > ImageService.MAX_FILE_SIZE_MB:
            raise HTTPException(
                status_code=422,
                detail=f"Dosya boyutu {ImageService.MAX_FILE_SIZE_MB}MB'ı aşamaz. (Gönderilen: {size_mb:.1f}MB)"
            )

        # 3. Open image with PIL
        try:
            image = Image.open(io.BytesIO(content))
        except Exception as e:
            logger.error(f"Image open error: {e}")
            raise HTTPException(status_code=422, detail="Geçersiz görsel dosyası.")

        # 4. Handle transparency and formats
        if image.mode in ("RGBA", "P"):
            image = image.convert("RGB")
        elif image.mode != "RGB":
            image = image.convert("RGB")

        # 5. Resize if too large (aspect ratio preserved)
        image.thumbnail(ImageService.MAX_DIMENSIONS, Image.Resampling.LANCZOS)

        # 6. Prepare save directory
        save_dir = Path(settings.UPLOAD_DIR) / subfolder
        save_dir.mkdir(parents=True, exist_ok=True)

        # 7. Generate unique name
        filename = f"{uuid.uuid4()}.webp"
        file_path = save_dir / filename

        # 8. Save as WebP
        try:
            image.save(file_path, "WEBP", quality=ImageService.OUTPUT_QUALITY)
        except Exception as e:
            logger.error(f"Image save error: {e}")
            raise HTTPException(status_code=500, detail="Görsel kaydedilirken bir hata oluştu.")

        # 9. Return relative path for web access
        return f"/uploads/{subfolder}/{filename}"

    @staticmethod
    def delete_image(image_path: str | None) -> None:
        """Removes the file from disk."""
        if not image_path:
            return
            
        relative_path = image_path.replace("/uploads/", "")
        full_path = Path(settings.UPLOAD_DIR) / relative_path
        
        try:
            if full_path.exists():
                full_path.unlink()
        except Exception as e:
            logger.warning(f"Failed to delete image {full_path}: {e}")
