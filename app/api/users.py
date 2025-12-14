from __future__ import annotations

from flask import Blueprint, request, g
from sqlalchemy import or_

from app.extensions import db
from app.models.user import User, UserProfile
from app.utils.decorators import jwt_required_with_user, admin_required
from app.utils.response import (
    success_response,
    error_response,
    paginated_response,
    created_response,
)

users_bp = Blueprint("users", __name__, url_prefix="/api/users")


@users_bp.route("", methods=["GET"])
@jwt_required_with_user
def list_users():
    """
    List all users with pagination and filters.
    """
    # Parse query parameters
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    search = request.args.get("search", "")
    role = request.args.get("role", "")
    is_active = request.args.get("is_active", "")
    sort_by = request.args.get("sort_by", "last_name")
    order = request.args.get("order", "asc")

    # Build query
    query = User.query.join(UserProfile)

    # Apply filters
    if search:
        search_filter = or_(
            User.username.ilike(f"%{search}%"),
            User.first_name.ilike(f"%{search}%"),
            User.last_name.ilike(f"%{search}%"),
            User.email.ilike(f"%{search}%"),
        )
        query = query.filter(search_filter)

    if role:
        query = query.filter(UserProfile.role == role)

    if is_active:
        active = is_active.lower() == "true"
        query = query.filter(User.is_active == active)

    # Apply sorting
    sort_column = getattr(User, sort_by, User.last_name)
    if order == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    # Paginate
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return paginated_response(
        items=[user.to_dict() for user in pagination.items],
        page=page,
        per_page=per_page,
        total=pagination.total,
    )


@users_bp.route("/<int:user_id>", methods=["GET"])
@jwt_required_with_user
def get_user(user_id: int):
    """Get specific user details."""
    user = User.query.get(user_id)

    if not user:
        return error_response("User not found", code="NOT_FOUND", status=404)

    return success_response(user.to_dict())


@users_bp.route("", methods=["POST"])
@admin_required
def create_user():
    """
    Create new user (admin only).
    """
    data = request.get_json() or {}

    # Validate required fields
    required = ["username", "password", "first_name", "last_name"]
    if not all(field in data for field in required):
        return error_response("Missing required fields", status=400)

    # Check if username exists
    if User.query.filter_by(username=data["username"]).first():
        return error_response(
            "Username already exists",
            code="USERNAME_EXISTS",
            status=409,
        )

    # Create user
    user = User(
        username=data["username"],
        email=data.get("email"),
        first_name=data["first_name"],
        last_name=data["last_name"],
        is_active=data.get("is_active", True),
    )
    user.set_password(data["password"])

    # Set profile
    user.profile.role = data.get("role")
    user.profile.university = data.get("university")
    user.profile.address = data.get("address")
    user.profile.academic_department_id = data.get("academic_department_id")
    user.profile.administrative_department_id = data.get(
        "administrative_department_id"
    )

    # Auto-generate university email
    if user.profile.university:
        user.profile.email = user.profile.generate_university_email()

    # Add titles
    if "title_ids" in data:
        from app.models.department import Title

        titles = Title.query.filter(Title.id.in_(data["title_ids"])).all()
        user.profile.titles.extend(titles)

    db.session.add(user)
    db.session.commit()

    return created_response(user.to_dict(), "User created successfully")


@users_bp.route("/<int:user_id>", methods=["PUT"])
@jwt_required_with_user
def update_user(user_id: int):
    """
    Update user (admin or self).
    """
    current_user: User = g.current_user

    # Check permission
    if (
        current_user.id != user_id
        and current_user.profile.role != UserProfile.ROLE_ADMIN
    ):
        return error_response(
            "You can only edit your own profile",
            code="FORBIDDEN",
            status=403,
        )

    user = User.query.get(user_id)
    if not user:
        return error_response("User not found", status=404)

    data = request.get_json() or {}

    # Update user fields
    if "first_name" in data:
        user.first_name = data["first_name"]
    if "last_name" in data:
        user.last_name = data["last_name"]
    if "email" in data:
        user.email = data["email"]

    # Update profile (admin only for role changes)
    if current_user.profile.role == UserProfile.ROLE_ADMIN:
        if "role" in data:
            user.profile.role = data["role"]
        if "is_active" in data:
            user.is_active = data["is_active"]

    if "university" in data:
        user.profile.university = data["university"]
        user.profile.email = user.profile.generate_university_email()

    if "address" in data:
        user.profile.address = data["address"]

    if "academic_department_id" in data:
        user.profile.academic_department_id = data["academic_department_id"]

    if "administrative_department_id" in data:
        user.profile.administrative_department_id = data[
            "administrative_department_id"
        ]

    if "title_ids" in data:
        from app.models.department import Title

        titles = Title.query.filter(Title.id.in_(data["title_ids"])).all()
        user.profile.titles.clear()
        user.profile.titles.extend(titles)

    db.session.commit()

    return success_response(user.to_dict(), "User updated successfully")


@users_bp.route("/<int:user_id>", methods=["DELETE"])
@admin_required
def delete_user(user_id: int):
    """Delete user (admin only)."""
    user = User.query.get(user_id)

    if not user:
        return error_response("User not found", status=404)

    db.session.delete(user)
    db.session.commit()

    return success_response(message="User deleted successfully")


