#!/bin/sh

# Exit immediately if a command exits with a non-zero status.
set -e

echo "Running migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting Gunicorn with Uvicorn..."
exec gunicorn django_app.asgi:application -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
