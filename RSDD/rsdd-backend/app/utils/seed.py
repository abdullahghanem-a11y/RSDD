from app.extensions import db
from app.models.user import User, UserProfile
from app.models.department import (
    Faculty,
    AcademicDepartment,
    Title,
    AdminCategory,
    AdministrativeDepartment,
)


def seed_database() -> None:
    """Seed database with sample data"""

    # Create titles
    titles = [
        Title(name="Professor"),
        Title(name="Associate Professor"),
        Title(name="Assistant Professor"),
        Title(name="Dr."),
        Title(name="Mr."),
        Title(name="Mrs."),
        Title(name="Ms."),
    ]
    db.session.add_all(titles)

    # Create faculties
    engineering = Faculty(name="Engineering")
    medicine = Faculty(name="Medicine")
    arts = Faculty(name="Arts and Sciences")
    db.session.add_all([engineering, medicine, arts])
    db.session.flush()

    # Create academic departments
    cs_dept = AcademicDepartment(name="Computer Engineering", faculty_id=engineering.id)
    ee_dept = AcademicDepartment(name="Electrical Engineering", faculty_id=engineering.id)
    db.session.add_all([cs_dept, ee_dept])

    # Create admin categories
    admin_category = AdminCategory(name="Administrative Affairs")
    db.session.add(admin_category)
    db.session.flush()

    # Create administrative departments
    hr_dept = AdministrativeDepartment(name="Human Resources", category_id=admin_category.id)
    db.session.add(hr_dept)

    # Create admin user
    admin = User(
        username="admin",
        email="admin@university.edu.tr",
        first_name="Admin",
        last_name="User",
        is_staff=True,
        is_superuser=True,
    )
    admin.set_password("admin123")
    admin.profile.role = UserProfile.ROLE_ADMIN
    admin.profile.university = "Sample University"
    admin.profile.email = admin.profile.generate_university_email()
    db.session.add(admin)

    # Create sample dean
    dean = User(
        username="johndoe",
        email="johndoe@university.edu.tr",
        first_name="John",
        last_name="Doe",
    )
    dean.set_password("dean123")
    dean.profile.role = UserProfile.ROLE_DEAN
    dean.profile.university = "Sample University"
    dean.profile.academic_department = cs_dept
    dean.profile.titles.extend([titles[0], titles[3]])  # Professor, Dr.
    dean.profile.email = dean.profile.generate_university_email()
    db.session.add(dean)

    db.session.commit()
    print("✅ Database seeded successfully!")


# Run from Flask shell:
# >>> from app.utils.seed import seed_database
# >>> seed_database()

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