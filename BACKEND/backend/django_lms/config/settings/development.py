"""
Development settings.

Used locally via: python manage.py runserver
DJANGO_SETTINGS_MODULE defaults to this file in manage.py.
"""

from .base import *  # noqa: F401,F403


DEBUG = True

ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

# ─── Database (SQLite for local development) ──────────────────────────────────
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# ─── CORS ─────────────────────────────────────────────────────────────────────
# Restrict browser access to the local frontend dev server instead of allowing
# every origin during development.
CORS_ALLOWED_ORIGINS = csv_config(
    "CORS_ALLOWED_ORIGINS",
    default=(
        "http://localhost:5173,http://127.0.0.1:5173,"
        "http://localhost:3000,http://127.0.0.1:3000,"
        "http://localhost:5500,http://127.0.0.1:5500,"
        "http://localhost:8080,http://127.0.0.1:8080"
    ),
)
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = csv_config(
    "CSRF_TRUSTED_ORIGINS",
    default=",".join(CORS_ALLOWED_ORIGINS),
)
