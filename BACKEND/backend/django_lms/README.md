# LMS Django Backend

## What it does

A REST API that powers a learning management system — students enroll in courses, teachers manage their own courses, and admins control everything. Auth is handled with JWT tokens.

---

## Requirements

- Python 3.10+
- pip

---

## Quick Start

```bash
python -m venv .venv
.venv\Scripts\activate        # Windows — use: source .venv/bin/activate on macOS/Linux
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
- **Ready-to-use demo accounts** — one command seeds student, teacher, and admin users
- **22 passing tests** — auth, permissions, and enrollment all covered

---

## Basic Usage

**1. Login**

```js
const res = await fetch("http://127.0.0.1:8000/api/auth/login/", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username: "student_demo", password: "Student@123" }),
});
const { access, user } = await res.json();
// user.role tells you which endpoints this user can call
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

| Role | Can do |
|---|---|
| Student | Browse courses, enroll, view own enrollments |
| Teacher | Create, update, delete their own courses |
| Admin | All of the above plus manage any course or user |

---

## Deployment

- Set `DEBUG=False` and `SECRET_KEY` via environment variable
- Add your domain to `ALLOWED_HOSTS`
- Switch to PostgreSQL, run `python manage.py collectstatic`
- Serve with Gunicorn behind Nginx
