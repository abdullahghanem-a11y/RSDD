# app/api/profile.py
from flask import Blueprint, request, g, url_for
from app.utils.decorators import jwt_required_with_user
from app.utils.response import success_response, error_response
from app.services.file_service import FileService
from app.extensions import db

profile_bp = Blueprint('profile', __name__, url_prefix='/api/profile')

@profile_bp.route('', methods=['GET'])
@jwt_required_with_user
def get_profile():
    """Get current user's profile"""
    user = g.current_user
    return success_response(user.to_dict())


@profile_bp.route('', methods=['PUT'])
@jwt_required_with_user
def update_profile():
    """
    Update current user's profile
    
    Request Body:
        {
            "first_name": "John",
            "last_name": "Doe",
            "address": "Istanbul, Turkey",
            "university": "Istanbul Technical University",
            "title_ids": [1, 3]
        }
    """
    user = g.current_user
    data = request.get_json()
    
    # Update user fields
    if 'first_name' in data:
        user.first_name = data['first_name']
    if 'last_name' in data:
        user.last_name = data['last_name']
    
    # Update profile
    if 'address' in data:
        user.profile.address = data['address']
    
    if 'university' in data:
        user.profile.university = data['university']
        # Auto-generate email
        user.profile.email = user.profile.generate_university_email()
    
    if 'title_ids' in data:
        from app.models.department import Title
        titles = Title.query.filter(Title.id.in_(data['title_ids'])).all()
        user.profile.titles.clear()
        user.profile.titles.extend(titles)
    
    db.session.commit()
    
    return success_response(user.to_dict(), "Profile updated successfully")


@profile_bp.route('/picture', methods=['POST'])
@jwt_required_with_user
def upload_profile_picture():
    """
    Upload profile picture
    
    Request: multipart/form-data
        profile_picture: <file>
    """
    user = g.current_user
    
    if 'profile_picture' not in request.files:
        return error_response("No file provided", status=400)
    
    file = request.files['profile_picture']
    
    # Delete old picture if exists
    if user.profile.profile_picture:
        FileService.delete_file(user.profile.profile_picture)
    
    # Save new picture
    relative_path, error = FileService.save_profile_picture(file, user.id)
    
    if error:
        return error_response(error, status=400)
    
    user.profile.profile_picture = relative_path
    db.session.commit()
    
    # Return URL
    picture_url = url_for('media.serve_media', filepath=relative_path, _external=True)
    
    return success_response({
        'profile_picture': picture_url,
        'relative_path': relative_path
    }, "Profile picture uploaded successfully")


@profile_bp.route('/picture', methods=['DELETE'])
@jwt_required_with_user
def delete_profile_picture():
    """Delete profile picture"""
    user = g.current_user
    
    if not user.profile.profile_picture:
        return error_response("No profile picture to delete", status=400)
    
    # Delete file
    FileService.delete_file(user.profile.profile_picture)
    
    user.profile.profile_picture = None
    db.session.commit()
    
    return success_response(message="Profile picture deleted successfully")

