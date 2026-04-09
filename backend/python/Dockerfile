FROM python:3.14-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN pip install --upgrade pip

COPY ./requirements.txt /app/requirements.txt

RUN pip install --no-cache-dir -r requirements.txt gunicorn

COPY . /app/

# Make entrypoint executable
RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
