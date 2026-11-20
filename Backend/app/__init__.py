import os
from datetime import timedelta

from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from app.database import db, setup_database
from app.routes.admin import admin_bp
from app.routes.auth import auth_bp
from app.routes.dashboard import dashboard_bp
from app.routes.tasks import tasks_bp
from app.services.auth_service import is_token_revoked

jwt = JWTManager()


def create_app(test_config=None):
    load_dotenv()

    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "sqlite:///todo.db")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-secret-change-me-please-32-chars")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=2)

    if test_config:
        app.config.update(test_config)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    CORS(app)

    # JWT Error and Blocklist handlers
    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(_header, payload):
        return is_token_revoked(payload["jti"])

    @jwt.unauthorized_loader
    @jwt.invalid_token_loader
    def no_token(_reason):
        return jsonify(error="Login required"), 401

    @jwt.expired_token_loader
    @jwt.revoked_token_loader
    def bad_token(_header, _payload):
        return jsonify(error="Session expired, please log in again"), 401

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(tasks_bp, url_prefix="/api/tasks")
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    with app.app_context():
        setup_database()

    return app
