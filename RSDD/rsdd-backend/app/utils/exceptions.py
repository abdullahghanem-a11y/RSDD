# app/utils/exceptions.py

class APIException(Exception):
    """Base API exception"""
    status_code = 400
    code = 'API_ERROR'
    
    def __init__(self, message, status_code=None, code=None, payload=None):
        super().__init__()
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        if code is not None:
            self.code = code
        self.payload = payload
    
    def to_dict(self):
        rv = {
            'success': False,
            'error': self.message,
            'code': self.code
        }
        if self.payload:
            rv.update(self.payload)
        return rv


class AuthenticationError(APIException):
    """Authentication failed"""
    status_code = 401
    code = 'AUTHENTICATION_ERROR'


class AuthorizationError(APIException):
    """Insufficient permissions"""
    status_code = 403
    code = 'AUTHORIZATION_ERROR'


class ResourceNotFoundError(APIException):
    """Resource not found"""
    status_code = 404
    code = 'NOT_FOUND'


class ResourceConflictError(APIException):
    """Resource conflict"""
    status_code = 409
    code = 'CONFLICT'


class FileUploadError(APIException):
    """File upload failed"""
    status_code = 400
    code = 'FILE_UPLOAD_ERROR'


class ExternalServiceError(APIException):
    """External service (Google, Email) failed"""
    status_code = 502
    code = 'EXTERNAL_SERVICE_ERROR'

