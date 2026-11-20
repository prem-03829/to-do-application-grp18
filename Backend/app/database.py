import os
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import inspect, text
from werkzeug.security import generate_password_hash

db = SQLAlchemy()


def setup_database():
    """Initializes tables, ensures role column exists, and creates initial admin account."""
    from app.models.user import User
    from app.models.task import Category, Task  # noqa: F401

    db.create_all()  # creates the tables if they don't exist

    # older databases made before roles existed: add the role column
    if "role" not in [c["name"] for c in inspect(db.engine).get_columns("users")]:
        db.session.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR(10) NOT NULL DEFAULT 'user'"))
        db.session.commit()

    # one admin account (change the password in .env: ADMIN_EMAIL / ADMIN_PASSWORD)
    email = os.getenv("ADMIN_EMAIL", "admin@college.edu").lower()
    if not User.query.filter_by(email=email).first():
        db.session.add(
            User(
                name="Admin",
                email=email,
                role="admin",
                password_hash=generate_password_hash(os.getenv("ADMIN_PASSWORD", "Admin@123")),
            )
        )
        db.session.commit()
