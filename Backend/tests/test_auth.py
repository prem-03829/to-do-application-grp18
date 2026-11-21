import pytest


def test_register_valid(client):
    """Test valid user registration."""
    resp = client.post("/api/auth/register", json={
        "name": "Alice Smith",
        "email": "alice@example.com",
        "password": "Password123"
    })
    assert resp.status_code == 201
    data = resp.get_json()
    assert data["name"] == "Alice Smith"
    assert data["email"] == "alice@example.com"
    assert data["role"] == "user"
    assert "id" in data


def test_register_duplicate_email(client, auth_helper):
    """Test registration with already registered email fails with 409."""
    auth_helper.register("Alice", "alice@example.com", "Password123")
    resp = client.post("/api/auth/register", json={
        "name": "Alice 2",
        "email": "alice@example.com",
        "password": "Password123"
    })
    assert resp.status_code == 409
    assert "Email already registered" in resp.get_json().get("error", "")


def test_register_short_password(client):
    """Test registration with password under 6 characters returns 400."""
    resp = client.post("/api/auth/register", json={
        "name": "Bob",
        "email": "bob@example.com",
        "password": "12345"
    })
    assert resp.status_code == 400
    assert "min 6 characters" in resp.get_json().get("error", "")


def test_register_invalid_email(client):
    """Test registration without valid email format returns 400."""
    resp = client.post("/api/auth/register", json={
        "name": "Bob",
        "email": "invalid-email-at-domain",
        "password": "Password123"
    })
    assert resp.status_code == 400
    assert "valid email" in resp.get_json().get("error", "")


def test_register_ignores_client_role(client):
    """Registration must always create a 'user' and ignore role='admin' sent in payload."""
    resp = client.post("/api/auth/register", json={
        "name": "Malicious User",
        "email": "hacker@example.com",
        "password": "Password123",
        "role": "admin"
    })
    assert resp.status_code == 201
    data = resp.get_json()
    assert data["role"] == "user"

    # Verify when logging in, the role remains 'user'
    login_resp = client.post("/api/auth/login", json={
        "email": "hacker@example.com",
        "password": "Password123"
    })
    assert login_resp.status_code == 200
    assert login_resp.get_json()["user"]["role"] == "user"


def test_login_success(auth_helper):
    """Test login with correct credentials."""
    auth_helper.register("Charlie", "charlie@example.com", "Password123")
    resp = auth_helper.login("charlie@example.com", "Password123")
    assert resp.status_code == 200
    data = resp.get_json()
    assert "token" in data
    assert data["user"]["email"] == "charlie@example.com"
    assert data["user"]["name"] == "Charlie"


def test_login_wrong_password(auth_helper):
    """Test login with wrong password returns 401."""
    auth_helper.register("Charlie", "charlie@example.com", "Password123")
    resp = auth_helper.login("charlie@example.com", "wrongpassword")
    assert resp.status_code == 401
    assert "Invalid email or password" in resp.get_json().get("error", "")


def test_login_nonexistent_email(client):
    """Test login with non-existent email returns 401."""
    resp = client.post("/api/auth/login", json={
        "email": "nobody@example.com",
        "password": "somepassword"
    })
    assert resp.status_code == 401
    assert "Invalid email or password" in resp.get_json().get("error", "")


def test_protected_endpoint_without_token(client):
    """Protected endpoints require valid Bearer token, returning 401 if missing."""
    resp = client.get("/api/tasks")
    assert resp.status_code == 401
    assert resp.get_json().get("error") == "Login required"

    resp_me = client.get("/api/auth/me")
    assert resp_me.status_code == 401


def test_me_endpoint_with_token(auth_helper, client):
    """Test /api/auth/me returns current user identity."""
    user_info = auth_helper.register_and_login("Dana", "dana@example.com", "Password123")
    resp = client.get("/api/auth/me", headers=user_info["headers"])
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["email"] == "dana@example.com"
    assert data["name"] == "Dana"
    assert data["role"] == "user"


def test_logout_and_token_revocation(auth_helper, client):
    """Test that after logging out, the token is revoked and cannot access protected routes."""
    user_info = auth_helper.register_and_login("Eve", "eve@example.com", "Password123")
    headers = user_info["headers"]

    # Can access before logout
    check_resp = client.get("/api/auth/me", headers=headers)
    assert check_resp.status_code == 200

    # Logout
    logout_resp = client.post("/api/auth/logout", headers=headers)
    assert logout_resp.status_code == 200
    assert logout_resp.get_json().get("message") == "Logged out"

    # Attempting to access protected route with revoked token should fail with 401
    after_resp = client.get("/api/auth/me", headers=headers)
    assert after_resp.status_code == 401
