from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from app.routes.helpers import err, uid
from app.schemas.task_schema import clean_task
from app.services.auth_service import get_user_by_id
from app.services.task_service import (
    create_task,
    delete_task,
    get_task_by_id,
    get_user_task,
    list_tasks,
    toggle_task,
    update_task,
)

tasks_bp = Blueprint("tasks", __name__)


@tasks_bp.get("", strict_slashes=False)
@jwt_required()
def get_tasks_list():
    tasks = list_tasks(uid(), request.args)
    return jsonify(tasks)


@tasks_bp.post("", strict_slashes=False)
@jwt_required()
def add_task():
    body = request.get_json(silent=True) or {}
    fields, e = clean_task(body)
    if e:
        return err(e, 400)
    target_uid = uid()
    user = get_user_by_id(target_uid)
    if user and user.role == "admin":
        assigned_id = body.get("userId") or body.get("user_id")
        if assigned_id is not None and str(assigned_id).strip() != "":
            try:
                target_uid = int(assigned_id)
            except (ValueError, TypeError):
                return err("Invalid userId", 400)
            if not get_user_by_id(target_uid):
                return err("User not found", 404)
    task = create_task(target_uid, fields)
    return jsonify(task.to_dict()), 201


@tasks_bp.get("/<int:task_id>")
@jwt_required()
def get_task(task_id):
    user = get_user_by_id(uid())
    if user and user.role == "admin":
        task = get_task_by_id(task_id)
    else:
        task = get_user_task(task_id, uid())
    return jsonify(task.to_dict()) if task else err("Task not found", 404)


@tasks_bp.route("/<int:task_id>", methods=["PUT", "PATCH"])
@jwt_required()
def edit_task(task_id):
    task = get_user_task(task_id, uid())
    if not task:
        return err("Task not found", 404)
    fields, e = clean_task(request.get_json(silent=True) or {}, partial=True)
    if e:
        return err(e, 400)
    updated = update_task(task, uid(), fields)
    return jsonify(updated.to_dict())


@tasks_bp.patch("/<int:task_id>/toggle")
@jwt_required()
def toggle_task_status(task_id):
    task = get_user_task(task_id, uid())
    if not task:
        return err("Task not found", 404)
    toggled = toggle_task(task)
    return jsonify(toggled.to_dict())


@tasks_bp.delete("/<int:task_id>")
@jwt_required()
def remove_task(task_id):
    task = get_user_task(task_id, uid())
    if not task:
        return err("Task not found", 404)
    delete_task(task)
    return "", 204
