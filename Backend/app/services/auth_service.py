from flask_jwt_extended import create_access_token
from werkzeug.security import check_password_hash, generate_password_hash

from app.database import db
from app.models.user import User

LOGGED_OUT = set()  # revoked token ids (resets on restart)


def is_token_revoked(jti: str) -> bool:
    return jti in LOGGED_OUT


def revoke_token(jti: str) -> None:
    LOGGED_OUT.add(jti)


def register_user(name: str, email: str, password: str):
    """Register a new standard user."""
    email = email.strip().lower()
    if User.query.filter_by(email=email).first():
        return None, "Email already registered", 409
    user = User(name=name.strip(), email=email, password_hash=generate_password_hash(password))
    db.session.add(user)
    db.session.commit()
    return user, None, 201


def authenticate_user(email: str, password: str):
    """Verify credentials and return user and JWT token."""
    email = email.strip().lower()
    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password or ""):
        return None, None, "Invalid email or password", 401
    token = create_access_token(identity=str(user.id))
    return user, token, None, 200


def get_user_by_id(user_id: int):
    """Fetch user by primary key."""
    return db.session.get(User, user_id)
