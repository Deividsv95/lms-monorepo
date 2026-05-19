
# LMS Monorepo

A fullstack, role-based **Learning Management System** built as a monorepo. Students browse and enroll in courses, teachers manage their own content, and admins oversee the entire platform — all in real time via WebSocket updates.

---

## Project Overview

This repository contains both the backend (Django REST API + WebSocket server) and frontend (React + Vite SPA) for a complete LMS platform.

**Roles:**
- Students: Browse and enroll in courses
- Teachers: Create and manage their own courses
- Admins: Manage users and all courses

---

## Repository Structure

```
lms-monorepo/
├── BACKEND/backend/django_lms/   # Django REST API + WebSocket server
└── FRONTEND/FrontendLMS/         # React + Vite single-page application
```

For backend- or frontend-specific setup, see:
- [BACKEND/backend/django_lms/README.md](BACKEND/backend/django_lms/README.md)
- [FRONTEND/FrontendLMS/README.md](FRONTEND/FrontendLMS/README.md)

---

## Tech Stack

**Backend:** Python 3.10+, Django 4.2, Django REST Framework, JWT (SimpleJWT), Django Channels 4 + Daphne, SQLite/PostgreSQL, python-decouple

**Frontend:** React 18, Vite 5, plain CSS, fetch (REST/WebSocket)

---

## How It Works

**Frontend ↔ Backend:**
- REST API for authentication, course/user CRUD
- WebSocket for real-time course updates

**Authentication:**
1. Login via `/api/auth/login/` (returns JWT tokens)
2. All API requests use `Authorization: Bearer <access>`
3. WebSocket connects with `?token=<access_token>`

---

## Deployment

| Service   | URL                                               |
|-----------|---------------------------------------------------|
| Frontend  | https://deividsv95.github.io/                     |
| Backend   | https://lms-monorepo-zrob.onrender.com/api/v1/    |

---

## Quickstart

### Backend

```bash
cd BACKEND/backend/django_lms
python -m venv venv
# Windows: venv\Scripts\Activate.ps1
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
```

Create `.env` with at least:
```
SECRET_KEY=replace-this-with-a-real-key
```

```bash
python manage.py migrate
python manage.py seed_demo_users   # optional demo accounts
python manage.py runserver
```

API: http://127.0.0.1:8000

### Frontend

```bash
cd FRONTEND/FrontendLMS
npm install
npm run dev
```

App: http://localhost:5173

---

## Demo Accounts

| Username        | Password     | Role    |
|-----------------|-------------|---------|
| admin_demo      | Admin@123   | Admin   |
| teacher_demo    | Teacher@123 | Teacher |
| student_demo    | Student@123 | Student |

---

## Testing

**Backend:**
```bash
cd BACKEND/backend/django_lms
# activate venv first
python manage.py test -v 2
```

**Frontend/API:**
```powershell
cd FRONTEND/FrontendLMS
powershell -ExecutionPolicy Bypass -File .\run_tests.ps1 -BaseUrl http://localhost:8000
```

**Frontend build:**
```bash
cd FRONTEND/FrontendLMS
npm run build
```

---

## Environment Variables

**Backend:**
See `BACKEND/backend/django_lms/README.md` for all required variables.

**Frontend:**
No `.env` required. To override the API base URL at runtime, set `window.API_BASE` in the HTML before the app script tag.
