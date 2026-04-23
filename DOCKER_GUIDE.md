# Docker Local Testing Guide

Follow these steps to build and run the entire InterneersLab stack locally using Docker.

## Prerequisites
- **Docker Desktop**: Ensure Docker Desktop is installed and running on your system.
- **Port 80 Availability**: Make sure no other service (like IIS, Skype, or a local Nginx) is using port 80.

---

## 🚀 Step 1: Build and Start
Open your terminal in the project root directory and run:

```bash
docker-compose up --build
```

**What this does:**
1. **Frontend**: Installs dependencies, builds the Vite production bundle, and starts Nginx.
2. **Backend**: Installs Python requirements, runs database migrations, and starts Gunicorn.
3. **MongoDB**: Pulls the Mongo image and sets up persistent storage.

---

## 🔍 Step 2: Verify Connectivity
Once the containers are running, you can access the application at:

- **Frontend**: [http://localhost](http://localhost) (No port needed, as it's on port 80)
- **Backend API**: [http://localhost/api/](http://localhost/api/) (Proxied through Nginx)
- **Direct Backend**: [http://localhost:8000](http://localhost:8000) (Optional, direct access to Gunicorn)

---

## 🛠️ Step 3: Common Commands

### Stop the application
```bash
docker-compose down
```

### Stop and Remove Data (Clean State)
```bash
docker-compose down -v
```

### View Logs
```bash
docker-compose logs -f
```

### Run Commands inside the Backend
```bash
docker-compose exec backend python manage.py createsuperuser
```

---

## 💡 Troubleshooting
- **Port Conflict**: If you get an error that port 80 is already in use, you can change the mapping in `docker-compose.yml`:
  ```yaml
  frontend:
    ports:
      - "8080:80" # Maps local 8080 to container 80
  ```
- **DB Connection**: The backend is configured to use the `mongodb` service name. This only works inside the Docker network. If you try to run `manage.py` locally on your host while Mongo is in Docker, you'll need to update your local `.env` to `MONGO_HOST=localhost`.
