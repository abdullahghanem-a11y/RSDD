from __future__ import annotations

from typing import Optional, List

from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.extensions import db


class Title(db.Model):
    """Academic/professional titles"""

    __tablename__ = "titles"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)

    # Relationships
    users: Mapped[List["UserProfile"]] = relationship(
        secondary="user_titles",
        back_populates="titles",
    )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
        }

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Title {self.name}>"


class Faculty(db.Model):
    """University faculties"""

    __tablename__ = "faculties"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(150), unique=True, nullable=False)

    # Relationships
    departments: Mapped[List["AcademicDepartment"]] = relationship(
        back_populates="faculty",
        cascade="all, delete-orphan",
    )

    def to_dict(self, include_departments: bool = False) -> dict:
        data = {
            "id": self.id,
            "name": self.name,
        }
        if include_departments:
            data["departments"] = [
                dept.to_dict(include_faculty=False) for dept in self.departments
            ]
            data["department_count"] = len(self.departments)
        return data

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Faculty {self.name}>"


class AcademicDepartment(db.Model):
    """Academic departments under faculties"""

    __tablename__ = "academic_departments"

    id: Mapped[int] = mapped_column(primary_key=True)
    faculty_id: Mapped[int] = mapped_column(
        ForeignKey("faculties.id", ondelete="CASCADE"),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(150), unique=True, nullable=False)

    # Relationships
    faculty: Mapped["Faculty"] = relationship(back_populates="departments")
    users: Mapped[List["UserProfile"]] = relationship(
        back_populates="academic_department",
    )

    def to_dict(self, include_faculty: bool = True) -> dict:
        data = {
            "id": self.id,
            "name": self.name,
        }
        if include_faculty and self.faculty:
            data["faculty"] = {
                "id": self.faculty.id,
                "name": self.faculty.name,
            }
        return data

    def __repr__(self) -> str:  # pragma: no cover
        return f"<AcademicDepartment {self.name}>"


class AdminCategory(db.Model):
    """Categories for administrative departments"""

    __tablename__ = "admin_categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(150), unique=True, nullable=False)

    # Relationships
    departments: Mapped[List["AdministrativeDepartment"]] = relationship(
        back_populates="category",
        cascade="all, delete-orphan",
    )

    def to_dict(self, include_departments: bool = False) -> dict:
        data = {
            "id": self.id,
            "name": self.name,
        }
        if include_departments:
            data["departments"] = [
                dept.to_dict(include_category=False) for dept in self.departments
            ]
            data["department_count"] = len(self.departments)
        return data

    def __repr__(self) -> str:  # pragma: no cover
        return f"<AdminCategory {self.name}>"


class AdministrativeDepartment(db.Model):
    """Administrative departments under categories"""

    __tablename__ = "administrative_departments"

    id: Mapped[int] = mapped_column(primary_key=True)
    category_id: Mapped[int] = mapped_column(
        ForeignKey("admin_categories.id", ondelete="CASCADE"),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(150), unique=True, nullable=False)

    # Relationships
    category: Mapped["AdminCategory"] = relationship(back_populates="departments")
    users: Mapped[List["UserProfile"]] = relationship(
        back_populates="administrative_department",
    )

    def to_dict(self, include_category: bool = True) -> dict:
        data = {
            "id": self.id,
            "name": self.name,
        }
        if include_category and self.category:
            data["category"] = {
                "id": self.category.id,
                "name": self.category.name,
            }
        return data

    def __repr__(self) -> str:  # pragma: no cover
        return f"<AdministrativeDepartment {self.name}>"

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