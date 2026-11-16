import os
os.environ['SECRET_KEY'] = 'test-only-key-not-used-outside-tests-0123456789'
os.environ['DEBUG'] = 'True'
for key in ('DB_NAME', 'SENTRY_DSN'):
    os.environ.pop(key, None)
from .settings import *
DATABASES = {'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': ':memory:'}}
PASSWORD_HASHERS = ['django.contrib.auth.hashers.MD5PasswordHasher']
EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'
RATELIMIT_ENABLE = False
SILENCED_SYSTEM_CHECKS = ['django_ratelimit.E003']
