import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration
from pathlib import Path
from datetime import timedelta
import os
from dotenv import load_dotenv
import logging
import cloudinary
import cloudinary.uploader
import cloudinary.api
load_dotenv()

from django.core.exceptions import ImproperlyConfigured

BASE_DIR = Path(__file__).resolve().parent.parent
DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
SECRET_KEY = os.getenv('SECRET_KEY', '')
if not SECRET_KEY or len(SECRET_KEY) < 32:
    raise ImproperlyConfigured('Set SECRET_KEY to a random value of at least 32 characters.')
ALLOWED_HOSTS = [h.strip() for h in os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',') if h.strip()]
if os.getenv('SENTRY_DSN'):
    sentry_sdk.init(dsn=os.environ['SENTRY_DSN'], integrations=[DjangoIntegration()],
                    traces_sample_rate=0.1, send_default_pii=False)

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'whitenoise.runserver_nostatic',
    'django.contrib.staticfiles',
    'django.contrib.sites',
    'django_celery_results',
    'rest_framework',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
    'apps.api',
    'apps.users',
    'apps.products',
    'apps.cart',
    'apps.orders',
    'apps.sellers',
    'apps.coupons',
    'drf_spectacular',
    'cloudinary',
    'apps.wishlist',
    'cloudinary_storage',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'allauth.account.middleware.AccountMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'ecommerce.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'apps.cart.context_processors.cart_count',
            ],
        },
    },
]

WSGI_APPLICATION = 'ecommerce.wsgi.application'

if os.getenv('DB_NAME'):
    DATABASES = {'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ['DB_NAME'], 'USER': os.environ['DB_USER'],
        'PASSWORD': os.environ['DB_PASSWORD'], 'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }}
elif DEBUG:
    DATABASES = {'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': BASE_DIR / 'db.sqlite3'}}
else:
    raise ImproperlyConfigured('Production requires DB_NAME, DB_USER and DB_PASSWORD.')

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [v.strip() for v in os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:3000').split(',') if v.strip()]
CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'EXCEPTION_HANDLER': 'apps.api.exceptions.custom_exception_handler',
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 12,
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

RAZORPAY_KEY_ID = os.getenv('RAZORPAY_KEY_ID', '')
RAZORPAY_KEY_SECRET = os.getenv('RAZORPAY_KEY_SECRET', '')

SITE_ID = 1

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
]

ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_USERNAME_REQUIRED = False
ACCOUNT_AUTHENTICATION_METHOD = "email"
ACCOUNT_EMAIL_VERIFICATION = "none"

SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'APP': {
            'client_id': os.environ.get('GOOGLE_CLIENT_ID'),
            'secret': os.environ.get('GOOGLE_CLIENT_SECRET'),
            'key': ''
        },
        'SCOPE': ['profile', 'email'],
        'AUTH_PARAMS': {'access_type': 'online'},
    }
}

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

SOCIALACCOUNT_EMAIL_AUTHENTICATION = True
SOCIALACCOUNT_EMAIL_AUTHENTICATION_AUTO_CONNECT = True
SOCIALACCOUNT_AUTO_SIGNUP = True
SOCIALACCOUNT_LOGIN_ON_GET = True

LOGIN_REDIRECT_URL = '/'
LOGOUT_REDIRECT_URL = "https://ecommerce-django-two.vercel.app"

CELERY_BROKER_URL = 'redis://localhost:6379/0'
CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

ACCOUNT_ADAPTER = "apps.users.adapter.CustomAccountAdapter"

SPECTACULAR_SETTINGS = {
    'TITLE': 'SoleMate API',
    'DESCRIPTION': 'Premium Sneaker Ecommerce API',
    'VERSION': '1.0.0',
}

(BASE_DIR / 'logs').mkdir(exist_ok=True)
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {'format': '{levelname} {asctime} {module} {message}', 'style': '{'},
        'simple': {'format': '{levelname} {message}', 'style': '{'},
    },
    'handlers': {
        'console': {'class': 'logging.StreamHandler', 'formatter': 'verbose'},
        'file': {'class': 'logging.FileHandler', 'filename': os.path.join(BASE_DIR, 'logs/django.log'), 'formatter': 'verbose'},
    },
    'root': {'handlers': ['console', 'file'], 'level': 'INFO'},
    'loggers': {
        'django': {'handlers': ['console', 'file'], 'level': 'INFO', 'propagate': False},
        'apps': {'handlers': ['console', 'file'], 'level': 'DEBUG', 'propagate': False},
    },
}

RATELIMIT_ENABLE = True
RATELIMIT_USE_CACHE = 'default'
CACHES = {'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache'}}

CLOUDINARY_STORAGE = {
    'CLOUD_NAME': os.getenv('CLOUDINARY_CLOUD_NAME'),
    'API_KEY': os.getenv('CLOUDINARY_API_KEY'),
    'API_SECRET': os.getenv('CLOUDINARY_API_SECRET'),
}
DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")

if DEBUG:
    ACCOUNT_DEFAULT_HTTP_PROTOCOL = "http"
    SESSION_COOKIE_SECURE = False
    CSRF_COOKIE_SECURE = False
else:
    ACCOUNT_DEFAULT_HTTP_PROTOCOL = "https"
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    
    SESSION_COOKIE_SAMESITE = 'None'
    CSRF_COOKIE_SAMESITE = 'None'

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
