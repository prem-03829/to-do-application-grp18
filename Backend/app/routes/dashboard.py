from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required

from app.routes.helpers import uid
from app.services.dashboard_service import get_dashboard_stats

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.get("/stats", strict_slashes=False)
@jwt_required()
def stats():
    return jsonify(get_dashboard_stats(uid()))
