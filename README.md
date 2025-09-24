# 🚀 ETL Frontend

This project is an **Angular frontend application** that can be run in two modes:

- **Development mode** → Live reload with Angular CLI (`ng serve`)
- **Production mode** → Built Angular app served with **nginx**

---

## 📦 Requirements

- [Docker](https://docs.docker.com/get-docker/) (20+ recommended)
- [Docker Compose](https://docs.docker.com/compose/)
- [Make](https://www.gnu.org/software/make/) (optional, for using the provided shortcuts)

---

## 🛠 Project Structure

```
etl_frontend/
├── src/...
├── package.json
├── angular.json
├── nginx.conf
├── Dockerfile # Production build
├── Dockerfile.dev # Development build
├── docker-compose.yml # Production compose
├── docker-compose.dev.yml # Development compose
└── Makefile # Command shortcuts
```

---

## ⚡️ Quick Commands (Makefile)

### Development

- **Start development server:**
    `make dev`
- **Build & start development server:**
    `make dev-build`
- **Stop development server:**
    `make dev-down`

### Production

- **Start production server:**
    `make prod`
- **Build & start production server:**
    `make prod-build`
- **Stop production server:**
    `make prod-down`

---

## 🔧 Development Mode (Hot Reload)

This mode runs Angular with live reload (`ng serve`) inside a Docker container. Any local code changes will automatically trigger a rebuild inside the container.

- **To run (using Makefile):**
    `make dev-build`
- **To run (manual command):**
    `docker compose -f docker-compose.dev.yml up --build`

The app will be available at: **http://localhost:4200**

✅ **Dev Notes:**
Make sure `package.json` includes the following script to allow connections from outside the container:

```json
"scripts": {
    "start": "ng serve --host 0.0.0.0 --poll 2000"
}
```

---

## 🚀 Production Mode (nginx)

This mode builds a static Angular production bundle and serves it using an efficient `nginx` web server.

- **To run (using Makefile):**
    `make prod-build`
- **To run (manual command):**
    `docker compose up --build`

The app will be available at: **http://localhost**

✅ **Nginx Notes:**
The `nginx.conf` file is configured to handle single-page application (SPA) routing by redirecting all non-file requests back to `index.html`.

```nginx
server {
    listen 80;

    root /usr/share/nginx/html;
    index index.html;

    location / {
    try_files $uri $uri/ /index.html;
    }
}
```

---

## 🧹 Cleanup

To stop and remove the containers for a specific environment, use the down commands.

- **Stop the development environment:**
    `make dev-down`
- **Stop the production environment:**
    `make prod-down`
