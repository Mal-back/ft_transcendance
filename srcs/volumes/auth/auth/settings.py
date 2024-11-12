"""
Django settings for auth project.

Generated by 'django-admin startproject' using Django 5.0.7.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.0/ref/settings/
"""

from datetime import timedelta
from pathlib import Path
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('DJANGO_AUTH_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DJANGO_DEBUG')

ALLOWED_HOSTS = ['auth', 'localhost', 'http://localhost:8080', 'frontend', 'users', 'avatar_manager', os.getenv('HOSTNAME')]

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'http')

# settings.py
CSRF_COOKIE_SECURE = False
CSRF_TRUSTED_ORIGINS = [
    'http://localhost:8080',
]





# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'rest_framework',
    'rest_framework_simplejwt.token_blacklist',
    'auth_app.apps.AuthAppConfig',
    'django.contrib.sites',
    # 'django_otp',
    # 'django_otp.plugins.otp_email',
    # 'two_factor',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8080",
]
CORS_ALLOW_HEADERS = [
    'content-type',
    'x-csrftoken',
    'authorization',
    'accept',
    'origin',
    'user-agent',
    'x-requested-with',
]
ROOT_URLCONF = 'auth.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'auth.wsgi.application'
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.sendgrid.net'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = "apikey"
EMAIL_HOST_PASSWORD = os.getenv('SENDGRID_API_KEY')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL')

# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('AUTH_DB_NAME'),
        'USER': os.getenv('AUTH_DB_USER'),
        'PASSWORD': os.getenv('AUTH_DB_PASSWORD'),
        'HOST': os.getenv('AUTH_DB_HOST'),
        'PORT': os.getenv('AUTH_DB_PORT'),
        'OPTIONS' : {
            'sslmode' : 'require',
            'sslcert' : '/certs/auth_client.crt',
            'sslkey' : '/certs/auth_client.key',
            'sslrootcert' : '/certs/ca.crt',
            }
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators

AUTH_USER_MODEL = 'auth_app.CustomUser'

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

REST_FRAMEWORK = {
        'DEFAULT_AUTHENTICATION_CLASSES': (
            'auth_app.authentication.CustomJWTAuth',
            ),
        }

def get_jwt_keys(key): 
    with open(key, 'r') as keyfile :
        return keyfile.read()

SIMPLE_JWT = {
            "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
            "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
            "ROTATE_REFRESH_TOKENS": True,
            "BLACKLIST_AFTER_ROTATION": True,
            "UPDATE_LAST_LOGIN": False,

            "ALGORITHM": "RS512",
            "SIGNING_KEY": get_jwt_keys('/certs/jwt_private.pem'),
            "VERIFYING_KEY": get_jwt_keys('/certs/jwt_public.pem'),
            "AUDIENCE": None,
            "ISSUER": None,
            "JSON_ENCODER": None,
            "JWK_URL": None,
            "LEEWAY": 0,

            "AUTH_HEADER_TYPES": ("Bearer",),
            "AUTH_HEADER_NAME": "HTTP_AUTHORIZATION",
            "USER_ID_FIELD": "id",
            "USER_ID_CLAIM": "user_id",
            "USER_AUTHENTICATION_RULE": "rest_framework_simplejwt.authentication.default_user_authentication_rule",

            "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.AccessToken",),
            "TOKEN_TYPE_CLAIM": "token_type",
            "TOKEN_USER_CLASS": "rest_framework_simplejwt.models.TokenUser",

            "JTI_CLAIM": "jti",

            "TOKEN_OBTAIN_SERIALIZER": "auth_app.serializers.MyTokenObtainPairSerializer",
        }

# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/

STATIC_ROOT = BASE_DIR / 'staticRoot'
STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
