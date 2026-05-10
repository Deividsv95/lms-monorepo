# Learning Management System (LMS)

## What It Does

A monorepo containing a Django REST API backend and a plain HTML/CSS/JavaScript frontend for a role-based learning management system. Students enroll in courses, teachers manage their own courses, and admins control everything. Authentication uses JWT tokens.

## Repository Structure

```
lms-monorepo/
├── BACKEND/
│   └── backend/
│       └── django_lms/       # Django REST API (port 8000)
│           ├── config/        # Settings and URL routing
│           ├── users/         # Custom user model, auth endpoints
│           ├── courses/       # Course and enrollment models + API
│           ├── requirements.txt
│           └── manage.py
└── FRONTEND/
    └── FrontendLMS/
        └── frontend/          # Static HTML/CSS/JS app (port 8080)
            ├── index.html
            ├── app.js
            └── styles.css
```

## Requirements

- Python 3.10+
- Any modern web browser (for the frontend)

## Quick Start

```bash
# Backend
cd BACKEND/backend/django_lms
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
echo SECRET_KEY=replace-this-with-a-real-key > .env
python manage.py migrate
python manage.py seed_demo_users
python manage.py runserver
```

API available at **http://127.0.0.1:8000**

```bash
# Frontend (in a separate terminal)
python -m http.server 8080 --directory FRONTEND/FrontendLMS/frontend
```

Open **http://127.0.0.1:8080** in a browser.

## Demo Accounts

| Role | Username | Password |
|------|----------|----------|
| Student | `student_demo` | `Student@123` |
| Teacher | `teacher_demo` | `Teacher@123` |
| Admin | `admin_demo` | `Admin@123` |

## Key Features

- JWT auth returns `access` and `refresh` tokens
- Student, teacher, and admin permissions enforced server-side
- `seed_demo_users` management command creates all three demo accounts
- 24 automated tests cover auth, role enforcement, enrollment, and cross-role data sync
- Frontend is zero-dependency plain HTML/JS — no build step required
- **Real-time course updates via WebSocket** — when admins create/delete/update courses, all connected users are notified instantly
- **Admin course management** — admins can create, update, and delete any course (not restricted to courses they created)

## Running Tests

```bash
cd BACKEND/backend/django_lms
venv\Scripts\activate
python manage.py test -v 2
```

## Admin Course Management

Admins have the ability to create, update, and delete courses. Unlike teachers who can only manage courses they created, admins have full control over all courses.

### REST API Endpoints
- `POST /api/courses/admin/courses/` — Create a new course
- `GET /api/courses/admin/courses/` — List all courses
- `PUT /api/courses/admin/courses/<id>/` — Update a course
- `PATCH /api/courses/admin/courses/<id>/` — Partially update a course
- `DELETE /api/courses/admin/courses/<id>/` — Delete a course

For detailed documentation on admin course management and real-time synchronization, see [courses/ADMIN_COURSES_README.md](django_lms/courses/ADMIN_COURSES_README.md).

## Real-Time Updates (WebSocket)

When an admin creates, updates, or deletes a course, all connected users receive real-time notifications via WebSocket.

**WebSocket URL**: `ws://localhost:8000/ws/courses/?token=<JWT_TOKEN>`

Example JavaScript client:
```javascript
const token = localStorage.getItem('access_token');
const ws = new WebSocket(`ws://localhost:8000/ws/courses/?token=${token}`);

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle course_created, course_updated, or course_deleted events
  console.log(data.event, data.course);
};
```

For more details, see [courses/ADMIN_COURSES_README.md](django_lms/courses/ADMIN_COURSES_README.md).
