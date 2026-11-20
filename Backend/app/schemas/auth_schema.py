def validate_register_input(data):
    """Validate user registration payload."""
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    pw = data.get("password") or ""
    if not name or "@" not in email or len(pw) < 6:
        return None, "name, valid email and password (min 6 characters) are required"
    return {"name": name, "email": email, "password": pw}, None


def validate_login_input(data):
    """Validate user login payload."""
    email = (data.get("email") or "").strip().lower()
    pw = data.get("password") or ""
    return {"email": email, "password": pw}
