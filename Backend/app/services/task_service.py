from sqlalchemy import case

from app.database import db
from app.models.task import Category, Task


def get_user_task(task_id: int, user_id: int):
    """Retrieve a single task owned by the user."""
    return Task.query.filter_by(id=task_id, user_id=user_id).first()


def category_id_for(user_id: int, name: str):
    """The frontend sends a category name; find or create it and return its id."""
    name = (name or "").strip()[:100]
    if not name:
        return None
    cat = Category.query.filter_by(user_id=user_id, name=name).first()
    if not cat:
        cat = Category(user_id=user_id, name=name)
        db.session.add(cat)
        db.session.flush()
    return cat.id


def list_tasks(user_id: int, args: dict):
    """List tasks owned by user with filters and sorting."""
    q = Task.query.filter_by(user_id=user_id)
    for field, col in (("status", Task.status), ("priority", Task.priority)):
        if args.get(field) and args[field] != "all":
            q = q.filter(col == args[field])
    if args.get("category") and args["category"] != "all":
        q = q.join(Category, Task.category_id == Category.id).filter(Category.name == args["category"])
    if args.get("q"):
        q = q.filter(Task.title.ilike(f"%{args['q']}%"))
    rank = case({"low": 1, "medium": 2, "high": 3}, value=Task.priority)
    # frontend sends sort=field:order (e.g. dueDate:asc); sortBy/sortOrder also accepted
    by, _, order = (args.get("sort") or "").partition(":")
    by, order = args.get("sortBy") or by, args.get("sortOrder") or order or "desc"
    col = {
        "dueDate": Task.due_date,
        "createdAt": Task.created_at,
        "priority": rank,
        "title": Task.title,
    }.get(by, Task.created_at)
    col = col.asc() if order == "asc" else col.desc()
    tasks = q.order_by(col, Task.id.desc()).all()
    return [t.to_dict() for t in tasks]


def create_task(user_id: int, fields: dict):
    """Create a new task for the given user."""
    if "category" in fields:
        fields["category_id"] = category_id_for(user_id, fields.pop("category"))
    task = Task(user_id=user_id, **fields)
    db.session.add(task)
    db.session.commit()
    return task


def update_task(task: Task, user_id: int, fields: dict):
    """Update an existing task."""
    if "category" in fields:
        fields["category_id"] = category_id_for(user_id, fields.pop("category"))
    for k, v in fields.items():
        setattr(task, k, v)
    db.session.commit()
    return task


def toggle_task(task: Task):
    """Toggle task status between pending and completed."""
    task.status = "pending" if task.status == "completed" else "completed"
    db.session.commit()
    return task


def delete_task(task: Task):
    """Delete a task."""
    db.session.delete(task)
    db.session.commit()
