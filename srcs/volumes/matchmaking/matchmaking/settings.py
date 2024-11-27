"""
Django settings for matchmaking project.

Generated by 'django-admin startproject' using Django 5.1.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.1/ref/settings/
"""

from pathlib import Path
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('DJANGO_MATCHMAKING_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DJANGO_DEBUG')

ALLOWED_HOSTS = ['users', 'localhost', 'auth', 'matchmaking', os.getenv('HOSTNAME')]

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt.token_blacklist',
    'matchmaking_app.apps.MatchmakingAppConfig',
    'ms_client.apps.MsClientConfig',
    'corsheaders',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'matchmaking_app.middleware.SetRequestHostMiddleware',
]

CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'content-type',
    'x-csrftoken',
    'authorization',
    'Authorization',
    'accept',
    'origin',
    'user-agent',
    'x-requested-with',
]

ROOT_URLCONF = 'matchmaking.urls'

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
            ],
        },
    },
]

WSGI_APPLICATION = 'matchmaking.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('MATCHMAKING_DB_NAME'),
        'USER': os.getenv('MATCHMAKING_DB_USER'),
        'PASSWORD': os.getenv('MATCHMAKING_DB_PASSWORD'),
        'HOST': os.getenv('MATCHMAKING_DB_HOST'),
        'PORT': os.getenv('MATCHMAKING_DB_PORT'),
        'OPTIONS' : {
            'sslmode' : 'require',
            'sslcert' : '/certs/matchmaking_client.crt',
            'sslkey' : '/certs/matchmaking_client.key',
            'sslrootcert' : '/certs/ca.crt',
            }
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

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
            'matchmaking_app.authentification.CustomAuthentication',
            ),
        'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.LimitOffsetPagination',
        'PAGE_SIZE': 10,
        }

def get_jwt_keys(key): 
    with open(key, 'r') as keyfile :
        return keyfile.read()

SIMPLE_JWT = {
            "ALGORITHM": "RS512",
            "VERIFYING_KEY": get_jwt_keys('/certs/jwt_public.pem'),
            "AUTH_HEADER_TYPES": ("Bearer",),
        }

MS_CLIENT_SETTINGS = {
        'AUTH_URL':'http://auth:8443/api/auth/internal/auth/',
        'SERVICE_NAME':'matchmaking',
        'SERVICE_SECRET':os.getenv('MATCHMAKING_PASSWORD'),
        }

# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

STATIC_ROOT = BASE_DIR / 'staticRoot'
STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
