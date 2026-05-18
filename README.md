# LMS Monorepo

A role-based Learning Management System with:
- Django backend API (authentication, roles, course management)
- React frontend client (student/teacher/admin UI)
- Real-time course updates via WebSocket

## Project Purpose

This project provides a complete LMS workflow where:
- Students can browse and enroll in courses
- Teachers can manage their own courses
- Admins can manage all courses and users

## Tech Stack Overview

### Backend
- Python 3.10+
- Django 4.2
- Django REST Framework
- JWT auth via SimpleJWT
- Django Channels + Daphne (WebSocket support)
- SQLite (local), PostgreSQL-ready (production settings)

### Frontend
- React 18
- Vite 5
- JavaScript (ES modules + JSX)
- CSS

## How Frontend and Backend Connect

1. Frontend sends HTTP requests to backend REST endpoints (login, courses, enrollments, admin/teacher actions).
2. Backend returns JWT tokens (`access` and `refresh`) used for authenticated API calls.
3. Frontend opens a WebSocket connection to:
   - `ws://<backend-host>/ws/courses/?token=<access_token>`
4. Backend broadcasts course create/update/delete events, and frontend updates UI in real time.

Default local backend base URL used by frontend is `http://127.0.0.1:8000`.

## Deployment Links

Update these with your live URLs:
- Frontend: `https://<your-frontend-url>`
- Backend API: `https://<your-backend-url>`

## Setup Instructions (Both Apps)

### 1. Backend Setup

Run from repository root:

```bash
cd BACKEND/backend/django_lms
python -m venv venv
# Windows (PowerShell)
venv\Scripts\Activate.ps1
# macOS/Linux
# source venv/bin/activate
pip install -r requirements.txt
```

Create `.env` in `BACKEND/backend/django_lms` with at least:

```env
SECRET_KEY=replace-this-with-a-real-key
```

Initialize database and start server:

```bash
python manage.py migrate
python manage.py seed_demo_users
python manage.py runserver
```

Backend runs at `http://127.0.0.1:8000`.

Detailed backend guide: `BACKEND/backend/django_lms/README.md`

### 2. Frontend Setup

In a separate terminal, run:

```bash
cd FRONTEND/FrontendLMS
npm install
npm run dev
```

Frontend dev server runs at `http://localhost:5173` (or next available Vite port).

Detailed frontend guide: `FRONTEND/FrontendLMS/README.md`

## Testing Instructions

### Backend tests

```bash
cd BACKEND/backend/django_lms
# activate your virtual environment first
python manage.py test -v 2
```

### Frontend/API integration checks

```powershell
cd FRONTEND/FrontendLMS
powershell -ExecutionPolicy Bypass -File .\run_tests.ps1 -BaseUrl http://localhost:8000
```

### Frontend production-build check

```bash
cd FRONTEND/FrontendLMS
npm run build
```

## Demo Credentials

If you ran `python manage.py seed_demo_users` during backend setup, test these accounts in the frontend:

| Username | Password | Role |
|----------|----------|------|
| `admin_demo` | `Admin@123` | Admin (manage courses & users) |
| `teacher_demo` | `Teacher@123` | Teacher (manage own courses) |
| `student_demo` | `Student@123` | Student (browse & enroll) |

## Environment Variables

### Backend (required for local)
- `SECRET_KEY`

### Backend (commonly required in production)
- `DJANGO_SETTINGS_MODULE` (e.g. `config.settings.production`)
- `ALLOWED_HOSTS`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `DB_HOST` (optional, defaults to `localhost`)
- `DB_PORT` (optional, defaults to `5432`)
- `CORS_ALLOWED_ORIGINS`
- `CSRF_TRUSTED_ORIGINS`
- `CORS_ALLOW_CREDENTIALS` (optional)
- `SECURE_SSL_REDIRECT` (optional)

### Frontend
No `.env` file is required by current frontend code.

Optional runtime override:
- Set `window.API_BASE` in the page before app initialization to override API base URL.
