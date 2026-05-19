# LMS Monorepo

A fullstack, role-based **Learning Management System** built as a monorepo. Students browse and enroll in courses, teachers manage their own content, and admins oversee the entire platform — all in real time via WebSocket updates.

## Project Purpose

This project provides a complete role-based LMS workflow in one repository:

- Students can browse and enroll in courses.
- Teachers can create and manage their own courses.
- Admins can manage users and all courses globally.

---

## Repository Structure

```
lms-monorepo/
├── BACKEND/backend/django_lms/   # Django REST API + WebSocket server
└── FRONTEND/FrontendLMS/         # React + Vite single-page application
```

Detailed documentation for each layer lives in its own README:

- **Backend** → [BACKEND/backend/django_lms/README.md](BACKEND/backend/django_lms/README.md)
- **Frontend** → [FRONTEND/FrontendLMS/README.md](FRONTEND/FrontendLMS/README.md)

---

## Tech Stack Overview

### Backend

| Layer | Technology |
|---|---|
| Language | Python 3.10+ |
| Web framework | Django 4.2 |
| REST API | Django REST Framework |
| Authentication | JWT — `djangorestframework-simplejwt` |
| Real-time | Django Channels 4 + Daphne (ASGI/WebSocket) |
| Database (local) | SQLite |
| Database (production) | PostgreSQL |
| Settings management | `python-decouple` |

### Frontend

| Layer | Technology |
|---|---|
| Language | JavaScript (ES modules + JSX) |
| UI library | React 18 |
| Build tool | Vite 5 |
| Styling | Plain CSS |
| API communication | `fetch` (REST + WebSocket) |

---

## How Frontend and Backend Connect

```
Browser
  │
  ├─ HTTP (REST)  ──►  Django REST Framework
  │                      • /api/auth/      login, token refresh
  │                      • /api/student/   browse courses, enroll
  │                      • /api/teacher/   create / edit own courses
  │                      • /api/admin/     manage all courses & users
  │
  └─ WebSocket    ──►  Django Channels (Daphne)
                         • ws://<host>/ws/courses/?token=<access_token>
                         • server pushes course create / update / delete events
                         • frontend updates the UI without a page reload
```

Authentication flow:

1. Frontend `POST /api/auth/login/` → receives `access` + `refresh` JWT tokens.
2. Every subsequent REST request includes `Authorization: Bearer <access>`.
3. The same `access` token is passed as a query-string parameter when opening the WebSocket.

---

## Deployment Links

| Service | URL |
|---|---|
| Frontend | https://deividsv95.github.io/ |
| Backend API | https://lms-monorepo-zrob.onrender.com/api/v1/ |

---

## Setup Instructions for Both Apps

### 1 — Backend

```bash
cd BACKEND/backend/django_lms

# Create and activate a virtual environment
python -m venv venv
# Windows (PowerShell)
venv\Scripts\Activate.ps1
# macOS / Linux
# source venv/bin/activate

pip install -r requirements.txt
```

Create `BACKEND/backend/django_lms/.env`:

```env
SECRET_KEY=replace-this-with-a-real-key
```

```bash
python manage.py migrate
python manage.py seed_demo_users   # optional demo accounts
python manage.py runserver
```

API available at **http://127.0.0.1:8000**.

### 2 — Frontend

In a separate terminal:

```bash
cd FRONTEND/FrontendLMS
npm install
npm run dev
```

App available at **http://localhost:5173** (or the next free Vite port).

The frontend auto-detects the environment:
- **Local**: connects to `http://127.0.0.1:8000`
- **Production**: connects to `https://lms-monorepo-zrob.onrender.com/api/v1/`

---

## Demo Accounts

Seeded by `python manage.py seed_demo_users`:

| Username | Password | Role |
|---|---|---|
| `admin_demo` | `Admin@123` | Admin — manage all courses & users |
| `teacher_demo` | `Teacher@123` | Teacher — manage own courses |
| `student_demo` | `Student@123` | Student — browse & enroll |

---

## Testing Instructions

### Backend unit tests

```bash
cd BACKEND/backend/django_lms
# activate venv first
python manage.py test -v 2
```

### Frontend / API integration checks

```powershell
cd FRONTEND/FrontendLMS
powershell -ExecutionPolicy Bypass -File .\run_tests.ps1 -BaseUrl http://localhost:8000
```

### Frontend production build check

```bash
cd FRONTEND/FrontendLMS
npm run build
```

---

## Environment Variables

### Backend

| Variable | Required | Notes |
|---|---|---|
| `SECRET_KEY` | ✅ local + prod | Django secret key |
| `DJANGO_SETTINGS_MODULE` | prod | e.g. `config.settings.production` |
| `ALLOWED_HOSTS` | prod | comma-separated hostnames |
| `DB_NAME` / `DB_USER` / `DB_PASSWORD` | prod | PostgreSQL credentials |
| `DB_HOST` | prod | defaults to `localhost` |
| `DB_PORT` | prod | defaults to `5432` |
| `CORS_ALLOWED_ORIGINS` | prod | frontend origin(s) |
| `CSRF_TRUSTED_ORIGINS` | prod | same as CORS origins |
| `CORS_ALLOW_CREDENTIALS` | optional | |
| `SECURE_SSL_REDIRECT` | optional | set `True` in production |

### Frontend

No `.env` file required. To override the API base URL at runtime, set `window.API_BASE` in the HTML before the app script tag.
