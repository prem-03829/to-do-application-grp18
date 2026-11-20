"""To-Do App backend: Flask + SQLAlchemy (MySQL) + JWT. Run: python main.py"""
import os
from functools import wraps
from datetime import date, datetime, timedelta

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import (JWTManager, create_access_token, get_jwt,
                                get_jwt_identity, jwt_required)
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import case, inspect, text
from werkzeug.security import check_password_hash, generate_password_hash

load_dotenv()
STATUSES = ("pending", "in_progress", "completed")   # same as frontend types
PRIORITIES = ("low", "medium", "high")

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "sqlite:///todo.db")
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-secret-change-me-please-32-chars")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=2)
db, jwt = SQLAlchemy(app), JWTManager(app)
CORS(app)
LOGGED_OUT = set()  # revoked token ids (resets on restart)


# ---------- database tables ----------
class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(10), nullable=False, default="user")  # "user" or "admin"

    def to_dict(self):
        return {"id": str(self.id), "name": self.name, "email": self.email, "role": self.role}


class Category(db.Model):
    __tablename__ = "categories"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    __table_args__ = (db.UniqueConstraint("user_id", "name"),)


class Task(db.Model):
    __tablename__ = "tasks"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, default="")
    status = db.Column(db.String(20), nullable=False, default="pending")
    priority = db.Column(db.String(10), nullable=False, default="medium")
    category_id = db.Column(db.Integer, db.ForeignKey("categories.id"))
    category_obj = db.relationship("Category")
    due_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {"id": str(self.id), "userId": str(self.user_id), "title": self.title,
                "description": self.description or "", "status": self.status,
                "priority": self.priority,
                "category": self.category_obj.name if self.category_obj else None,
                "dueDate": self.due_date.isoformat() if self.due_date else "",
                "createdAt": self.created_at.isoformat()}


# ---------- helpers ----------
def err(msg, code):
    return jsonify(error=msg), code


def uid():
    return int(get_jwt_identity())


def my_task(task_id):  # a user can only reach their own tasks
    return Task.query.filter_by(id=task_id, user_id=uid()).first()


def category_id_for(name):
    """The frontend sends a category name; find or create it and return its id."""
    name = (name or "").strip()[:100]
    if not name:
        return None
    cat = Category.query.filter_by(user_id=uid(), name=name).first()
    if not cat:
        cat = Category(user_id=uid(), name=name)
        db.session.add(cat)
        db.session.flush()
    return cat.id


def admin_only(fn):
    """Only logged-in admins may call the route; everyone else gets 403."""
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user = db.session.get(User, uid())
        if not user or user.role != "admin":
            return err("Admin access only", 403)
        return fn(*args, **kwargs)
    return wrapper


def progress(tasks):
    """Counts of a list of tasks by status, plus completion percentage."""
    done = sum(t.status == "completed" for t in tasks)
    return {"totalTasks": len(tasks),
            "pending": sum(t.status == "pending" for t in tasks),
            "inProgress": sum(t.status == "in_progress" for t in tasks),
            "completed": done,
            "completionRate": round(done / len(tasks) * 100) if tasks else 0}


def clean_task(data, partial=False):
    """Validate task JSON. Returns (fields, error)."""
    out = {}
    if "title" in data or not partial:
        title = (data.get("title") or "").strip()
        if not title or len(title) > 200:
            return None, "title is required (max 200 characters)"
        out["title"] = title
    for key, allowed in (("status", STATUSES), ("priority", PRIORITIES)):
        if key in data:
            if data[key] not in allowed:
                return None, f"{key} must be one of {', '.join(allowed)}"
            out[key] = data[key]
    for key in ("description", "category"):
        if key in data:
            out[key] = data[key] or None if key == "category" else (data[key] or "")
    if "dueDate" in data:
        try:
            out["due_date"] = date.fromisoformat(data["dueDate"]) if data["dueDate"] else None
        except (ValueError, TypeError):
            return None, "dueDate must be YYYY-MM-DD"
    return out, None


@jwt.token_in_blocklist_loader
def is_logged_out(_header, payload):
    return payload["jti"] in LOGGED_OUT


@jwt.unauthorized_loader
@jwt.invalid_token_loader
def no_token(reason):
    return err("Login required", 401)


@jwt.expired_token_loader
@jwt.revoked_token_loader
def bad_token(_h, _p):
    return err("Session expired, please log in again", 401)


# ---------- auth ----------
@app.post("/api/auth/register")
def register():
    d = request.get_json(silent=True) or {}
    name, email, pw = (d.get("name") or "").strip(), (d.get("email") or "").strip().lower(), d.get("password") or ""
    if not name or "@" not in email or len(pw) < 6:
        return err("name, valid email and password (min 6 characters) are required", 400)
    if User.query.filter_by(email=email).first():
        return err("Email already registered", 409)
    user = User(name=name, email=email, password_hash=generate_password_hash(pw))
    db.session.add(user)
    db.session.commit()
    return jsonify(user.to_dict()), 201


@app.post("/api/auth/login")
def login():
    d = request.get_json(silent=True) or {}
    user = User.query.filter_by(email=(d.get("email") or "").strip().lower()).first()
    if not user or not check_password_hash(user.password_hash, d.get("password") or ""):
        return err("Invalid email or password", 401)
    return jsonify(token=create_access_token(identity=str(user.id)), user=user.to_dict())


@app.get("/api/auth/me")
@jwt_required()
def me():
    user = db.session.get(User, uid())
    return jsonify(user.to_dict()) if user else err("User not found", 404)


@app.post("/api/auth/logout")
@jwt_required()
def logout():
    LOGGED_OUT.add(get_jwt()["jti"])
    return jsonify(message="Logged out")


# ---------- tasks (add, view, update, delete) ----------
@app.get("/api/tasks")
@jwt_required()
def list_tasks():
    a, q = request.args, Task.query.filter_by(user_id=uid())
    for field, col in (("status", Task.status), ("priority", Task.priority)):
        if a.get(field) and a[field] != "all":
            q = q.filter(col == a[field])
    if a.get("category") and a["category"] != "all":
        q = q.join(Category, Task.category_id == Category.id).filter(Category.name == a["category"])
    if a.get("q"):
        q = q.filter(Task.title.ilike(f"%{a['q']}%"))
    rank = case({"low": 1, "medium": 2, "high": 3}, value=Task.priority)
    # frontend sends sort=field:order (e.g. dueDate:asc); sortBy/sortOrder also accepted
    by, _, order = (a.get("sort") or "").partition(":")
    by, order = a.get("sortBy") or by, a.get("sortOrder") or order or "desc"
    col = {"dueDate": Task.due_date, "createdAt": Task.created_at, "priority": rank,
           "title": Task.title}.get(by, Task.created_at)
    col = col.asc() if order == "asc" else col.desc()
    return jsonify([t.to_dict() for t in q.order_by(col, Task.id.desc())])


@app.post("/api/tasks")
@jwt_required()
def create_task():
    fields, e = clean_task(request.get_json(silent=True) or {})
    if e:
        return err(e, 400)
    if "category" in fields:
        fields["category_id"] = category_id_for(fields.pop("category"))
    task = Task(user_id=uid(), **fields)
    db.session.add(task)
    db.session.commit()
    return jsonify(task.to_dict()), 201


@app.get("/api/tasks/<int:task_id>")
@jwt_required()
def get_task(task_id):
    task = my_task(task_id)
    return jsonify(task.to_dict()) if task else err("Task not found", 404)


@app.route("/api/tasks/<int:task_id>", methods=["PUT", "PATCH"])
@jwt_required()
def update_task(task_id):
    task = my_task(task_id)
    if not task:
        return err("Task not found", 404)
    fields, e = clean_task(request.get_json(silent=True) or {}, partial=True)
    if e:
        return err(e, 400)
    if "category" in fields:
        fields["category_id"] = category_id_for(fields.pop("category"))
    for k, v in fields.items():
        setattr(task, k, v)
    db.session.commit()
    return jsonify(task.to_dict())


@app.patch("/api/tasks/<int:task_id>/toggle")
@jwt_required()
def toggle_task(task_id):
    task = my_task(task_id)
    if not task:
        return err("Task not found", 404)
    task.status = "pending" if task.status == "completed" else "completed"
    db.session.commit()
    return jsonify(task.to_dict())


@app.delete("/api/tasks/<int:task_id>")
@jwt_required()
def delete_task(task_id):
    task = my_task(task_id)
    if not task:
        return err("Task not found", 404)
    db.session.delete(task)
    db.session.commit()
    return "", 204


# ---------- dashboard ----------
@app.get("/api/dashboard/stats")
@jwt_required()
def stats():
    tasks, today = Task.query.filter_by(user_id=uid()).all(), date.today()
    done = sum(t.status == "completed" for t in tasks)
    open_dated = [t for t in tasks if t.status != "completed" and t.due_date]
    return jsonify(total=len(tasks), pending=sum(t.status == "pending" for t in tasks),
                   inProgress=sum(t.status == "in_progress" for t in tasks), completed=done,
                   completionRate=round(done / len(tasks) * 100) if tasks else 0,
                   dueToday=sum(t.due_date == today for t in open_dated),
                   upcomingCount=sum(t.due_date > today for t in open_dated))


# ---------- admin (role = admin only) ----------
@app.get("/api/admin/users")
@admin_only
def admin_users():
    """All registered users, each with their task counts."""
    by_user = {}
    for t in Task.query.all():
        by_user.setdefault(t.user_id, []).append(t)
    users = User.query.filter_by(role="user").order_by(User.name).all()
    return jsonify([dict(u.to_dict(), **progress(by_user.get(u.id, []))) for u in users])


@app.get("/api/admin/users/<int:user_id>/tasks")
@admin_only
def admin_user_tasks(user_id):
    """What one user is working on (optional ?status=)."""
    if not db.session.get(User, user_id):
        return err("User not found", 404)
    q = Task.query.filter_by(user_id=user_id)
    if request.args.get("status") and request.args["status"] != "all":
        q = q.filter(Task.status == request.args["status"])
    return jsonify([t.to_dict() for t in q.order_by(Task.created_at.desc())])


@app.get("/api/admin/tasks")
@admin_only
def admin_tasks():
    """Every task with its owner. Filters: ?status= ?userId= ?q="""
    a = request.args
    q = db.session.query(Task, User).join(User, Task.user_id == User.id)
    if a.get("status") and a["status"] != "all":
        q = q.filter(Task.status == a["status"])
    if a.get("userId"):
        if not a["userId"].isdigit():
            return err("userId must be a number", 400)
        q = q.filter(Task.user_id == int(a["userId"]))
    if a.get("q"):
        q = q.filter(Task.title.ilike(f"%{a['q']}%"))
    rows = q.order_by(Task.created_at.desc()).all()
    return jsonify([dict(t.to_dict(), userName=u.name, userEmail=u.email) for t, u in rows])


@app.get("/api/admin/team-progress")
@admin_only
def admin_team_progress():
    """One entry per user, in the shape the frontend admin page reads."""
    users = User.query.filter_by(role="user").order_by(User.name).all()
    by_user = {u.id: [] for u in users}
    for t in Task.query.order_by(Task.created_at.desc()).all():
        if t.user_id in by_user:
            by_user[t.user_id].append(t)
    result = []
    for u in users:
        tasks, p = by_user[u.id], progress(by_user[u.id])
        result.append({
            "user": u.to_dict(),
            "totalTasks": p["totalTasks"],
            "inProgressTasks": [t.to_dict() for t in tasks if t.status == "in_progress"],
            "otherTasks": [t.to_dict() for t in tasks if t.status != "in_progress"],
            "completedCount": p["completed"],
            "pendingCount": p["pending"],
            "inProgressCount": p["inProgress"],
            "completionRate": p["completionRate"],
        })
    return jsonify(result)


@app.get("/api/admin/stats")
@admin_only
def admin_stats():
    """Overall progress of all users, plus progress per user."""
    users = User.query.filter_by(role="user").order_by(User.name).all()
    by_user = {u.id: [] for u in users}
    for t in Task.query.all():
        if t.user_id in by_user:
            by_user[t.user_id].append(t)
    all_tasks = [t for ts in by_user.values() for t in ts]
    per_user = [{"id": str(u.id), "name": u.name, **progress(by_user[u.id])} for u in users]
    return jsonify(totalUsers=len(users), **progress(all_tasks), users=per_user)


def setup_database():
    db.create_all()  # creates the tables if they don't exist
    # older databases made before roles existed: add the role column
    if "role" not in [c["name"] for c in inspect(db.engine).get_columns("users")]:
        db.session.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR(10) NOT NULL DEFAULT 'user'"))
        db.session.commit()
    # one admin account (change the password in .env: ADMIN_EMAIL / ADMIN_PASSWORD)
    email = os.getenv("ADMIN_EMAIL", "admin@college.edu").lower()
    if not User.query.filter_by(email=email).first():
        db.session.add(User(name="Admin", email=email, role="admin",
                            password_hash=generate_password_hash(os.getenv("ADMIN_PASSWORD", "Admin@123"))))
        db.session.commit()


with app.app_context():
    setup_database()

if __name__ == "__main__":
    app.run(debug=True, port=5000)  # frontend expects http://localhost:5000/api
