"""Seed demo users directly against the configured Django database.

This script is intended for production startup flows (for example Render),
where shell access may be unavailable.
"""

import os

import django


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.production")
django.setup()

from django.contrib.auth import get_user_model


User = get_user_model()


def _ensure_user(username, email, password, role, is_superuser=False):
    existing_user = User.objects.filter(username=username).first()
    if existing_user:
        existing_user.email = email
        existing_user.set_password(password)
        if hasattr(existing_user, "role"):
            existing_user.role = role
        if is_superuser and not existing_user.is_superuser:
            existing_user.is_superuser = True
            existing_user.is_staff = True
        existing_user.save()
        print(f"{username} already exists. Password updated.")
        return

    if is_superuser:
        user = User.objects.create_superuser(
            username=username,
            password=password,
            email=email,
        )
    else:
        user = User.objects.create_user(
            username=username,
            password=password,
            email=email,
        )

    if hasattr(user, "role"):
        user.role = role
        user.save(update_fields=["role"])

    print(f"{username} created.")


def seed():
    role_student = getattr(User, "ROLE_STUDENT", "student")
    role_teacher = getattr(User, "ROLE_TEACHER", "teacher")
    role_admin = getattr(User, "ROLE_ADMIN", "admin")

    _ensure_user(
        username="student_demo",
        email="student@test.com",
        password="Student@123",
        role=role_student,
    )

    _ensure_user(
        username="teacher_demo",
        email="teacher@test.com",
        password="Teacher@123",
        role=role_teacher,
    )

    _ensure_user(
        username="admin_demo",
        email="admin@test.com",
        password="Admin@123",
        role=role_admin,
        is_superuser=True,
    )


if __name__ == "__main__":
    seed()