import os
import tempfile
import pytest
from sqlalchemy import event
from sqlalchemy.engine import Engine

# Ensure test credentials and SQLite URI are configured BEFORE any app imports
_temp_db = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
_temp_db_path = _temp_db.name
_temp_db.close()

# Force sqlite url and fake test credentials
os.environ["DATABASE_URL"] = f"sqlite:///{_temp_db_path}"
os.environ["ADMIN_EMAIL"] = "testadmin@college.edu"
os.environ["ADMIN_PASSWORD"] = "TestAdmin@123"
os.environ["JWT_SECRET_KEY"] = "test-jwt-secret-key-32-characters-min"

from app import create_app
from app.database import db
from app.models.user import User
from app.models.task import Category, Task
from app.services.auth_service import LOGGED_OUT


@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    """Enable foreign key constraints for SQLite."""
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


@pytest.fixture(scope="session")
def app():
    """Create session-wide application instance backed by throwaway SQLite DB."""
    flask_app = create_app({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": f"sqlite:///{_temp_db_path}",
    })
    yield flask_app

    # Teardown: close DB and remove temporary SQLite file
    with flask_app.app_context():
        db.session.remove()
        db.engine.dispose()
    if os.path.exists(_temp_db_path):
        try:
            os.remove(_temp_db_path)
        except OSError:
            pass


@pytest.fixture
def client(app):
    """Flask test client."""
    return app.test_client()


@pytest.fixture(autouse=True)
def clean_db(app):
    """Isolate tests by cleaning up tables between test runs while keeping admin."""
    yield
    with app.app_context():
        LOGGED_OUT.clear()
        # Delete tasks and categories
        Task.query.delete()
        Category.query.delete()
        # Delete any user that is not the test admin
        User.query.filter(User.email != os.environ["ADMIN_EMAIL"]).delete()
        db.session.commit()


@pytest.fixture
def auth_helper(client):
    """Helper to register and login users, returning headers and user info."""
    class AuthHelper:
        @staticmethod
        def register(name="Test User", email="user@example.com", password="password123"):
            return client.post("/api/auth/register", json={
                "name": name,
                "email": email,
                "password": password
            })

        @staticmethod
        def login(email="user@example.com", password="password123"):
            return client.post("/api/auth/login", json={
                "email": email,
                "password": password
            })

        @staticmethod
        def register_and_login(name="Test User", email="user@example.com", password="password123"):
            reg_resp = AuthHelper.register(name, email, password)
            assert reg_resp.status_code == 201, reg_resp.get_data(as_text=True)
            login_resp = AuthHelper.login(email, password)
            assert login_resp.status_code == 200, login_resp.get_data(as_text=True)
            data = login_resp.get_json()
            token = data["token"]
            return {
                "token": token,
                "headers": {"Authorization": f"Bearer {token}"},
                "user": data["user"]
            }

    return AuthHelper


@pytest.fixture
def admin_headers(client):
    """Login as the seeded test admin and return Authorization header dict."""
    res = client.post("/api/auth/login", json={
        "email": os.environ["ADMIN_EMAIL"],
        "password": os.environ["ADMIN_PASSWORD"]
    })
    assert res.status_code == 200
    token = res.get_json()["token"]
    return {"Authorization": f"Bearer {token}"}
