# FrontendLMS

A role-based Learning Management System frontend where students enroll in courses, teachers manage their courses, and admins control everything.

## Requirements

- Python 3.6+ (to serve the static files)
- Django LMS backend running at `http://127.0.0.1:8000`
- Any modern browser

## Quick Start

1. Start the backend on port 8000 (see `BACKEND/backend/django_lms/README.md`).

2. Serve the frontend:
   ```bash
   python -m http.server 8080 --directory frontend
   ```

3. Open `http://127.0.0.1:8080` and log in with a demo account:

   | Role | Username | Password |
   |------|----------|----------|
   | Student | `student_demo` | `Student@123` |
   | Teacher | `teacher_demo` | `Teacher@123` |
   | Admin | `admin_demo` | `Admin@123` |

## Key Features

- **Students** can browse all available courses and enroll in them
- **Teachers** can create and delete their own courses via a management panel
- **Admins** can manage all courses and user accounts
- JWT authentication — tokens stored in `sessionStorage`, no page reloads
- Zero dependencies — plain HTML, CSS, and JavaScript, no build step

## Role Workflows

**Student:** Select the Student profile → Start Session → browse Available Courses → click **Enroll** on any course → click **Enrollments** to see enrolled courses.

**Teacher:** Select the Teacher profile → Start Session → scroll to Course & User Management → fill in Title and Description → click **Create Course**. The course immediately appears in the list for all users. Use the Delete Course dropdown to remove a course you own.

**Admin:** Select the Admin profile → Start Session → use Course & User Management to create/delete any course or manage user accounts.

## API Base URL

By default the frontend connects to `http://127.0.0.1:8000`. On non-local deployments it falls back to `window.location.origin`, so the backend and frontend must be served from the same origin or CORS must allow the frontend's origin.