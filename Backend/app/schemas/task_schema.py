from datetime import date

STATUSES = ("pending", "in_progress", "completed")  # same as frontend types
PRIORITIES = ("low", "medium", "high")


def progress(tasks):
    """Counts of a list of tasks by status, plus completion percentage."""
    done = sum(t.status == "completed" for t in tasks)
    return {
        "totalTasks": len(tasks),
        "pending": sum(t.status == "pending" for t in tasks),
        "inProgress": sum(t.status == "in_progress" for t in tasks),
        "completed": done,
        "completionRate": round(done / len(tasks) * 100) if tasks else 0,
    }


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
