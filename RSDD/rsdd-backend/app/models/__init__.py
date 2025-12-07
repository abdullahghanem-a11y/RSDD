# app/models/__init__.py

from .user import User, UserProfile, user_titles
from .meeting import Meeting, meeting_attendees
from .department import (
    Title,
    Faculty,
    AcademicDepartment,
    AdminCategory,
    AdministrativeDepartment,
)

__all__ = [
    "User",
    "UserProfile",
    "user_titles",
    "Meeting",
    "meeting_attendees",
    "Title",
    "Faculty",
    "AcademicDepartment",
    "AdminCategory",
    "AdministrativeDepartment",
]

