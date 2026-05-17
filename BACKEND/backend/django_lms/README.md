# LMS Django Backend

## What it does

A REST API that powers a learning management system — students enroll in courses, teachers manage their own courses, and admins control everything. Auth is handled with JWT tokens.

---

## Requirements

- Python 3.10+
- pip

---

## Backend Stack

- Language: Python
- Framework: Django 4.2
- API Layer: Django REST Framework 3.14
- Auth: JWT via djangorestframework-simplejwt
- CORS: django-cors-headers
- Config: python-decouple (.env)
- Real-time: Django Channels 4.0 over ASGI
- ASGI Server: Daphne 4.0
- Channel Layer: channels-redis 4.1 (for Redis-backed deployments)
- Database in this repository: SQLite

---

## Quick Start

```bash
python -m venv venv
venv\Scripts\activate        # Windows — use: source venv/bin/activate on macOS/Linux
pip install -r requirements.txt
echo SECRET_KEY=replace-this-with-a-real-key > .env
python manage.py migrate
python manage.py seed_demo_users
python manage.py runserver
```

API is live at **http://127.0.0.1:8000**

---

## Key Features

- **JWT authentication** — login returns `access` + `refresh` tokens
- **3 roles** — student (enroll), teacher (manage own courses), admin (manage everything)
- **Role enforcement** — wrong-role requests return 403 automatically
- **Token refresh** — `POST /api/auth/token/refresh/` issues a new access token
- **Ready-to-use demo accounts** — one command seeds student, teacher, and admin users
- **24 passing tests** — auth, permissions, enrollment, and cross-role data sync all covered

---

## API Endpoints

### Auth — `/api/auth/`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register/` | Create a new account |
| POST | `/api/auth/login/` | Login — returns `access` + `refresh` tokens |
| POST | `/api/auth/logout/` | Blacklist the refresh token |
| POST | `/api/auth/token/refresh/` | Get a new access token |

### Student — requires `role=student`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/student/courses/` | List all available courses |
| POST | `/api/student/enroll/<course_id>/` | Enroll in a course |
| GET | `/api/student/enrolled-courses/` | List enrolled courses |

### Teacher — requires `role=teacher`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/teacher/courses/` | List all courses |
| POST | `/api/teacher/courses/` | Create a course |
| PUT/PATCH | `/api/teacher/courses/<course_id>/` | Update own course |
| DELETE | `/api/teacher/courses/<course_id>/` | Delete own course |

### Admin — requires `role=admin`

| Method | Path | Description |
|--------|------|-------------|
| GET/POST | `/api/admin/courses/` | List or create any course |
| PUT/PATCH/DELETE | `/api/admin/courses/<course_id>/` | Update or delete any course |
| GET/POST | `/api/admin/users/` | List or create users |
| GET/PUT/PATCH/DELETE | `/api/admin/users/<user_id>/` | Manage any user |

---

## Basic Usage

**1. Login**

```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "student_demo", "password": "Student@123"}'
```

Response:
```json
{ "access": "<jwt>", "refresh": "<jwt>", "user": { "id": 3, "username": "student_demo", "role": "student" } }
```

**2. Use the token**

```
Authorization: Bearer <access>
```

**3. Demo accounts**

| Role | Username | Password |
|---|---|---|
| Student | `student_demo` | `Student@123` |
| Teacher | `teacher_demo` | `Teacher@123` |
| Admin | `admin_demo` | `Admin@123` |

**4. What each role can do**

| Role | Permissions |
|---|---|
| Student | Browse courses, enroll, view own enrollments |
| Teacher | Create, update, delete their own courses; view all courses |
| Admin | Manage any course or user account |

---

## Running Tests

```bash
python manage.py test -v 2
```

24 tests cover authentication, role-based permissions, enrollment logic, and cross-role data sync.

---

## Deployment

- Set `DEBUG=False` and `SECRET_KEY` via environment variable
- Add your domain to `ALLOWED_HOSTS`
- Switch to PostgreSQL, run `python manage.py collectstatic`
- Serve with Gunicorn behind Nginx
