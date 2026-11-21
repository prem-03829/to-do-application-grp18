from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required
from app.services.auth_service import get_user_by_id


def err(msg, code):
    """Standard JSON error format."""
    return jsonify(error=msg), code


def uid():
    """Extract authenticated user ID from JWT."""
    return int(get_jwt_identity())


def admin_only(fn):
    """Only logged-in admins may call the route; everyone else gets 403."""
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user = get_user_by_id(uid())
        if not user or user.role != "admin":
            return err("Admin access only", 403)
        return fn(*args, **kwargs)

    return wrapper
