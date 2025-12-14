from __future__ import annotations

from datetime import datetime

from flask import Blueprint, request, g
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    get_jwt,
    JWTManager,
)
from flask_jwt_extended import get_jwt

from app.extensions import db
from app.models.user import User
from app.utils.decorators import jwt_required_with_user
from app.utils.response import success_response, error_response
from app.utils.jwt_blocklist import jwt_blocklist

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    User login endpoint
    """
    data = request.get_json()

    if not data:
        return error_response("Request body is required", status=400)

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return error_response(
            "Username and password are required",
            code="MISSING_CREDENTIALS",
            status=400,
        )

    # Find user
    user = User.query.filter_by(username=username).first()

    if not user or not user.check_password(password):
        return error_response(
            "Invalid username or password",
            code="INVALID_CREDENTIALS",
            status=401,
        )

    if not user.is_active:
        return error_response(
            "Account is disabled",
            code="ACCOUNT_DISABLED",
            status=403,
        )

    # Update last login
    user.last_login = datetime.utcnow()
    db.session.commit()

    # Generate tokens
    # Use string identity to avoid \"Subject must be a string\" errors from some JWT backends
    user_identity = str(user.id)
    access_token = create_access_token(identity=user_identity)
    refresh_token = create_refresh_token(identity=user_identity)

    return success_response(
        {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "Bearer",
            "expires_in": 3600,
            "user": user.to_dict(),
        }
    )


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    """
    Refresh access token using refresh token
    """
    # Identity is stored as string; convert back to int for DB lookup
    user_id = int(get_jwt_identity())

    # Verify user still exists and is active
    user = User.query.get(user_id)
    if not user or not user.is_active:
        return error_response(
            "User not found or inactive",
            code="INVALID_USER",
            status=401,
        )

    # Generate new access token
    access_token = create_access_token(identity=str(user_id))

    return success_response(
        {
            "access_token": access_token,
            "token_type": "Bearer",
            "expires_in": 3600,
        }
    )


@auth_bp.route("/me", methods=["GET"])
@jwt_required_with_user
def get_current_user():
    """
    Get current authenticated user
    """
    user = g.current_user
    return success_response(user.to_dict())


@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    """
    Logout user (client-side token removal)
    """
    jti = get_jwt()["jti"]
    jwt_blocklist.add(jti)
    # Optional: implement token blacklist here
    return success_response(message="Logged out successfully")


@auth_bp.route("/change-password", methods=["PUT"])
@jwt_required_with_user
def change_password():
    """
    Change user password
    """
    user = g.current_user
    data = request.get_json() or {}

    current_password = data.get("current_password")
    new_password = data.get("new_password")
    confirm_password = data.get("confirm_password")

    # Validate
    if not all([current_password, new_password, confirm_password]):
        return error_response("All fields are required", status=400)

    if new_password != confirm_password:
        return error_response("New passwords do not match", status=400)

    if len(new_password) < 8:
        return error_response("Password must be at least 8 characters", status=400)

    # Verify current password
    if not user.check_password(current_password):
        return error_response("Current password is incorrect", status=401)

    # Set new password
    user.set_password(new_password)
    db.session.commit()

    return success_response(message="Password changed successfully")


