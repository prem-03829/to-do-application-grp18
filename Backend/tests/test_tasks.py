import pytest


def test_create_task_full(auth_helper, client):
    """Test creating a task with all fields provided."""
    user = auth_helper.register_and_login("Task User", "taskuser@example.com", "Password123")
    payload = {
        "title": "Complete project documentation",
        "description": "Write comprehensive setup guides",
        "status": "in_progress",
        "priority": "high",
        "dueDate": "2026-12-01",
        "category": "Work"
    }
    resp = client.post("/api/tasks", headers=user["headers"], json=payload)
    assert resp.status_code == 201
    data = resp.get_json()
    assert data["title"] == payload["title"]
    assert data["description"] == payload["description"]
    assert data["status"] == "in_progress"
    assert data["priority"] == "high"
    assert data["dueDate"] == "2026-12-01"
    assert data["category"] == "Work"
    assert str(data["userId"]) == str(user["user"]["id"])


def test_create_task_title_only(auth_helper, client):
    """Test creating a task with only a title uses defaults."""
    user = auth_helper.register_and_login("Task User", "taskuser2@example.com", "Password123")
    resp = client.post("/api/tasks", headers=user["headers"], json={"title": "Buy groceries"})
    assert resp.status_code == 201
    data = resp.get_json()
    assert data["title"] == "Buy groceries"
    assert data["status"] == "pending"
    assert data["priority"] == "medium"
    assert data["category"] is None
    assert data["dueDate"] == ""


def test_create_task_empty_title_rejected(auth_helper, client):
    """Test that creating a task with an empty or whitespace title is rejected with 400."""
    user = auth_helper.register_and_login("Task User", "taskuser3@example.com", "Password123")
    resp1 = client.post("/api/tasks", headers=user["headers"], json={"title": ""})
    assert resp1.status_code == 400
    assert "title is required" in resp1.get_json().get("error", "")

    resp2 = client.post("/api/tasks", headers=user["headers"], json={"title": "   "})
    assert resp2.status_code == 400


def test_create_task_invalid_status_priority(auth_helper, client):
    """Test that invalid status or priority values are rejected with 400."""
    user = auth_helper.register_and_login("Task User", "taskuser4@example.com", "Password123")

    resp_status = client.post("/api/tasks", headers=user["headers"], json={
        "title": "Test",
        "status": "invalid_status"
    })
    assert resp_status.status_code == 400
    assert "status must be one of" in resp_status.get_json().get("error", "")

    resp_pri = client.post("/api/tasks", headers=user["headers"], json={
        "title": "Test",
        "priority": "ultra_high"
    })
    assert resp_pri.status_code == 400
    assert "priority must be one of" in resp_pri.get_json().get("error", "")


def test_list_tasks(auth_helper, client):
    """Test listing user tasks."""
    user = auth_helper.register_and_login("Task User", "taskuser5@example.com", "Password123")
    for i in range(3):
        client.post("/api/tasks", headers=user["headers"], json={"title": f"Task {i+1}"})

    resp = client.get("/api/tasks", headers=user["headers"])
    assert resp.status_code == 200
    data = resp.get_json()
    assert len(data) == 3


def test_filter_tasks_by_status(auth_helper, client):
    """Test filtering tasks by status."""
    user = auth_helper.register_and_login("Task User", "taskuser6@example.com", "Password123")
    client.post("/api/tasks", headers=user["headers"], json={"title": "Task 1", "status": "pending"})
    client.post("/api/tasks", headers=user["headers"], json={"title": "Task 2", "status": "in_progress"})
    client.post("/api/tasks", headers=user["headers"], json={"title": "Task 3", "status": "completed"})

    resp_pending = client.get("/api/tasks?status=pending", headers=user["headers"])
    assert len(resp_pending.get_json()) == 1
    assert resp_pending.get_json()[0]["title"] == "Task 1"

    resp_in_prog = client.get("/api/tasks?status=in_progress", headers=user["headers"])
    assert len(resp_in_prog.get_json()) == 1
    assert resp_in_prog.get_json()[0]["title"] == "Task 2"

    resp_done = client.get("/api/tasks?status=completed", headers=user["headers"])
    assert len(resp_done.get_json()) == 1
    assert resp_done.get_json()[0]["title"] == "Task 3"


def test_search_tasks_by_query(auth_helper, client):
    """Test searching tasks by title substring query ?q=."""
    user = auth_helper.register_and_login("Task User", "taskuser7@example.com", "Password123")
    client.post("/api/tasks", headers=user["headers"], json={"title": "Read Python book"})
    client.post("/api/tasks", headers=user["headers"], json={"title": "Buy milk"})

    resp = client.get("/api/tasks?q=python", headers=user["headers"])
    data = resp.get_json()
    assert len(data) == 1
    assert data[0]["title"] == "Read Python book"


def test_sort_tasks(auth_helper, client):
    """Test sorting tasks by title asc and desc."""
    user = auth_helper.register_and_login("Task User", "taskuser8@example.com", "Password123")
    client.post("/api/tasks", headers=user["headers"], json={"title": "B Task"})
    client.post("/api/tasks", headers=user["headers"], json={"title": "A Task"})
    client.post("/api/tasks", headers=user["headers"], json={"title": "C Task"})

    resp_asc = client.get("/api/tasks?sort=title:asc", headers=user["headers"])
    titles_asc = [t["title"] for t in resp_asc.get_json()]
    assert titles_asc == ["A Task", "B Task", "C Task"]

    resp_desc = client.get("/api/tasks?sort=title:desc", headers=user["headers"])
    titles_desc = [t["title"] for t in resp_desc.get_json()]
    assert titles_desc == ["C Task", "B Task", "A Task"]


def test_get_update_toggle_delete_task(auth_helper, client):
    """Test single task CRUD operations: get, update, toggle, delete."""
    user = auth_helper.register_and_login("Task User", "taskuser9@example.com", "Password123")
    h = user["headers"]

    # 1. Create
    create_resp = client.post("/api/tasks", headers=h, json={"title": "Initial Title", "priority": "low"})
    task_id = create_resp.get_json()["id"]

    # 2. Get
    get_resp = client.get(f"/api/tasks/{task_id}", headers=h)
    assert get_resp.status_code == 200
    assert get_resp.get_json()["title"] == "Initial Title"

    # 3. Update
    up_resp = client.put(f"/api/tasks/{task_id}", headers=h, json={"title": "Updated Title", "priority": "high"})
    assert up_resp.status_code == 200
    assert up_resp.get_json()["title"] == "Updated Title"
    assert up_resp.get_json()["priority"] == "high"

    # 4. Toggle
    tog_resp = client.patch(f"/api/tasks/{task_id}/toggle", headers=h)
    assert tog_resp.status_code == 200
    assert tog_resp.get_json()["status"] == "completed"

    tog_back = client.patch(f"/api/tasks/{task_id}/toggle", headers=h)
    assert tog_back.status_code == 200
    assert tog_back.get_json()["status"] == "pending"

    # 5. Delete
    del_resp = client.delete(f"/api/tasks/{task_id}", headers=h)
    assert del_resp.status_code == 204

    # 6. Verify deleted
    get_again = client.get(f"/api/tasks/{task_id}", headers=h)
    assert get_again.status_code == 404


def test_category_handling(auth_helper, client):
    """Test that categories are auto-created by name, filterable, and can be cleared."""
    user = auth_helper.register_and_login("Cat User", "catuser@example.com", "Password123")
    h = user["headers"]

    # Create task with category
    t1 = client.post("/api/tasks", headers=h, json={"title": "Task in Home", "category": "Home"}).get_json()
    assert t1["category"] == "Home"

    # Filter by category
    resp_home = client.get("/api/tasks?category=Home", headers=h)
    assert len(resp_home.get_json()) == 1

    resp_other = client.get("/api/tasks?category=Work", headers=h)
    assert len(resp_other.get_json()) == 0

    # Clear category by sending empty string
    updated = client.put(f"/api/tasks/{t1['id']}", headers=h, json={"category": ""}).get_json()
    assert updated["category"] is None
