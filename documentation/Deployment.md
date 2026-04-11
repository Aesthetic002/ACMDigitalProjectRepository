---
tags: [deployment, docker, environment, env-vars, production]
related: ["[[Project_Overview]]", "[[Architecture]]", "[[Developer_Guide]]", "[[Microservices]]"]
created: 2026-04-11
---

# Deployment

## Overview

The application can be deployed in two modes:
1. **Docker Compose** (all services as containers) — suitable for a single VPS
2. **Hosted services without Docker** — Vercel (frontend) + Render/Railway (backend) — fastest path to production

---

## Environment Variables

### Backend (`backend/.env`)

```env
# Runtime
NODE_ENV=production

# Service Ports (optional — defaults shown)
GATEWAY_PORT=3000
AUTH_SERVICE_PORT=50051
USER_SERVICE_PORT=50052
PROJECT_SERVICE_PORT=50053
ASSET_SERVICE_PORT=50054
NOTIFICATION_SERVICE_PORT=50055

# Service Addresses (used by Gateway to locate gRPC services)
AUTH_SERVICE_ADDR=127.0.0.1:50051
USER_SERVICE_ADDR=127.0.0.1:50052
PROJECT_SERVICE_ADDR=127.0.0.1:50053
ASSET_SERVICE_ADDR=127.0.0.1:50054
NOTIFICATION_SERVICE_ADDR=127.0.0.1:50055

# Firebase Admin SDK
# Option A: JSON file (place as backend/serviceAccountKey.json)
# Option B: inline JSON string:
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"..."}

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:3000             # Dev
# VITE_API_URL=https://api.yourdomain.com      # Production

VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc123
```

---

## Option A: Docker Compose

A `docker-compose.yml` at the repo root orchestrates all 7 containers:

```yaml
services:
  auth-service:        ports ["50051:50051"]
  user-service:        ports ["50052:50052"]
  project-service:     ports ["50053:50053"]
  asset-service:       ports ["50054:50054"]
  notification-service: ports ["50055:50055"]
  gateway:             ports ["3000:3000"]
  frontend:            ports ["5173:5173"]

networks:
  acm-network:
    driver: bridge
```

### Deploy Steps

```bash
# 1. Clone the repo
git clone <repo-url>
cd ACMDigitalProjectRepository

# 2. Copy and fill in env files
cp backend/.env.example backend/.env
# Edit backend/.env with your credentials

# 3. Place Firebase service account key
# Download from Firebase Console → Project Settings → Service Accounts
cp /path/to/serviceAccountKey.json backend/serviceAccountKey.json

# 4. Build and start all containers
docker compose up --build -d

# 5. Check status
docker compose ps
docker compose logs gateway
```

### Docker Network

In Docker, service addresses use container names as hostnames:
```env
AUTH_SERVICE_ADDR=auth-service:50051
USER_SERVICE_ADDR=user-service:50052
```
The `docker-compose.yml` injects these as environment variables into the `gateway` container.

---

## Option B: Vercel + Render (Recommended for simplicity)

### Frontend → Vercel

```bash
cd frontend
npm run build      # produces dist/
```

1. Push repo to GitHub
2. Import project in Vercel → select `frontend/` as root
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add all `VITE_*` environment variables in Vercel project settings
6. Deploy → auto-assigns a `*.vercel.app` domain

### Backend → Render

1. Create a new **Web Service** in Render
2. Connect GitHub repo
3. Set root directory: `backend/`
4. Build command: `npm install`
5. Start command: `node start-microservices.js`
6. Add all backend environment variables in Render's environment settings
7. Upload `serviceAccountKey.json` as a secret file or provide inline via `FIREBASE_SERVICE_ACCOUNT` env var
8. Deploy → auto-assigns a `*.onrender.com` URL

> Update `VITE_API_URL` in Vercel to point to your Render backend URL.

---

## Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** → Email/Password, Google, GitHub providers
3. Enable **Firestore Database** → Start in production mode
4. Generate **Service Account Key**: Project Settings → Service Accounts → Generate new private key
5. Add **Authorized domains** for OAuth: Authentication → Settings → Authorized domains

---

## Cloudinary Setup

1. Create account at [cloudinary.com](https://cloudinary.com)
2. Go to Dashboard → API Keys
3. Copy `Cloud name`, `API Key`, `API Secret` into backend env vars

---

## Firestore Security Rules

> ⚠️ The current implementation uses the Firebase Admin SDK for all Firestore access (server-side only). Firestore Security Rules are only relevant if you also access Firestore directly from the client SDK. Currently, client-side Firestore access is not used — all reads/writes go through the backend APIs. Set rules to **deny all client access** for security:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## Removing Dev Fallback Before Production

Remove or disable the JWT test-secret fallback in `auth-service/index.js`:

```js
// REMOVE THIS BLOCK before production:
if (process.env.NODE_ENV !== "production") {
  const jwt = require("jsonwebtoken");
  decodedToken = jwt.verify(token, "test-secret-key");
}
```

Ensure `NODE_ENV=production` is set in all service containers.

---

## Related

- [[Project_Overview]]
- [[Architecture]]
- [[Developer_Guide]]
- [[Microservices]]
