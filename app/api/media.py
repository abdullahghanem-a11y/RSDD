# app/api/media.py
from flask import Blueprint, send_from_directory, abort, current_app
from app.utils.decorators import jwt_required_with_user
import os

media_bp = Blueprint('media', __name__, url_prefix='/media')

@media_bp.route('/<path:filepath>')
@jwt_required_with_user
def serve_media(filepath):
    """
    Serve uploaded files with authentication
    
    URL: /media/profile_pics/abc123.jpg
    URL: /media/agendas/agenda_42_def456.pdf
    
    Security:
        - Requires authentication
        - Prevents directory traversal
        - Only serves from allowed directories
    """
    # Security: Prevent directory traversal
    if '..' in filepath or filepath.startswith('/'):
        abort(400, description="Invalid file path")
    
    # Determine subfolder and filename
    if filepath.startswith('profile_pics/'):
        directory = current_app.config['PROFILE_PICS_FOLDER']
        filename = filepath.replace('profile_pics/', '')
    elif filepath.startswith('agendas/'):
        directory = current_app.config['AGENDAS_FOLDER']
        filename = filepath.replace('agendas/', '')
    else:
        abort(404, description="File not found")
    
    # Check if file exists
    full_path = os.path.join(directory, filename)
    if not os.path.exists(full_path):
        abort(404, description="File not found")
    
    # Serve file
    return send_from_directory(directory, filename)

