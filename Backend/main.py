"""To-Do App backend: Flask + SQLAlchemy (MySQL) + JWT. Run: python main.py"""
from app import create_app
from app.database import db  # noqa: F401

app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5000)  # frontend expects http://localhost:5000/api
