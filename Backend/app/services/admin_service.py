from app.database import db
from app.models.task import Task
from app.models.user import User
from app.schemas.task_schema import progress


def get_admin_users():
    """All registered users, each with their task counts."""
    by_user = {}
    for t in Task.query.all():
        by_user.setdefault(t.user_id, []).append(t)
    users = User.query.filter_by(role="user").order_by(User.name).all()
    return [dict(u.to_dict(), **progress(by_user.get(u.id, []))) for u in users]


def get_admin_user_tasks(user_id: int, status_filter: str = None):
    """What one user is working on (optional ?status=)."""
    if not db.session.get(User, user_id):
        return None, "User not found", 404
    q = Task.query.filter_by(user_id=user_id)
    if status_filter and status_filter != "all":
        q = q.filter(Task.status == status_filter)
    tasks = q.order_by(Task.created_at.desc()).all()
    return [t.to_dict() for t in tasks], None, 200


def get_admin_tasks(args: dict):
    """Every task with its owner. Filters: ?status= ?userId= ?q="""
    q = db.session.query(Task, User).join(User, Task.user_id == User.id)
    if args.get("status") and args["status"] != "all":
        q = q.filter(Task.status == args["status"])
    if args.get("userId"):
        if not args["userId"].isdigit():
            return None, "userId must be a number", 400
        q = q.filter(Task.user_id == int(args["userId"]))
    if args.get("q"):
        q = q.filter(Task.title.ilike(f"%{args['q']}%"))
    rows = q.order_by(Task.created_at.desc()).all()
    return [dict(t.to_dict(), userName=u.name, userEmail=u.email) for t, u in rows], None, 200


def get_admin_team_progress():
    """One entry per user, in the shape the frontend admin page reads."""
    users = User.query.filter_by(role="user").order_by(User.name).all()
    by_user = {u.id: [] for u in users}
    for t in Task.query.order_by(Task.created_at.desc()).all():
        if t.user_id in by_user:
            by_user[t.user_id].append(t)
    result = []
    for u in users:
        tasks = by_user[u.id]
        p = progress(tasks)
        result.append(
            {
                "user": u.to_dict(),
                "totalTasks": p["totalTasks"],
                "inProgressTasks": [t.to_dict() for t in tasks if t.status == "in_progress"],
                "otherTasks": [t.to_dict() for t in tasks if t.status != "in_progress"],
                "completedCount": p["completed"],
                "pendingCount": p["pending"],
                "inProgressCount": p["inProgress"],
                "completionRate": p["completionRate"],
            }
        )
    return result


def get_admin_stats():
    """Overall progress of all users, plus progress per user."""
    users = User.query.filter_by(role="user").order_by(User.name).all()
    by_user = {u.id: [] for u in users}
    for t in Task.query.all():
        if t.user_id in by_user:
            by_user[t.user_id].append(t)
    all_tasks = [t for ts in by_user.values() for t in ts]
    per_user = [{"id": str(u.id), "name": u.name, **progress(by_user[u.id])} for u in users]
    return dict(totalUsers=len(users), **progress(all_tasks), users=per_user)
