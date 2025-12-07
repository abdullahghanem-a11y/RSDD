from __future__ import annotations

from typing import Any, Dict, List, Optional, Tuple

from flask import jsonify


def _build_response(
    success: bool,
    data: Optional[Any] = None,
    message: Optional[str] = None,
    error: Optional[str] = None,
    code: Optional[str] = None,
    status: int = 200,
):
    payload: Dict[str, Any] = {"success": success}

    if success:
        if data is not None:
            payload["data"] = data
        if message:
            payload["message"] = message
    else:
        payload["error"] = error or message or "An error occurred"
        if code:
            payload["code"] = code

    return jsonify(payload), status


def success_response(
    data: Optional[Any] = None,
    message: Optional[str] = None,
    status: int = 200,
):
    """Standard success JSON response."""
    return _build_response(True, data=data, message=message, status=status)


def created_response(data: Any, message: Optional[str] = None):
    """201 Created response."""
    return success_response(data=data, message=message, status=201)


def error_response(
    message: str,
    code: Optional[str] = None,
    status: int = 400,
):
    """Standard error JSON response."""
    return _build_response(False, message=message, code=code, status=status)


def paginated_response(
    items: List[Any],
    page: int,
    per_page: int,
    total: int,
):
    """Helper for paginated list responses."""
    pages = (total + per_page - 1) // per_page if per_page else 1

    data = {
        "items": items,
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "pages": pages,
            "has_next": page < pages,
            "has_prev": page > 1,
        },
    }

    return success_response(data)


