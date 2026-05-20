
# LMS Django Backend

Backend API for the LMS project.

For the full project overview, see [README.md](../../../README.md).

## Requirements

- Python 3.10+
- pip

## Setup

Run everything from:

```text
BACKEND/backend/django_lms
```

Install and start the project:

```bash
python -m venv venv
# Windows: venv\Scripts\Activate.ps1
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file:

```text
SECRET_KEY=replace-this-with-a-real-key
```

Then run:

```bash
python manage.py migrate
python manage.py seed_demo_users
python manage.py runserver
```

Backend URL:

```text
http://127.0.0.1:8000
```

## Testing

```bash
python manage.py test -v 2
```

## Demo Users

```text
admin_demo    / Admin@123    / admin
teacher_demo  / Teacher@123  / teacher
student_demo  / Student@123  / student
```

## Notes

- Check `.env.example` or the root README for env settings.
- On Render, you can seed demo users in the start command if needed.

```bash
python seed_users.py && daphne -b 0.0.0.0 -p $PORT config.asgi:application
```
