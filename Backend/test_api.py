"""Run: python test_api.py  (uses a temporary in-memory database)"""
import os
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
from main import app

c = app.test_client()

def check(label, resp, code):
    print("PASS" if resp.status_code == code else "FAIL", label, resp.status_code)
    assert resp.status_code == code, resp.get_data(as_text=True)
    return resp

check("register", c.post("/api/auth/register", json={"name": "A", "email": "a@x.com", "password": "secret1"}), 201)
check("register duplicate", c.post("/api/auth/register", json={"name": "A", "email": "a@x.com", "password": "secret1"}), 409)
check("login wrong password", c.post("/api/auth/login", json={"email": "a@x.com", "password": "bad"}), 401)
tok = check("login", c.post("/api/auth/login", json={"email": "a@x.com", "password": "secret1"}), 200).get_json()["token"]
h = {"Authorization": f"Bearer {tok}"}
check("no token", c.get("/api/tasks"), 401)
check("me", c.get("/api/auth/me", headers=h), 200)
t = check("add task", c.post("/api/tasks", headers=h, json={"title": "Buy milk", "priority": "high", "dueDate": "2026-11-21", "category": "Home"}), 201).get_json()
assert t["category"] == "Home"
t2 = c.post("/api/tasks", headers=h, json={"title": "Second", "category": "Home"}).get_json()
assert len(c.get("/api/tasks?category=Home", headers=h).get_json()) == 2
assert len(c.get("/api/tasks?category=Other", headers=h).get_json()) == 0
assert c.put(f"/api/tasks/{t2['id']}", headers=h, json={"category": ""}).get_json()["category"] is None
c.delete(f"/api/tasks/{t2['id']}", headers=h)
print("PASS category by name")
check("add invalid", c.post("/api/tasks", headers=h, json={"title": ""}), 400)
check("add invalid status", c.post("/api/tasks", headers=h, json={"title": "x", "status": "done"}), 400)
check("add without date", c.post("/api/tasks", headers=h, json={"title": "x", "dueDate": ""}), 201)
assert len(check("view all", c.get("/api/tasks?status=pending&q=milk&sortBy=priority&sortOrder=desc", headers=h), 200).get_json()) == 1
r = check("sort title asc", c.get("/api/tasks?sort=title:asc", headers=h), 200).get_json()
assert [x["title"] for x in r] == sorted(x["title"] for x in r)
r = check("sort title desc", c.get("/api/tasks?sort=title:desc", headers=h), 200).get_json()
assert [x["title"] for x in r] == sorted((x["title"] for x in r), reverse=True)
check("view one", c.get(f"/api/tasks/{t['id']}", headers=h), 200)
assert check("update", c.put(f"/api/tasks/{t['id']}", headers=h, json={"status": "in_progress"}), 200).get_json()["status"] == "in_progress"
assert check("toggle", c.patch(f"/api/tasks/{t['id']}/toggle", headers=h), 200).get_json()["status"] == "completed"
print(check("stats", c.get("/api/dashboard/stats", headers=h), 200).get_json())
c.post("/api/auth/register", json={"name": "B", "email": "b@x.com", "password": "secret2"})
h2 = {"Authorization": "Bearer " + c.post("/api/auth/login", json={"email": "b@x.com", "password": "secret2"}).get_json()["token"]}
check("other user cannot see task", c.get(f"/api/tasks/{t['id']}", headers=h2), 404)

# ----- roles and admin -----
assert c.post("/api/auth/login", json={"email": "a@x.com", "password": "secret1"}).get_json()["user"]["role"] == "user"
r = c.post("/api/auth/register", json={"name": "Sneaky", "email": "s@x.com", "password": "secret3", "role": "admin"})
assert r.get_json()["role"] == "user"; print("PASS register cannot make admin")
login = check("admin login", c.post("/api/auth/login", json={"email": "admin@college.edu", "password": "Admin@123"}), 200).get_json()
assert login["user"]["role"] == "admin"
ha = {"Authorization": f"Bearer {login['token']}"}
for url in ("/api/admin/users", "/api/admin/tasks", "/api/admin/stats", "/api/admin/users/1/tasks", "/api/admin/team-progress"):
    check(f"user blocked from {url}", c.get(url, headers=h2), 403)
check("no token admin", c.get("/api/admin/users"), 401)
users = check("admin users", c.get("/api/admin/users", headers=ha), 200).get_json()
assert all(u["role"] == "user" for u in users) and {u["email"] for u in users} == {"a@x.com", "b@x.com", "s@x.com"}
a_user = next(u for u in users if u["email"] == "a@x.com")
assert a_user["totalTasks"] == 2 and a_user["completed"] == 1 and a_user["pending"] == 1, a_user
print(users[0])
uid_a = a_user["id"]
assert len(check("admin one user tasks", c.get(f"/api/admin/users/{uid_a}/tasks", headers=ha), 200).get_json()) == 2
assert len(c.get(f"/api/admin/users/{uid_a}/tasks?status=completed", headers=ha).get_json()) == 1
check("admin unknown user", c.get("/api/admin/users/999/tasks", headers=ha), 404)
rows = check("admin all tasks", c.get("/api/admin/tasks", headers=ha), 200).get_json()
assert len(rows) == 2 and rows[0]["userName"] == "A" and "userEmail" in rows[0]
assert len(c.get(f"/api/admin/tasks?userId={uid_a}&status=pending", headers=ha).get_json()) == 1
check("admin bad userId", c.get("/api/admin/tasks?userId=abc", headers=ha), 400)
st = check("admin stats", c.get("/api/admin/stats", headers=ha), 200).get_json()
assert st["totalUsers"] == 3 and st["totalTasks"] == 2 and st["completed"] == 1 and st["completionRate"] == 50, st
print(st)
tp = check("team-progress", c.get("/api/admin/team-progress", headers=ha), 200).get_json()
assert [e["user"]["name"] for e in tp] == ["A", "B", "Sneaky"], tp
ea = tp[0]
assert set(ea) == {"user", "totalTasks", "inProgressTasks", "otherTasks", "completedCount",
                   "pendingCount", "inProgressCount", "completionRate"}, set(ea)
assert (ea["totalTasks"], ea["completedCount"], ea["pendingCount"], ea["inProgressCount"], ea["completionRate"]) == (2, 1, 1, 0, 50)
assert ea["inProgressTasks"] == [] and len(ea["otherTasks"]) == 2 and ea["otherTasks"][0]["id"]
bt = c.post("/api/tasks", headers=h2, json={"title": "B work", "status": "in_progress"}).get_json()
eb = c.get("/api/admin/team-progress", headers=ha).get_json()[1]
assert eb["inProgressCount"] == 1 and eb["inProgressTasks"][0]["title"] == "B work" and eb["completionRate"] == 0
# admin cannot change another user's task through the normal task API
check("admin cannot toggle user task", c.patch(f"/api/tasks/{bt['id']}/toggle", headers=ha), 404)
c.delete(f"/api/tasks/{bt['id']}", headers=h2)
print("PASS team-progress")

check("delete", c.delete(f"/api/tasks/{t['id']}", headers=h), 204)
check("logout", c.post("/api/auth/logout", headers=h), 200)
check("token dead after logout", c.get("/api/tasks", headers=h), 401)
print("ALL OK")
