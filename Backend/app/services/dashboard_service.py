from datetime import date

from app.models.task import Task


def get_dashboard_stats(user_id: int):
    """Compute dashboard statistics for the given user."""
    tasks = Task.query.filter_by(user_id=user_id).all()
    today = date.today()
    done = sum(t.status == "completed" for t in tasks)
    open_dated = [t for t in tasks if t.status != "completed" and t.due_date]
    return {
        "total": len(tasks),
        "pending": sum(t.status == "pending" for t in tasks),
        "inProgress": sum(t.status == "in_progress" for t in tasks),
        "completed": done,
        "completionRate": round(done / len(tasks) * 100) if tasks else 0,
        "dueToday": sum(t.due_date == today for t in open_dated),
        "upcomingCount": sum(t.due_date > today for t in open_dated),
    }
