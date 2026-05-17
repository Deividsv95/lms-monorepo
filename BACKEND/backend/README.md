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

## Complete Stack

### Architecture

- Monorepo with separate backend and frontend folders
- Role-based LMS domain model (student, teacher, admin)

### Backend

- Python 3.10+
- Django 4.2
- Django REST Framework 3.14
- Simple JWT (djangorestframework-simplejwt) for authentication
- django-cors-headers for cross-origin support
- python-decouple for environment variable management

### Real-Time

- Django Channels 4.0 for WebSocket support
- Daphne 4.0 as ASGI server
- channels-redis 4.1 available for Redis channel layer deployments

### Database

- SQLite (development database in this repository)

### Frontend

- HTML5
- CSS3
- Vanilla JavaScript (ES6+)
- Google Fonts (Space Grotesk, DM Sans)

### Tooling and Scripts

- npm scripts for frontend checks
- Node.js used for JavaScript syntax validation
- PowerShell scripts for endpoint and integration testing
- Python built-in http.server for local static file serving

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
- **Real-time course updates via WebSocket** — when admins or teachers create/update/delete courses, all connected users are notified instantly
- **Admin full course control** — admins can create, update, and delete any course (not restricted to courses they created)
- **Cross-role course visibility** — students can see and enroll in courses created by both teachers and admins
- **ASGI/Daphne server** — supports both HTTP and WebSocket connections for real-time synchronization

## Course Visibility & Permissions

| Action | Student | Teacher | Admin |
|--------|---------|---------|-------|
| View all courses | ✓ | ✓ | ✓ |
| View courses by teacher | ✓ | ✓ | ✓ |
| View courses by admin | ✓ | ✓ | ✓ |
| Create courses | ✗ | ✓ (own) | ✓ (any) |
| Update courses | ✗ | ✓ (own) | ✓ (any) |
| Delete courses | ✗ | ✓ (own) | ✓ (any) |
| Enroll in courses | ✓ | ✗ | ✗ |
| Manage users | ✗ | ✗ | ✓ |

## Running Tests

```bash
cd BACKEND/backend/django_lms
venv\Scripts\activate
python manage.py test -v 2
```

## Admin Course Management

Admins have **full control** over all courses, unlike teachers who can only manage courses they created.

### REST API Endpoints
- `POST /api/courses/admin/courses/` — Create a new course (sets creator to admin)
- `GET /api/courses/admin/courses/` — List all courses
- `PUT /api/courses/admin/courses/<id>/` — Update any course
- `PATCH /api/courses/admin/courses/<id>/` — Partially update any course
- `DELETE /api/courses/admin/courses/<id>/` — Delete any course

### Teacher Course Management

Teachers can create and manage their own courses:

- `POST /api/courses/teacher/courses/` — Create a new course (sets creator to teacher)
- `GET /api/courses/teacher/courses/` — List all courses
- `PUT /api/courses/teacher/courses/<id>/` — Update own course
- `PATCH /api/courses/teacher/courses/<id>/` — Partially update own course
- `DELETE /api/courses/teacher/courses/<id>/` — Delete own course

### Student Course Access

Students can view and enroll in all courses:

- `GET /api/courses/student/courses/` — List all available courses
- `POST /api/courses/student/enroll/<id>/` — Enroll in a course
- `GET /api/courses/student/enrolled-courses/` — List enrolled courses

## Real-Time Updates (WebSocket)

When an admin or teacher creates, updates, or deletes a course, all connected users receive real-time notifications via WebSocket.

**WebSocket URL**: `ws://localhost:8000/ws/courses/?token=<JWT_TOKEN>`

### Message Format

All WebSocket messages follow this format:
```json
{
  "type": "course_update",
  "event": "course_created|course_updated|course_deleted",
  "course": {
    "id": 1,
    "title": "Course Title",
    "description": "Course Description",
    "created_by": 1,
    "created_at": "2024-05-10T10:00:00Z",
    "updated_at": "2024-05-10T10:00:00Z"
  }
}
```

### How Synchronization Works

1. **Action** — Admin creates/updates/deletes a course via REST API
2. **Signal** — Django post_save/post_delete signal is triggered
3. **Broadcast** — Signal handler broadcasts message to "courses_updates" channel group
4. **Notification** — All connected WebSocket clients receive the update
5. **UI Update** — Frontend processes the event and re-renders the course list

### Example JavaScript Client

```javascript
const token = localStorage.getItem('accessToken');
const ws = new WebSocket(`ws://localhost:8000/ws/courses/?token=${token}`);

ws.onopen = () => {
  console.log('Connected to course updates');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'course_update') {
    console.log(`Course ${data.event}:`, data.course);
    
    // Update your UI based on event type
    switch(data.event) {
      case 'course_created':
        // Add course to list
        break;
      case 'course_updated':
        // Update course in list
        break;
      case 'course_deleted':
        // Remove course from list
        break;
    }
  }
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('Disconnected from course updates');
};
```

For detailed documentation on admin course management and real-time synchronization, see [courses/ADMIN_COURSES_README.md](django_lms/courses/ADMIN_COURSES_README.md).
