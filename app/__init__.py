# app/__init__.py
from flask import Flask
from app.config import config_by_name
from app.extensions import db, jwt, mail, cors, migrate
import os

def create_app(config_name=None):
    """Flask application factory"""
    
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')
    
    app = Flask(__name__)
    app.config.from_object(config_by_name[config_name])
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)
    migrate.init_app(app, db)
    
    # Configure CORS
    cors.init_app(app, resources={
        r"/api/*": {
            "origins": app.config['CORS_ORIGINS'],
            "methods": app.config['CORS_METHODS'],
            "allow_headers": app.config['CORS_ALLOW_HEADERS'],
            "supports_credentials": app.config['CORS_SUPPORTS_CREDENTIALS']
        }
    })
    
    # Register blueprints
    from app.api import auth_bp, users_bp, profile_bp, media_bp, meetings_bp, departments_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(media_bp)
    app.register_blueprint(meetings_bp)
    app.register_blueprint(departments_bp)
    
    # Register error handlers
    from app.utils.error_handlers import register_error_handlers
    register_error_handlers(app)
    
    # Create upload directories
    os.makedirs(app.config['PROFILE_PICS_FOLDER'], exist_ok=True)
    os.makedirs(app.config['AGENDAS_FOLDER'], exist_ok=True)
    
    # Shell context for flask shell command
    @app.shell_context_processor
    def make_shell_context():
        # Import models for convenient access in `flask shell`
        from app.models import (
            User,
            UserProfile,
            Meeting,
            Faculty,
            AcademicDepartment,
            AdminCategory,
            AdministrativeDepartment,
        )

        return {
            "db": db,
            "User": User,
            "UserProfile": UserProfile,
            "Meeting": Meeting,
            "Faculty": Faculty,
            "AcademicDepartment": AcademicDepartment,
            "AdminCategory": AdminCategory,
            "AdministrativeDepartment": AdministrativeDepartment,
        }

    return app

