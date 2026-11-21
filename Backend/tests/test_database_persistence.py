import pytest
from app.database import db
from app.models.task import Task


def test_database_persistence_across_requests(app, auth_helper, client):
    """Verify that tasks created through the API persist across separate client requests and in the DB."""
    user = auth_helper.register_and_login("Persist User", "persist@example.com", "Password123")
    h = user["headers"]

    # Request 1: Create
    c_resp = client.post("/api/tasks", headers=h, json={"title": "Persistent Task", "priority": "high"})
    task_id = int(c_resp.get_json()["id"])

    # Request 2: Read through API
    r_resp = client.get(f"/api/tasks/{task_id}", headers=h)
    assert r_resp.status_code == 200
    assert r_resp.get_json()["title"] == "Persistent Task"

    # Direct database check
    with app.app_context():
        db_task = db.session.get(Task, task_id)
        assert db_task is not None
        assert db_task.title == "Persistent Task"
        assert db_task.priority == "high"


def test_deleting_task_removes_database_row(app, auth_helper, client):
    """Verify that deleting a task through the API completely removes the row from the database."""
    user = auth_helper.register_and_login("Delete User", "delete_user@example.com", "Password123")
    h = user["headers"]

    # Create task
    c_resp = client.post("/api/tasks", headers=h, json={"title": "To be deleted"})
    task_id = int(c_resp.get_json()["id"])

    # Verify exists in DB
    with app.app_context():
        assert db.session.get(Task, task_id) is not None

    # Delete via API
    del_resp = client.delete(f"/api/tasks/{task_id}", headers=h)
    assert del_resp.status_code == 204

    # Verify removed from DB
    with app.app_context():
        assert db.session.get(Task, task_id) is None

    # Verify 404 through API
    get_resp = client.get(f"/api/tasks/{task_id}", headers=h)
    assert get_resp.status_code == 404
