# app/utils/error_handlers.py
from flask import jsonify, current_app
from marshmallow import ValidationError
from werkzeug.exceptions import HTTPException
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from app.extensions import db
from app.utils.exceptions import APIException

def register_error_handlers(app):
    """Register global error handlers"""
    
    @app.errorhandler(APIException)
    def handle_api_exception(error):
        """Handle custom API exceptions"""
        response = error.to_dict()
        return jsonify(response), error.status_code
    
    @app.errorhandler(ValidationError)
    def handle_validation_error(error):
        """Handle Marshmallow validation errors"""
        return jsonify({
            'success': False,
            'error': 'Validation failed',
            'code': 'VALIDATION_ERROR',
            'errors': error.messages
        }), 400
    
    @app.errorhandler(IntegrityError)
    def handle_integrity_error(error):
        """Handle database integrity errors"""
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'Database integrity error',
            'code': 'INTEGRITY_ERROR',
            'message': 'Resource already exists or constraint violated'
        }), 409
    
    @app.errorhandler(SQLAlchemyError)
    def handle_database_error(error):
        """Handle general database errors"""
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'Database error',
            'code': 'DATABASE_ERROR'
        }), 500
    
    @app.errorhandler(ValueError)
    def handle_value_error(error):
        """Handle ValueError (business logic errors)"""
        return jsonify({
            'success': False,
            'error': str(error),
            'code': 'INVALID_VALUE'
        }), 400
    
    @app.errorhandler(404)
    def handle_not_found(error):
        """Handle 404 errors"""
        return jsonify({
            'success': False,
            'error': 'Resource not found',
            'code': 'NOT_FOUND'
        }), 404
    
    @app.errorhandler(401)
    def handle_unauthorized(error):
        """Handle 401 errors"""
        return jsonify({
            'success': False,
            'error': 'Authentication required',
            'code': 'UNAUTHORIZED'
        }), 401
    
    @app.errorhandler(403)
    def handle_forbidden(error):
        """Handle 403 errors"""
        return jsonify({
            'success': False,
            'error': 'Insufficient permissions',
            'code': 'FORBIDDEN'
        }), 403
    
    @app.errorhandler(413)
    def handle_file_too_large(error):
        """Handle file upload size errors"""
        return jsonify({
            'success': False,
            'error': 'File too large',
            'code': 'FILE_TOO_LARGE',
            'max_size': current_app.config['MAX_CONTENT_LENGTH']
        }), 413
    
    @app.errorhandler(500)
    def handle_internal_error(error):
        """Handle 500 errors"""
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'code': 'INTERNAL_ERROR'
        }), 500
    
    @app.errorhandler(HTTPException)
    def handle_http_exception(error):
        """Handle all other HTTP exceptions"""
        return jsonify({
            'success': False,
            'error': error.description,
            'code': error.name.upper().replace(' ', '_')
        }), error.code

