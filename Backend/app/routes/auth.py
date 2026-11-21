from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt, jwt_required

from app.routes.helpers import err, uid
from app.schemas.auth_schema import validate_register_input
from app.services.auth_service import (
    authenticate_user,
    get_user_by_id,
    register_user,
    revoke_token,
)

auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/register")
def register():
    d = request.get_json(silent=True) or {}
    validated, error = validate_register_input(d)
    if error:
        return err(error, 400)
    user, err_msg, code = register_user(validated["name"], validated["email"], validated["password"])
    if err_msg:
        return err(err_msg, code)
    return jsonify(user.to_dict()), 201


@auth_bp.post("/login")
def login():
    d = request.get_json(silent=True) or {}
    user, token, err_msg, code = authenticate_user(d.get("email") or "", d.get("password") or "")
    if err_msg:
        return err(err_msg, code)
    return jsonify(token=token, user=user.to_dict())


@auth_bp.get("/me")
@jwt_required()
def me():
    user = get_user_by_id(uid())
    return jsonify(user.to_dict()) if user else err("User not found", 404)


@auth_bp.post("/logout")
@jwt_required()
def logout():
    revoke_token(get_jwt()["jti"])
    return jsonify(message="Logged out")
