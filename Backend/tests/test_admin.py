import pytest


def test_admin_endpoints_blocked_for_normal_users(auth_helper, client):
    """A normal user must receive 403 on all admin endpoints."""
    user = auth_helper.register_and_login("Normal User", "normal@example.com", "Password123")
    headers = user["headers"]

    admin_urls = [
        "/api/admin/users",
        "/api/admin/tasks",
        "/api/admin/stats",
        "/api/admin/users/1/tasks",
        "/api/admin/team-progress"
    ]
    for url in admin_urls:
        resp = client.get(url, headers=headers)
        assert resp.status_code == 403, f"Expected 403 for normal user on {url}, got {resp.status_code}"
        assert "Admin access only" in resp.get_json().get("error", "")


def test_admin_endpoints_require_token(client):
    """Admin endpoints without authentication must return 401."""
    admin_urls = [
        "/api/admin/users",
        "/api/admin/tasks",
        "/api/admin/stats",
        "/api/admin/team-progress"
    ]
    for url in admin_urls:
        resp = client.get(url)
        assert resp.status_code == 401


def test_admin_view_all_users_and_tasks(auth_helper, admin_headers, client):
    """Admin can list all registered standard users with their task counts."""
    # Create two standard users with tasks
    u1 = auth_helper.register_and_login("Alice", "alice_admin@example.com", "Password123")
    u2 = auth_helper.register_and_login("Bob", "bob_admin@example.com", "Password123")

    client.post("/api/tasks", headers=u1["headers"], json={"title": "A Task 1", "status": "completed"})
    client.post("/api/tasks", headers=u1["headers"], json={"title": "A Task 2", "status": "pending"})
    client.post("/api/tasks", headers=u2["headers"], json={"title": "B Task 1", "status": "in_progress"})

    # Admin calls /api/admin/users
    resp = client.get("/api/admin/users", headers=admin_headers)
    assert resp.status_code == 200
    users = resp.get_json()
    assert len(users) == 2

    alice_entry = next(u for u in users if u["email"] == "alice_admin@example.com")
    assert alice_entry["totalTasks"] == 2
    assert alice_entry["completed"] == 1
    assert alice_entry["pending"] == 1
    assert alice_entry["completionRate"] == 50

    bob_entry = next(u for u in users if u["email"] == "bob_admin@example.com")
    assert bob_entry["totalTasks"] == 1
    assert bob_entry["inProgress"] == 1
    assert bob_entry["completed"] == 0
    assert bob_entry["completionRate"] == 0


def test_admin_view_specific_user_tasks(auth_helper, admin_headers, client):
    """Admin can view tasks of a specific user with optional status filter."""
    u = auth_helper.register_and_login("Charlie", "charlie_admin@example.com", "Password123")
    u_id = u["user"]["id"]

    client.post("/api/tasks", headers=u["headers"], json={"title": "Work 1", "status": "pending"})
    client.post("/api/tasks", headers=u["headers"], json={"title": "Work 2", "status": "completed"})

    resp_all = client.get(f"/api/admin/users/{u_id}/tasks", headers=admin_headers)
    assert resp_all.status_code == 200
    assert len(resp_all.get_json()) == 2

    resp_pending = client.get(f"/api/admin/users/{u_id}/tasks?status=pending", headers=admin_headers)
    assert len(resp_pending.get_json()) == 1
    assert resp_pending.get_json()[0]["title"] == "Work 1"

    # Non-existent user returns 404
    resp_404 = client.get("/api/admin/users/99999/tasks", headers=admin_headers)
    assert resp_404.status_code == 404


def test_admin_team_progress_and_stats(auth_helper, admin_headers, client):
    """Admin team-progress and stats endpoints accurately reflect all user metrics."""
    u1 = auth_helper.register_and_login("Member 1", "m1@example.com", "Password123")
    u2 = auth_helper.register_and_login("Member 2", "m2@example.com", "Password123")

    client.post("/api/tasks", headers=u1["headers"], json={"title": "M1 active", "status": "in_progress"})
    client.post("/api/tasks", headers=u2["headers"], json={"title": "M2 done", "status": "completed"})

    # Team Progress
    resp_tp = client.get("/api/admin/team-progress", headers=admin_headers)
    assert resp_tp.status_code == 200
    tp = resp_tp.get_json()
    assert len(tp) == 2

    # Overall Stats
    resp_stats = client.get("/api/admin/stats", headers=admin_headers)
    assert resp_stats.status_code == 200
    stats = resp_stats.get_json()
    assert stats["totalUsers"] == 2
    assert stats["totalTasks"] == 2
    assert stats["completed"] == 1
    assert stats["inProgress"] == 1
    assert stats["completionRate"] == 50
