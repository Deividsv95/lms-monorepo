# FrontendLMS

A role-based Learning Management System frontend where students enroll in courses, teachers manage their courses, and admins control everything.

## Requirements

- Python 3.6+ or Node.js 14+ (to serve the frontend)
- Django LMS backend running at `http://127.0.0.1:8000`
- Any modern browser

## Quick Start

1. Start the backend on port 8000.

2. Serve the frontend:
   ```bash
   python -m http.server 5500 --directory frontend
   ```

3. Open `http://127.0.0.1:5500` and log in with a demo account:

   | Role | Username | Password |
   |------|----------|----------|
   | Student | student_demo | Student@123 |
   | Teacher | teacher_demo | Teacher@123 |
   | Admin | admin_demo | Admin@123 |

## Key Features

- **Students** can browse available courses and enroll
- **Teachers** can create and delete their own courses
- **Admins** can manage all courses and user accounts
- JWT authentication — no page reloads, all dynamic
- Zero dependencies — plain HTML, CSS, and JavaScript

## Basic Usage

Log in as `teacher_demo`, click **Create Course**, fill in the title and description, and submit. The course immediately appears in the Available Courses list for all users. Students can then log in and enroll in it.