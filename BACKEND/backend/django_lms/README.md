# LMS Django Backend

Backend API for the LMS project, built with Django and Django REST Framework.

## Requirements

- Python 3.10+
- pip

## Setup (Sequential)

1. Go to the backend project directory:

```bash
cd BACKEND/backend/django_lms
```

2. Create a virtual environment:

```bash
python -m venv venv
```

3. Activate the virtual environment:

Windows (PowerShell):

```bash
venv\Scripts\Activate.ps1
```

macOS/Linux:

```bash
source venv/bin/activate
```

4. Install dependencies from the requirements file:

```bash
pip install -r requirements.txt
```

The requirements file is located at:

```text
BACKEND/backend/django_lms/requirements.txt
```

5. Create an environment file:

```bash
echo SECRET_KEY=replace-this-with-a-real-key > .env
```

6. Set up the database:

```bash
python manage.py migrate
```

Optional demo data:

```bash
python manage.py seed_demo_users
```

7. Run the backend server:

```bash
python manage.py runserver
```

The API will be available at http://127.0.0.1:8000.

## Demo Users

If you ran `python manage.py seed_demo_users`, the following test accounts are available:

| Username | Password | Role |
|----------|----------|------|
| `admin_demo` | `Admin@123` | Admin |
| `teacher_demo` | `Teacher@123` | Teacher |
| `student_demo` | `Student@123` | Student |

Use these credentials to test role-based features in the frontend.
