# app/services/file_service.py
import os
import uuid
from werkzeug.utils import secure_filename
from werkzeug.datastructures import FileStorage
from PIL import Image
from typing import Optional, Tuple
from flask import current_app
import logging

logger = logging.getLogger(__name__)

class FileService:
    """File upload and management service"""
    
    @staticmethod
    def allowed_file(filename: str, allowed_extensions: set) -> bool:
        """Check if file extension is allowed"""
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in allowed_extensions
    
    @staticmethod
    def generate_unique_filename(original_filename: str) -> str:
        """Generate unique filename while preserving extension"""
        ext = original_filename.rsplit('.', 1)[1].lower() if '.' in original_filename else ''
        unique_name = f"{uuid.uuid4().hex}"
        return f"{unique_name}.{ext}" if ext else unique_name
    
    @staticmethod
    def save_profile_picture(file: FileStorage, user_id: int) -> Tuple[Optional[str], Optional[str]]:
        """
        Save profile picture with validation and optimization
        
        Args:
            file: Uploaded file object
            user_id: User ID (for filename)
        
        Returns:
            Tuple of (relative_path, error_message)
            relative_path is None if error occurred
        """
        # Validate file
        if not file or file.filename == '':
            return None, "No file provided"
        
        allowed_extensions = current_app.config['ALLOWED_PROFILE_EXTENSIONS']
        if not FileService.allowed_file(file.filename, allowed_extensions):
            return None, f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
        
        # Check file size
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        max_size = current_app.config['MAX_PROFILE_PIC_SIZE']
        if file_size > max_size:
            return None, f"File too large. Max size: {max_size // (1024*1024)} MB"
        
        # Generate filename
        filename = FileService.generate_unique_filename(file.filename)
        filepath = os.path.join(current_app.config['PROFILE_PICS_FOLDER'], filename)
        
        # Ensure directory exists
        os.makedirs(current_app.config['PROFILE_PICS_FOLDER'], exist_ok=True)
        
        try:
            # Open and process image
            image = Image.open(file)
            
            # Convert RGBA/LA/P to RGB
            if image.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', image.size, (255, 255, 255))
                if image.mode == 'RGBA':
                    background.paste(image, mask=image.split()[-1])
                else:
                    background.paste(image)
                image = background
            
            # Resize if too large (max 800x800)
            max_dimension = 800
            if image.width > max_dimension or image.height > max_dimension:
                image.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)
            
            # Save with optimization
            image.save(filepath, optimize=True, quality=85)
            
            # Return relative path for database storage
            relative_path = f"profile_pics/{filename}"
            logger.info(f"✅ Profile picture saved: {relative_path}")
            return relative_path, None
            
        except Exception as e:
            logger.error(f"❌ Failed to process image: {e}")
            return None, f"Failed to process image: {str(e)}"
    
    @staticmethod
    def save_agenda(file: FileStorage, meeting_id: int) -> Tuple[Optional[str], Optional[str]]:
        """
        Save meeting agenda PDF
        
        Args:
            file: Uploaded file object
            meeting_id: Meeting ID (for filename)
        
        Returns:
            Tuple of (relative_path, error_message)
        """
        # Validate file
        if not file or file.filename == '':
            return None, "No file provided"
        
        allowed_extensions = current_app.config['ALLOWED_AGENDA_EXTENSIONS']
        if not FileService.allowed_file(file.filename, allowed_extensions):
            return None, "Only PDF files are allowed for agendas"
        
        # Check file size
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        max_size = current_app.config['MAX_AGENDA_SIZE']
        if file_size > max_size:
            return None, f"File too large. Max size: {max_size // (1024*1024)} MB"
        
        # Generate filename with meeting ID
        ext = file.filename.rsplit('.', 1)[1].lower()
        filename = f"agenda_{meeting_id}_{uuid.uuid4().hex[:8]}.{ext}"
        filepath = os.path.join(current_app.config['AGENDAS_FOLDER'], filename)
        
        # Ensure directory exists
        os.makedirs(current_app.config['AGENDAS_FOLDER'], exist_ok=True)
        
        try:
            # Save file
            file.save(filepath)
            
            # Validate PDF (optional)
            try:
                import PyPDF2
                with open(filepath, 'rb') as f:
                    pdf = PyPDF2.PdfReader(f)
                    # Just check if it's a valid PDF
                    _ = len(pdf.pages)
            except:
                os.remove(filepath)
                return None, "Invalid PDF file"
            
            relative_path = f"agendas/{filename}"
            logger.info(f"✅ Agenda saved: {relative_path}")
            return relative_path, None
            
        except Exception as e:
            logger.error(f"❌ Failed to save file: {e}")
            return None, f"Failed to save file: {str(e)}"
    
    @staticmethod
    def delete_file(relative_path: str) -> bool:
        """
        Delete file from storage
        
        Args:
            relative_path: Relative path (e.g., "profile_pics/abc123.jpg")
        
        Returns:
            True if deleted successfully
        """
        if not relative_path:
            return True
        
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], relative_path)
        
        try:
            if os.path.exists(filepath):
                os.remove(filepath)
                logger.info(f"✅ File deleted: {relative_path}")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to delete file {filepath}: {e}")
            return False
    
    @staticmethod
    def get_file_url(relative_path: Optional[str]) -> Optional[str]:
        """
        Convert relative path to full URL
        
        Args:
            relative_path: Relative path (e.g., "profile_pics/abc123.jpg")
        
        Returns:
            Full URL or None
        """
        if not relative_path:
            return None
        
        from flask import url_for
        return url_for('media.serve_media', filepath=relative_path, _external=True)

