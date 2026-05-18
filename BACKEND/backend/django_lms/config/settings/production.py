"""
Production settings.

Set DJANGO_SETTINGS_MODULE=config.settings.production in your server environment.
All sensitive values must be provided via environment variables (or a .env file
that is NOT committed to version control).
"""

from decouple import config

from .base import *  # noqa: F401,F403


DEBUG = False

ALLOWED_HOSTS = config("ALLOWED_HOSTS", default="").split(",")

# ─── Database (PostgreSQL recommended for production) ─────────────────────────
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": config("DB_NAME"),
        "USER": config("DB_USER"),
        "PASSWORD": config("DB_PASSWORD"),
        "HOST": config("DB_HOST", default="localhost"),
        "PORT": config("DB_PORT", default="5432"),
    }
}

# ─── CORS ─────────────────────────────────────────────────────────────────────
CORS_ALLOWED_ORIGINS = [
    "https://deividsv95.github.io",
]
CSRF_TRUSTED_ORIGINS = [
    "https://deividsv95.github.io",
]
CORS_ALLOW_CREDENTIALS = True

# ─── Security headers ─────────────────────────────────────────────────────────
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"
SECURE_SSL_REDIRECT = False
APPEND_SLASH = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
