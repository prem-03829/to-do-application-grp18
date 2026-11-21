# TaskFlow

## Prerequisites

- Python
- Node.js and npm
- MySQL 8

## 1. Database Setup

1. Start the MySQL server.
2. Create the project database named `todo_db`.
3. Execute the database schema from the project root:

```sql
SOURCE database/schema.sql;
```

## 2. Backend Setup

Open a terminal from the project root:

```bash
cd Backend
python -m venv .venv
source .venv/Scripts/activate
pip install -r requirements.txt
```

Create `Backend/.env` using `Backend/.env.example` as a reference and configure your local database credentials and application settings.

Start the backend:

```bash
python main.py
```

Backend API: http://localhost:5000/api


## 3. Frontend Setup

Open another terminal from the project root:

```bash
cd Frontend
npm install
```

Create `Frontend/.env.local` and configure it to use the local backend with mock API mode disabled.

Start the frontend:

```bash
npm run dev
```

## 4. Access the Application

Open the application in your browser:

http://localhost:5173

Keep both the backend and frontend terminals running while using the application.

## Default Admin Account

The backend is configured to create an initial admin account using the credentials specified in `Backend/.env`.

**Default credentials:**
- Email: `admin@college.edu`
- Password: `Admin@123`

Use these credentials to log in to the application and access the admin dashboard.

**Security:** Change the default admin password after the first login. Never use the default credentials in a production deployment.

## 5. Stop the Application

Press `Ctrl + C` in each terminal to stop the respective server.