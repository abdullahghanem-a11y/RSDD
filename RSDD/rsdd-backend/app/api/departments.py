# app/api/departments.py
from flask import Blueprint, request
from app.models.department import (
    Faculty,
    AcademicDepartment,
    AdminCategory,
    AdministrativeDepartment,
    Title
)
from app.utils.decorators import jwt_required_with_user
from app.utils.response import success_response

departments_bp = Blueprint('departments', __name__, url_prefix='/api/departments')

@departments_bp.route('/faculties', methods=['GET'])
@jwt_required_with_user
def list_faculties():
    """List all faculties"""
    faculties = Faculty.query.all()
    return success_response([faculty.to_dict() for faculty in faculties])


@departments_bp.route('/academic-departments', methods=['GET'])
@jwt_required_with_user
def list_academic_departments():
    """List all academic departments"""
    faculty_id = request.args.get('faculty_id', type=int)
    
    query = AcademicDepartment.query
    if faculty_id:
        query = query.filter_by(faculty_id=faculty_id)
    
    departments = query.all()
    return success_response([dept.to_dict() for dept in departments])


@departments_bp.route('/admin-categories', methods=['GET'])
@jwt_required_with_user
def list_admin_categories():
    """List all admin categories"""
    categories = AdminCategory.query.all()
    return success_response([cat.to_dict() for cat in categories])


@departments_bp.route('/administrative-departments', methods=['GET'])
@jwt_required_with_user
def list_administrative_departments():
    """List all administrative departments"""
    category_id = request.args.get('category_id', type=int)
    
    query = AdministrativeDepartment.query
    if category_id:
        query = query.filter_by(category_id=category_id)
    
    departments = query.all()
    return success_response([dept.to_dict() for dept in departments])


@departments_bp.route('/titles', methods=['GET'])
@jwt_required_with_user
def list_titles():
    """List all titles"""
    titles = Title.query.all()
    return success_response([title.to_dict() for title in titles])

