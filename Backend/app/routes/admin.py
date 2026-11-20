from flask import Blueprint, jsonify, request

from app.routes.helpers import admin_only, err
from app.services.admin_service import (
    get_admin_stats,
    get_admin_tasks,
    get_admin_team_progress,
    get_admin_user_tasks,
    get_admin_users,
)

admin_bp = Blueprint("admin", __name__)


@admin_bp.get("/users")
@admin_only
def admin_users():
    """All registered users, each with their task counts."""
    return jsonify(get_admin_users())


@admin_bp.get("/users/<int:user_id>/tasks")
@admin_only
def admin_user_tasks(user_id):
    """What one user is working on (optional ?status=)."""
    tasks, err_msg, status_code = get_admin_user_tasks(user_id, request.args.get("status"))
    if err_msg:
        return err(err_msg, status_code)
    return jsonify(tasks)


@admin_bp.get("/tasks")
@admin_only
def admin_tasks():
    """Every task with its owner. Filters: ?status= ?userId= ?q="""
    tasks, err_msg, status_code = get_admin_tasks(request.args)
    if err_msg:
        return err(err_msg, status_code)
    return jsonify(tasks)


@admin_bp.get("/team-progress")
@admin_only
def admin_team_progress():
    """One entry per user, in the shape the frontend admin page reads."""
    return jsonify(get_admin_team_progress())


@admin_bp.get("/stats")
@admin_only
def admin_stats():
    """Overall progress of all users, plus progress per user."""
    return jsonify(get_admin_stats())
