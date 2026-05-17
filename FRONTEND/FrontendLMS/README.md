# FrontendLMS

A role-based Learning Management System frontend where students enroll in courses, teachers manage their courses, and admins control everything. Features real-time course updates via WebSocket.

## Requirements

- Python 3.6+ (to serve the static files)
- Django LMS backend running at `http://127.0.0.1:8000` (with WebSocket support via Daphne)
- Any modern browser with WebSocket support

## Frontend Stack

- Markup: HTML5
- Styling: CSS3
- Client logic: Vanilla JavaScript (ES6+)
- Fonts: Google Fonts (Space Grotesk, DM Sans)
- Auth integration: JWT tokens (stored in sessionStorage)
- API communication: REST over HTTP
- Real-time updates: WebSocket client connected to Django Channels backend
- Local serving: Python http.server
- Validation/tooling: npm script with Node.js syntax check (`node --check`)

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

- **Students** can browse all available courses (created by teachers and admins) and enroll in them
- **Teachers** can create and delete their own courses via a management panel
- **Admins** can create, update, and delete any course (full course management)
- JWT authentication — tokens stored in `sessionStorage`, no page reloads
- Zero dependencies — plain HTML, CSS, and JavaScript, no build step
- **Real-time course synchronization** — when admins or teachers create/update/delete courses, all connected users see updates instantly via WebSocket
- **Automatic UI updates** — courses appear and disappear from other users' screens in real-time without page refresh

## Role Workflows

**Student:** Select the Student profile → Start Session → browse Available Courses (all courses from teachers and admins) → click **Enroll** on any course → click **Enrollments** to see enrolled courses. New courses created by admins or teachers will appear in real-time.

**Teacher:** Select the Teacher profile → Start Session → scroll to Course & User Management → fill in Title and Description → click **Create Course**. The course immediately appears in the list for all users. All connected students and admins will see it appear in real-time. Use the Delete Course dropdown to remove a course you own.

**Admin:** Select the Admin profile → Start Session → use Course & User Management to create/update/delete any course or manage user accounts. All course changes are broadcast to all connected users in real-time via WebSocket.

## Real-Time Updates (WebSocket)

The frontend automatically establishes a WebSocket connection when a user logs in. This connection remains open and receives real-time notifications of course changes:

- **Course Created** — New course appears in all users' course lists instantly
- **Course Updated** — Course title/description changes reflect immediately
- **Course Deleted** — Course disappears from all course lists instantly

**No page refresh needed** — the UI automatically updates when another user makes changes.

**How it works:**
1. User logs in → WebSocket connection established with their JWT token
2. Another user creates/updates/deletes a course
3. Backend signal broadcasts to all connected WebSocket clients
4. Frontend receives the update and re-renders the course list
5. All users see the change instantly

## API Base URL

By default the frontend connects to `http://127.0.0.1:8000`. On non-local deployments it falls back to `window.location.origin`, so the backend and frontend must be served from the same origin or CORS must allow the frontend's origin.

## WebSocket Connection

When you log in, the frontend automatically connects to:
```
ws://127.0.0.1:8000/ws/courses/?token=<JWT_ACCESS_TOKEN>
```

The WebSocket connection is:
- Authenticated using your JWT access token
- Automatically disconnected when you logout
- Reconnection is automatic if the connection drops

## Troubleshooting

**Courses not appearing?**
- Verify all users are logged in (each user needs their own active session)
- Check that the backend is running with `python manage.py runserver`
- Open browser DevTools (F12) → Console to see WebSocket connection logs

**Real-time updates not working?**
- Confirm you're using the Django backend with Daphne ASGI (not the old WSGI server)
- Check that WebSocket connections are allowed in your network
- Verify JWT tokens are valid by checking login succeeds