# app/api/__init__.py

from .auth import auth_bp
from .users import users_bp
from .profile import profile_bp
from .media import media_bp
from .meetings import meetings_bp
from .departments import departments_bp

__all__ = [
    "auth_bp",
    "users_bp",
    "profile_bp",
    "media_bp",
    "meetings_bp",
    "departments_bp",
]

