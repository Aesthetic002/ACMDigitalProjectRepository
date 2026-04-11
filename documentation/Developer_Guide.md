---
tags: [developer, setup, local, conventions, contributing]
related: ["[[Project_Overview]]", "[[Architecture]]", "[[Frontend]]", "[[Deployment]]", "[[API_Reference]]"]
created: 2026-04-11
---

# Developer Guide

## Overview

This guide covers everything you need to go from a fresh clone to a fully running local dev environment, understand the codebase conventions, and add new features confidently.

---

## Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Node.js | ≥ 18 | Backend services + frontend dev server |
| npm | ≥ 9 | Dependency management |
| Git | Any | Version control |
| Firebase Project | — | Auth + Firestore |
| Cloudinary Account | — | Media uploads |

---

## Initial Setup

### 1. Clone & Install

```bash
git clone <repo-url>
cd ACMDigitalProjectRepository

# Install root-level dependencies (if any)
npm install

# Install backend dependencies
cd backend
npm install

# Install per-service dependencies
cd services/auth-service && npm install && cd ../..
cd services/user-service && npm install && cd ../..
cd services/project-service && npm install && cd ../..
cd services/asset-service && npm install && cd ../..
cd services/notification-service && npm install && cd ../..

# Install gateway dependencies
cd gateway && npm install && cd ..

# Install frontend dependencies
cd ../frontend
npm install
```

Or run the provided batch script:
```bash
install-deps.bat
```

---

### 2. Configure Environment

**Backend:**
```bash
cp backend/.env.example backend/.env
# Fill in: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
```

**Firebase Service Account:**
- Download from Firebase Console → Project Settings → Service Accounts
- Save as `backend/serviceAccountKey.json`

**Frontend:**
```bash
# Create frontend/.env
VITE_API_URL=http://localhost:3000
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

---

### 3. Start the Backend

```bash
cd backend
npm run dev
# Spawns: Auth:50051, User:50052, Project:50053, Asset:50054, Notification:50055, Gateway:3000
```

Wait for the output:
```
✅ All services started successfully!
🚪 API Gateway started
📡 Listening on port 3000
```

### 4. Start the Frontend

```bash
cd frontend
npm run dev
# Vite dev server starts at http://localhost:5173
```

---

## Folder Structure

```
ACMDigitalProjectRepository/
├── backend/
│   ├── .env                        ← Backend secrets (gitignored)
│   ├── serviceAccountKey.json      ← Firebase admin key (gitignored)
│   ├── start-microservices.js      ← Spawns all services + gateway
│   ├── proto/                      ← .proto contract files (shared)
│   │   ├── auth.proto
│   │   ├── user.proto
│   │   ├── project.proto
│   │   ├── asset.proto
│   │   └── notification.proto
│   ├── services/
│   │   ├── firebase.js             ← Shared Firebase Admin SDK init
│   │   ├── auth-service/
│   │   ├── user-service/
│   │   ├── project-service/
│   │   ├── asset-service/
│   │   └── notification-service/
│   └── gateway/
│       ├── index.js                ← Main gateway (REST→gRPC)
│       ├── firebase.js             ← Gateway Firebase Admin SDK init
│       ├── middleware/upload.js    ← Multer config
│       ├── utils/cloudinary.js     ← Cloudinary config
│       └── routes/
│           └── comments.routes.js  ← Comments REST module
├── frontend/
│   ├── .env                        ← Frontend secrets (gitignored)
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx                 ← Route definitions
│       ├── api/axiosInstance.js    ← HTTP client
│       ├── config/firebase.js      ← Firebase client SDK
│       ├── services/api.js         ← All API method groups
│       ├── store/authStore.js      ← Zustand auth state
│       ├── pages/                  ← Full-page route components
│       ├── components/             ← Shared/layout components
│       └── features/               ← Feature-scoped modules
├── docker-compose.yml
├── documentation/                  ← This vault
└── package.json
```

---

## How to Add a New Feature

### Example: Adding a "Bookmarks" Feature

**1. Define the data model**
Decide where it lives in Firestore (e.g., a `bookmarks` subcollection under `users/{uid}`) and what fields it needs.

**2. (Optional) Add a gRPC method**
If the feature is complex, add it to an existing proto or create a new service. For simple Firestore CRUD, you can add it directly in the gateway like comments.

**3. Add a gateway route**
```js
// For complex features:
const bookmarksRoutes = require('./routes/bookmarks.routes');
app.use('/api/v1/bookmarks', bookmarksRoutes(db, verifyToken));

// IMPORTANT: Mount BEFORE the 404 catch-all handler
```

**4. Add to `frontend/src/services/api.js`**
```js
export const bookmarksAPI = {
  getAll: () => axiosInstance.get('/bookmarks'),
  add:    (projectId) => axiosInstance.post('/bookmarks', { projectId }),
  remove: (projectId) => axiosInstance.delete(`/bookmarks/${projectId}`),
};
```

**5. Create the UI component / page**
Use TanStack Query for data fetching:
```jsx
const { data } = useQuery(['bookmarks'], () => bookmarksAPI.getAll());
const addMutation = useMutation(bookmarksAPI.add, {
  onSuccess: () => queryClient.invalidateQueries(['bookmarks'])
});
```

**6. Add a route in `App.jsx`** (if it's a full page)

---

## Coding Conventions

### JavaScript Style
- ES Modules (`import/export`) in frontend; CommonJS (`require/module.exports`) in backend services
- `async/await` throughout; no raw `.then()` chains
- Destructure early: `const { uid } = req.user;`
- Error responses always use the shape: `{ success: false, error: "...", message: "..." }`

### Component Conventions (Frontend)
- One component per file; filename matches export name
- Page-level components in `src/pages/`; reusable UI in `src/components/`; feature-specific in `src/features/<feature>/`
- TanStack Query key format: `['entity', id, filter]` — always an array

### New gRPC Service
1. Define messages and service in `backend/proto/<name>.proto`
2. Create `backend/services/<name>-service/index.js` with `grpc.Server`, load proto, bind to port
3. Add service entry in `backend/start-microservices.js`
4. Create gRPC client stub in `backend/gateway/index.js`
5. Add service to `docker-compose.yml`

---

## Common Gotchas

| Problem | Cause | Fix |
|---|---|---|
| Comments return 404 | Route mounted after 404 handler | Mount comments route **before** catch-all in `gateway/index.js` |
| Dates show "Recently" | gRPC `longs: String` sends timestamps as numeric strings | Use `parseDate()` which handles `/^\d+$/` strings |
| `"The query requires an index"` | Missing Firestore composite index | Follow the link in the error to create it in Firebase Console |
| 401 on all requests | Token not attached | Check Axios request interceptor + Zustand store has `token` |
| Dev fallback in production | `NODE_ENV` not set | Set `NODE_ENV=production` in all service containers |
| Port conflict on restart | Old process still holding port | `netstat -ano | findstr :3000` → `taskkill /F /PID <id>` |

---

## Related

- [[Project_Overview]]
- [[Architecture]]
- [[Frontend]]
- [[Deployment]]
- [[API_Reference]]
