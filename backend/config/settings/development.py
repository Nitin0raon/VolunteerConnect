"""
Development settings.
"""
from decouple import config
from .base import *  # noqa

DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0']

DATABASE_URL = config('DATABASE_URL')
DATABASES = {
    'default': parse_database_url(DATABASE_URL),
}
DATABASES['default']['OPTIONS'].setdefault('connect_timeout', 10)

# In development, also log to console
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

CORS_ALLOW_ALL_ORIGINS = True
