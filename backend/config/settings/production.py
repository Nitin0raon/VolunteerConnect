"""
Production settings.
"""
from decouple import config
from .base import *  # noqa

DEBUG = False

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='').split(',')

DATABASE_URL = config('DATABASE_URL')
DATABASES = {
    'default': parse_database_url(DATABASE_URL),
}
DATABASES['default']['OPTIONS'].setdefault('connect_timeout', 10)
DATABASES['default'].setdefault('CONN_MAX_AGE', 60)




# Security
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS', default='').split(',')
