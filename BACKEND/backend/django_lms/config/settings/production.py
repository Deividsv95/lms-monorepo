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
# List the exact origins of your deployed React frontend, e.g.:
#   CORS_ALLOWED_ORIGINS=https://myapp.com,https://www.myapp.com
CORS_ALLOWED_ORIGINS = csv_config("CORS_ALLOWED_ORIGINS")
CORS_ALLOW_CREDENTIALS = config("CORS_ALLOW_CREDENTIALS", default=True, cast=bool)
CSRF_TRUSTED_ORIGINS = csv_config("CSRF_TRUSTED_ORIGINS", default=",".join(CORS_ALLOWED_ORIGINS))

# ─── Security headers ─────────────────────────────────────────────────────────
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"
SECURE_SSL_REDIRECT = config("SECURE_SSL_REDIRECT", default=True, cast=bool)
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
