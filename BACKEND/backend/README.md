
# Learning Management System (LMS)

## What It Does

This repo contains a Django REST API for a learning management system where students enroll in courses, teachers manage their own courses, and admins control everything. Authentication is handled with JWT tokens and role-based permissions.

## Requirements

- Python 3.10+
- Node.js 18+ for the optional frontend test suite

## Quick Start

```bash
# Backend
cd django_lms
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
echo SECRET_KEY=replace-this-with-a-real-key > .env
python manage.py migrate
python manage.py seed_demo_users
python manage.py runserver
```

API is available at http://127.0.0.1:8000.

```bash
# Frontend tests
cd frontend
npm install
npm test
```

## Key Features

- JWT auth returns `access` and `refresh` tokens.
- Student, teacher, and admin permissions are enforced on the server.
- `seed_demo_users` creates demo accounts for all three roles.
- List endpoints return paginated responses with `count`, `next`, `previous`, and `results`.
- Backend and API tests cover auth, role checks, enrollment, and course management.

## Basic Usage

```js
const res = await fetch("http://127.0.0.1:8000/api/auth/login/", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username: "student_demo", password: "Student@123" }),
});

const { access, user } = await res.json();
```

Use the token on protected requests:

```text
Authorization: Bearer <access>
```

Demo accounts:

| Role | Username | Password |
|---|---|---|
| Student | student_demo | Student@123 |
| Teacher | teacher_demo | Teacher@123 |
| Admin | admin_demo | Admin@123 |
