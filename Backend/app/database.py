import os
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash

db = SQLAlchemy()


def setup_database():
    """Initializes tables and creates initial admin account if not present."""
    from app.models.user import User
    from app.models.task import Category, Task  # noqa: F401

    db.create_all()  # creates the tables if they don't exist

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
