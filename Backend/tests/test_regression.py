import pytest


def test_regression_admin_assigns_task_to_user_x(auth_helper, admin_headers, client):
    """REGRESSION FIX A: When admin creates a task with userId=X, it is saved under User X, not the admin."""
    user_x = auth_helper.register_and_login("User X", "user_x@example.com", "Password123")
    user_x_id = user_x["user"]["id"]

    payload = {
        "title": "Admin Assigned Task",
        "description": "Assigned specifically to User X",
        "userId": str(user_x_id),
        "priority": "high",
        "status": "pending",
        "category": "Assigned"
    }
    resp = client.post("/api/tasks", headers=admin_headers, json=payload)
    assert resp.status_code == 201
    created_task = resp.get_json()

    # Must be associated with User X
    assert str(created_task["userId"]) == str(user_x_id)

    # User X must see this task in their own task list
    x_tasks = client.get("/api/tasks", headers=user_x["headers"]).get_json()
    assert len(x_tasks) == 1
    assert x_tasks[0]["title"] == "Admin Assigned Task"


def test_regression_admin_can_open_user_task(auth_helper, admin_headers, client):
    """REGRESSION FIX B: Admin can open another user's task by ID (200 OK), while User Y cannot (404)."""
    user_x = auth_helper.register_and_login("User X", "user_x_open@example.com", "Password123")
    user_y = auth_helper.register_and_login("User Y", "user_y_open@example.com", "Password123")

    # User X creates a task
    t_resp = client.post("/api/tasks", headers=user_x["headers"], json={"title": "User X Private Task"})
    task_id = t_resp.get_json()["id"]

    # Admin opens User X's task -> 200 OK
    admin_get = client.get(f"/api/tasks/{task_id}", headers=admin_headers)
    assert admin_get.status_code == 200
    assert admin_get.get_json()["title"] == "User X Private Task"
    assert str(admin_get.get_json()["userId"]) == str(user_x["user"]["id"])

    # User Y tries to open User X's task -> 404
    user_y_get = client.get(f"/api/tasks/{task_id}", headers=user_y["headers"])
    assert user_y_get.status_code == 404
