import pytest


def test_user_b_cannot_access_user_a_task(auth_helper, client):
    """User B cannot view, update, toggle or delete User A's task."""
    user_a = auth_helper.register_and_login("User A", "user_a@example.com", "Password123")
    user_b = auth_helper.register_and_login("User B", "user_b@example.com", "Password123")

    # User A creates a task
    t = client.post("/api/tasks", headers=user_a["headers"], json={"title": "Secret Task"}).get_json()
    task_id = t["id"]

    # User B tries to view User A's task -> 404
    resp_get = client.get(f"/api/tasks/{task_id}", headers=user_b["headers"])
    assert resp_get.status_code == 404

    # User B tries to update User A's task -> 404
    resp_put = client.put(f"/api/tasks/{task_id}", headers=user_b["headers"], json={"title": "Hacked"})
    assert resp_put.status_code == 404

    # User B tries to toggle User A's task -> 404
    resp_tog = client.patch(f"/api/tasks/{task_id}/toggle", headers=user_b["headers"])
    assert resp_tog.status_code == 404

    # User B tries to delete User A's task -> 404
    resp_del = client.delete(f"/api/tasks/{task_id}", headers=user_b["headers"])
    assert resp_del.status_code == 404


def test_task_lists_are_strictly_isolated(auth_helper, client):
    """User B's task list never contains User A's tasks."""
    user_a = auth_helper.register_and_login("User A", "user_a2@example.com", "Password123")
    user_b = auth_helper.register_and_login("User B", "user_b2@example.com", "Password123")

    client.post("/api/tasks", headers=user_a["headers"], json={"title": "Task A1"})
    client.post("/api/tasks", headers=user_a["headers"], json={"title": "Task A2"})
    client.post("/api/tasks", headers=user_b["headers"], json={"title": "Task B1"})

    list_a = client.get("/api/tasks", headers=user_a["headers"]).get_json()
    assert len(list_a) == 2
    assert all(t["userId"] == str(user_a["user"]["id"]) for t in list_a)

    list_b = client.get("/api/tasks", headers=user_b["headers"]).get_json()
    assert len(list_b) == 1
    assert list_b[0]["title"] == "Task B1"
    assert list_b[0]["userId"] == str(user_b["user"]["id"])


def test_non_admin_cannot_assign_task_to_other_user(auth_helper, client):
    """A normal user sending another user's userId when creating a task must NOT save under that user."""
    user_a = auth_helper.register_and_login("User A", "user_a3@example.com", "Password123")
    user_b = auth_helper.register_and_login("User B", "user_b3@example.com", "Password123")

    # User B tries to send User A's ID
    payload = {
        "title": "Maliciously Assigned Task",
        "userId": str(user_a["user"]["id"])
    }
    resp = client.post("/api/tasks", headers=user_b["headers"], json=payload)
    assert resp.status_code == 201
    created_task = resp.get_json()

    # The task must be saved under User B (the caller), NOT User A
    assert str(created_task["userId"]) == str(user_b["user"]["id"])

    # User A's list must NOT have this task
    list_a = client.get("/api/tasks", headers=user_a["headers"]).get_json()
    assert len(list_a) == 0
