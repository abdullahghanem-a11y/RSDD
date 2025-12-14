from __future__ import annotations

from datetime import datetime
from typing import Optional, List

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from sqlalchemy import String, Boolean, DateTime, Table, Column, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.extensions import db


class User(db.Model):
    """User authentication and basic info"""

    __tablename__ = "users"

    # Primary Key
    id: Mapped[int] = mapped_column(primary_key=True)

    # Authentication
    username: Mapped[str] = mapped_column(
        String(150),
        unique=True,
        nullable=False,
        index=True,
    )
    email: Mapped[Optional[str]] = mapped_column(
        String(255),
        unique=True,
        index=True,
    )
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)

    # Personal Information
    first_name: Mapped[Optional[str]] = mapped_column(String(150))
    last_name: Mapped[Optional[str]] = mapped_column(String(150))

    # Status Flags
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_staff: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Timestamps
    date_joined: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime)

    # Relationships
    profile: Mapped["UserProfile"] = relationship(
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    meetings: Mapped[List["Meeting"]] = relationship(
        secondary="meeting_attendees",
        back_populates="attendees",
    )

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Auto-create profile
        if not self.profile:
            self.profile = UserProfile()

    def set_password(self, password: str) -> None:
        """Hash and set password using Argon2"""
        ph = PasswordHasher()
        self.password_hash = ph.hash(password)

    def check_password(self, password: str) -> bool:
        """Verify password against hash"""
        ph = PasswordHasher()
        try:
            ph.verify(self.password_hash, password)
            # Rehash if parameters changed
            if ph.check_needs_rehash(self.password_hash):
                self.set_password(password)
            return True
        except VerifyMismatchError:
            return False

    def get_full_name(self) -> str:
        """Return full name"""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.username

    def to_dict(self, include_profile: bool = True) -> dict:
        """Serialize user for API responses"""
        data = {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "full_name": self.get_full_name(),
            "is_active": self.is_active,
            "is_staff": self.is_staff,
            "is_superuser": self.is_superuser,
            "date_joined": self.date_joined.isoformat() if self.date_joined else None,
            "last_login": self.last_login.isoformat() if self.last_login else None,
        }
        if include_profile and self.profile:
            data["profile"] = self.profile.to_dict(include_user=False)
        return data

    def __repr__(self) -> str:  # pragma: no cover
        return f"<User {self.username}>"


# Association table for UserProfile-Title Many-to-Many
user_titles = Table(
    "user_titles",
    db.Model.metadata,
    Column(
        "user_profile_id",
        Integer,
        ForeignKey("user_profiles.id"),
        primary_key=True,
    ),
    Column("title_id", Integer, ForeignKey("titles.id"), primary_key=True),
)


class UserProfile(db.Model):
    """Extended user profile information"""

    __tablename__ = "user_profiles"

    # Role choices
    ROLE_ADMIN = "admin"
    ROLE_DEAN = "dean"
    ROLE_DIRECTOR = "director"
    ROLE_SECRETARY = "secretary"

    ROLE_CHOICES = [
        (ROLE_ADMIN, "Admin"),
        (ROLE_DEAN, "Dean"),
        (ROLE_DIRECTOR, "Director"),
        (ROLE_SECRETARY, "Dean Secretary"),
    ]

    # Primary Key
    id: Mapped[int] = mapped_column(primary_key=True)

    # Foreign Keys
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        unique=True,
        nullable=False,
    )
    academic_department_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("academic_departments.id")
    )
    administrative_department_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("administrative_departments.id")
    )

    # Profile Fields
    role: Mapped[Optional[str]] = mapped_column(String(50))
    address: Mapped[Optional[str]] = mapped_column(String(255))
    university: Mapped[Optional[str]] = mapped_column(String(255))
    email: Mapped[Optional[str]] = mapped_column(String(255))  # Auto-generated
    profile_picture: Mapped[Optional[str]] = mapped_column(
        String(255)
    )  # Relative path

    # Relationships
    user: Mapped["User"] = relationship(back_populates="profile")
    academic_department: Mapped[Optional["AcademicDepartment"]] = relationship(
        back_populates="users"
    )
    administrative_department: Mapped[
        Optional["AdministrativeDepartment"]
    ] = relationship(back_populates="users")
    titles: Mapped[List["Title"]] = relationship(
        secondary=user_titles,
        back_populates="users",
    )

    def get_initials(self) -> str:
        """Get user initials (first letter of first + last name)"""
        if not self.user:
            return ""
        first = self.user.first_name[0].upper() if self.user.first_name else ""
        last = self.user.last_name[0].upper() if self.user.last_name else ""
        return f"{first}{last}"

    def generate_university_email(self) -> Optional[str]:
        """
        Generate university email from username and university name
        Example:
            University: "Istanbul Technical University"
            Username: "johndoe"
            Result: "johndoe@itu.edu.tr"
        """
        if not self.university or not self.user or not self.user.username:
            return None

        # Extract initials from university name
        words = self.university.split()
        uni_initials = "".join([word[0] for word in words]).lower()

        return f"{self.user.username}@{uni_initials}.edu.tr"

    def get_primary_email(self) -> Optional[str]:
        """Get primary email (profile email or user email)"""
        return self.email or self.user.email if self.user else None

    def to_dict(self, include_user: bool = False) -> dict:
        """Serialize profile for API responses"""
        data = {
            "id": self.id,
            "role": self.role,
            "address": self.address,
            "university": self.university,
            "email": self.email,
            "profile_picture": self.profile_picture,
            "initials": self.get_initials(),
            "academic_department": self.academic_department.to_dict()
            if self.academic_department
            else None,
            "administrative_department": self.administrative_department.to_dict()
            if self.administrative_department
            else None,
            "titles": [title.to_dict() for title in self.titles],
        }
        if include_user and self.user:
            data["user"] = {
                "id": self.user.id,
                "username": self.user.username,
                "first_name": self.user.first_name,
                "last_name": self.user.last_name,
                "email": self.user.email,
            }
        return data

    def __repr__(self) -> str:  # pragma: no cover
        return f"<UserProfile {self.user.username if self.user else 'Unknown'}>"

{
  "cells": [],
  "metadata": {
    "language_info": {
      "name": "python"
    }
  },
  "nbformat": 4,
  "nbformat_minor": 2
}