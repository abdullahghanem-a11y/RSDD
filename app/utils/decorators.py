from __future__ import annotations

from functools import wraps
from typing import Callable, TypeVar, Any, cast

from flask import g
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models.user import User, UserProfile
from app.utils.response import error_response

F = TypeVar("F", bound=Callable[..., Any])


def jwt_required_with_user(fn: F) -> F:
    """
    Wrapper around flask_jwt_extended.jwt_required that:
    - ensures a valid JWT is present
    - loads the current user from the DB
    - attaches it to flask.g.current_user
    """

    @jwt_required()
    @wraps(fn)
    def wrapper(*args: Any, **kwargs: Any):
        # Identity is stored as string in JWT; cast to int for DB lookup
        raw_identity = get_jwt_identity()
        try:
            user_id = int(raw_identity)
        except (TypeError, ValueError):
            return error_response(
                "Invalid token subject",
                code="INVALID_TOKEN_SUBJECT",
                status=422,
            )

        user = User.query.get(user_id)

        if not user or not user.is_active:
            return error_response(
                "User not found or inactive",
                code="INVALID_USER",
                status=401,
            )

        g.current_user = user
        return fn(*args, **kwargs)

    return cast(F, wrapper)


def admin_required(fn: F) -> F:
    """
    Require an authenticated user with admin role.
    Uses jwt_required_with_user internally.
    """

    @jwt_required_with_user
    @wraps(fn)
    def wrapper(*args: Any, **kwargs: Any):
        user: User = g.current_user

        if not user.profile or user.profile.role != UserProfile.ROLE_ADMIN:
            return error_response(
                "Admin privileges required",
                code="FORBIDDEN",
                status=403,
            )

        return fn(*args, **kwargs)

    return cast(F, wrapper)


def role_required(*allowed_roles: str) -> Callable[[F], F]:
    """
    Require an authenticated user with one of the specified roles.
    Uses jwt_required_with_user internally.
    
    Args:
        *allowed_roles: Variable number of role strings (e.g., 'admin', 'dean', 'secretary')
    """

    def decorator(fn: F) -> F:
        @jwt_required_with_user
        @wraps(fn)
        def wrapper(*args: Any, **kwargs: Any):
            user: User = g.current_user

            if not user.profile or user.profile.role not in allowed_roles:
                return error_response(
                    f"Access denied. Required roles: {', '.join(allowed_roles)}",
                    code="FORBIDDEN",
                    status=403,
                )

            return fn(*args, **kwargs)

        return cast(F, wrapper)

    return decorator


