from pathlib import Path
import os
from dotenv import load_dotenv
import mongoengine

# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables
load_dotenv(BASE_DIR / ".env")


# SECURITY
SECRET_KEY = os.getenv("SECRET_KEY", "django-insecure-dev-key")

DEBUG = True

ALLOWED_HOSTS = ["127.0.0.1", "localhost"]


# MongoDB configuration
MONGO_DB = os.getenv("MONGO_DB", "ims_db")
MONGO_HOST = os.getenv("MONGO_HOST", "localhost")
MONGO_PORT = int(os.getenv("MONGO_PORT", "27017"))

mongoengine.connect(
    db=MONGO_DB,
    host=MONGO_HOST,
    port=MONGO_PORT,
    alias="default",
)


# Applications
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "accounts",
]


# Middleware
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
]


# URL configuration
ROOT_URLCONF = "ims.urls"


# Templates
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]


# WSGI
WSGI_APPLICATION = "ims.wsgi.application"


# Static files
STATIC_URL = "static/"


# Default auto field
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# Email (SMTP) settings for OTP
EMAIL_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("SMTP_PORT", "587"))
EMAIL_HOST_USER = os.getenv("SMTP_USER")
EMAIL_HOST_PASSWORD = os.getenv("SMTP_PASS")
EMAIL_USE_TLS = True
DEFAULT_FROM_EMAIL = os.getenv("FROM_EMAIL", EMAIL_HOST_USER)