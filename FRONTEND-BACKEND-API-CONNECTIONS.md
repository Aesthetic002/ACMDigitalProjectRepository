# Frontend to Backend API Connections

> **Document Version:** 1.0
> **Last Updated:** March 19, 2026
> **Project:** ACM Digital Project Repository

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Base Configuration](#base-configuration)
3. [Authentication Flow](#authentication-flow)
4. [API Endpoints](#api-endpoints)
   - [Projects API](#projects-api)
   - [Users API](#users-api)
   - [Admin API](#admin-api)
   - [Tags/Domains API](#tagsdomains-api)
   - [Assets API](#assets-api)
   - [Events API](#events-api)
   - [Search API](#search-api)
   - [Auth API](#auth-api)
5. [Firebase Direct Connections](#firebase-direct-connections)
6. [Environment Variables](#environment-variables)
7. [Error Handling](#error-handling)

---

## Architecture Overview

The frontend uses a **hybrid architecture** with two connection strategies:

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                  │
│                                                                 │
│  ┌─────────────────┐     ┌─────────────────────────────────┐   │
│  │   Axios Client  │────▶│  Backend API (Express.js)       │   │
│  │   (Primary)     │     │  http://localhost:3000/api/v1   │   │
│  └─────────────────┘     └─────────────────────────────────┘   │
│           │                            │                        │
│           │ Fallback                   │                        │
│           ▼                            ▼                        │
│  ┌─────────────────┐     ┌─────────────────────────────────┐   │
│  │ Firebase SDK    │────▶│  Firestore Database (Direct)    │   │
│  │ (Secondary)     │     │  (When backend is unavailable)  │   │
│  └─────────────────┘     └─────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Connection Priority

1. **Primary:** Backend REST API via Axios (`http://localhost:3000/api/v1`)
2. **Fallback:** Direct Firestore access via Firebase SDK (when backend fails)

---

## Base Configuration

### Axios Instance

**File:** `frontend/src/services/api.js`

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
    baseURL: `${API_BASE_URL}/api/v1`,
    headers: { 'Content-Type': 'application/json' },
});
```

### Request Interceptor (Authentication)

Every outgoing request automatically includes the Firebase JWT token:

```javascript
api.interceptors.request.use(async (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
```

### Response Interceptor (401 Handling)

Automatic logout on authentication failure:

```javascript
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            useAuthStore.getState().logout(false);
        }
        return Promise.reject(error);
    }
);
```

### Vite Proxy Configuration

**File:** `frontend/vite.config.js`

```javascript
server: {
    port: 5173,
    proxy: {
        '/api': {
            target: 'http://localhost:3000',
            changeOrigin: true,
        },
    },
}
```

---

## Authentication Flow

### Firebase Authentication (Client-Side)

**File:** `frontend/src/store/authStore.js`

| Method | Provider | Description |
|--------|----------|-------------|
| `login(email, password)` | Email/Password | Standard email login via Firebase Auth |
| `register(email, password, name)` | Email/Password | Create new account + Firestore user doc |
| `loginWithGoogle()` | Google OAuth | Sign in with Google popup |
| `loginWithGithub()` | GitHub OAuth | Sign in with GitHub popup |
| `loginAsDemo(role)` | Demo Mode | Local demo user (no Firebase) |
| `logout()` | - | Sign out and clear state |

### Token Flow

```
1. User logs in via Firebase Auth
2. Firebase returns ID Token (JWT)
3. Token stored in Zustand store (persisted to localStorage)
4. Token attached to all API requests via Authorization header
5. Backend validates token with Firebase Admin SDK
```

---

## API Endpoints

### Projects API

**File:** `frontend/src/services/api.js` → `projectsAPI`

| Method | Endpoint | Description | Firestore Fallback |
|--------|----------|-------------|-------------------|
| `GET` | `/projects` | Get all projects (with optional filters) | ✅ `fsProjects.getAll()` |
| `GET` | `/projects/:id` | Get single project by ID | ✅ `fsProjects.getById()` |
| `POST` | `/projects` | Create new project | ✅ `fsProjects.create()` |
| `PUT` | `/projects/:id` | Update existing project | ✅ `fsProjects.update()` |
| `DELETE` | `/projects/:id` | Delete project | ✅ `fsProjects.delete()` |

#### Request/Response Examples

**GET /projects**
```javascript
// Request
projectsAPI.getAll({ status: 'approved' })

// Response
{
  "projects": [
    {
      "id": "abc123",
      "title": "Smart Library System",
      "description": "...",
      "techStack": ["React", "Node.js"],
      "status": "approved",
      "ownerId": "user123",
      "createdAt": "2026-03-19T..."
    }
  ]
}
```

**POST /projects**
```javascript
// Request Body
{
  "title": "My Project",
  "description": "Project description",
  "techStack": ["React", "Firebase"],
  "githubUrl": "https://github.com/...",
  "demoUrl": "https://..."
}

// Response
{
  "project": {
    "id": "newProjectId",
    "title": "My Project",
    "status": "pending",
    ...
  }
}
```

---

### Users API

**File:** `frontend/src/services/api.js` → `usersAPI`

| Method | Endpoint | Description | Firestore Fallback |
|--------|----------|-------------|-------------------|
| `GET` | `/users/:uid` | Get user by UID | ✅ `fsUsers.getById()` |
| `DELETE` | `/users/:uid` | Delete user account | ✅ `fsUsers.delete()` |

**Note:** User updates go directly to Firestore via `fsUsers.update()`.

#### Request/Response Examples

**GET /users/:uid**
```javascript
// Response
{
  "user": {
    "uid": "user123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "member",
    "year": "3rd Year",
    "graduationYear": "2027",
    "createdAt": "..."
  }
}
```

---

### Admin API

**File:** `frontend/src/services/api.js` → `adminAPI`

| Method | Endpoint | Description | Firestore Fallback |
|--------|----------|-------------|-------------------|
| `GET` | `/admin/analytics` | Get dashboard analytics | ✅ Aggregates from Firestore |
| `GET` | `/users` | Get all users (admin) | ✅ `fsUsers.getAll()` |
| `POST` | `/users` | Create new user | ✅ `fsUsers.create()` |
| `POST` | `/admin/projects/:id/review` | Approve/Reject/Reset project | ✅ `fsProjects.update()` |

#### Analytics Response Structure

```javascript
// GET /admin/analytics Response
{
  "analytics": {
    "totalUsers": 150,
    "totalProjects": 45,
    "totalTags": 12,
    "projectsByStatus": {
      "pending": 5,
      "approved": 38,
      "rejected": 2
    }
  }
}

// Transformed for Frontend
{
  "summary": {
    "totalUsers": 150,
    "totalProjects": 45,
    "activeDomains": 12,
    "pendingApprovals": 5
  }
}
```

#### Project Review Actions

```javascript
// Approve Project
adminAPI.approveProject(projectId)
// POST /admin/projects/:id/review { action: 'approve' }

// Reject Project
adminAPI.rejectProject(projectId)
// POST /admin/projects/:id/review { action: 'reject' }

// Reset to Pending
adminAPI.resetProject(projectId)
// POST /admin/projects/:id/review { action: 'pending' }
```

---

### Tags/Domains API

**File:** `frontend/src/services/api.js` → `tagsAPI`

| Method | Endpoint | Description | Firestore Fallback |
|--------|----------|-------------|-------------------|
| `GET` | `/tags` | Get all tags/domains | ✅ `fsDomains.getAll()` |
| `POST` | `/tags` | Create new tag | ✅ `fsDomains.create()` |
| `PUT` | `/tags/:id` | Update tag | ✅ `fsDomains.update()` |
| `DELETE` | `/tags/:id` | Delete tag | ✅ `fsDomains.delete()` |

#### Request/Response Examples

**GET /tags**
```javascript
// Response
{
  "tags": [
    { "id": "tag1", "name": "Artificial Intelligence", "projectCount": 12 },
    { "id": "tag2", "name": "Web Development", "projectCount": 25 },
    { "id": "tag3", "name": "Machine Learning", "projectCount": 8 }
  ]
}
```

---

### Assets API

**File:** `frontend/src/services/api.js` → `assetsAPI`

| Method | Endpoint | Description | Content-Type |
|--------|----------|-------------|--------------|
| `POST` | `/projects/:projectId/assets` | Upload asset to project | `multipart/form-data` |
| `POST` | `/assets/upload` | General asset upload | `multipart/form-data` |
| `GET` | `/projects/:projectId/assets` | List project assets | `application/json` |
| `DELETE` | `/assets/:assetId` | Delete asset by ID | `application/json` |
| `DELETE` | `/projects/:projectId/assets/:assetId` | Delete asset from project | `application/json` |

#### File Upload Example

```javascript
// Upload with progress tracking
const formData = new FormData();
formData.append('file', file);
formData.append('type', 'image');

assetsAPI.uploadAsset(formData, (progressEvent) => {
    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
    console.log(`Upload progress: ${percent}%`);
});
```

---

### Events API

**File:** `frontend/src/services/api.js` → `eventsAPI`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/events` | Get all events |
| `GET` | `/events/:id` | Get event by ID |
| `POST` | `/events` | Create new event |
| `PUT` | `/events/:id` | Update event |
| `DELETE` | `/events/:id` | Delete event |

#### Event Service Wrapper

**File:** `frontend/src/services/eventService.js`

```javascript
eventService.createEvent(eventData)  // Returns { success, id } or { success: false, error }
eventService.getEvents()             // Returns { success, events } or { success: false, error }
eventService.deleteEvent(eventId)    // Returns { success } or { success: false, error }
```

---

### Search API

**File:** `frontend/src/services/api.js` → `searchAPI`

| Method | Endpoint | Description | Firestore Fallback |
|--------|----------|-------------|-------------------|
| `GET` | `/search?q=query` | Search projects, users, etc. | ⚠️ Returns empty (not implemented) |

#### Request/Response Example

```javascript
// Request
searchAPI.search('machine learning')

// Response
{
  "results": [
    { "type": "project", "id": "proj1", "title": "ML Image Classifier", ... },
    { "type": "user", "id": "user1", "name": "John Doe", ... }
  ]
}
```

---

### Auth API

**File:** `frontend/src/services/api.js` → `authAPI`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/sync` | Sync Firebase user to backend |

**Note:** Most authentication happens directly with Firebase Auth client SDK.

---

## Firebase Direct Connections

When the backend API is unavailable, the frontend falls back to direct Firestore operations.

**File:** `frontend/src/services/firebaseService.js`

### Firestore Collections

| Collection | Service | Operations |
|------------|---------|------------|
| `users` | `fsUsers` | getAll, getById, create, update, delete |
| `projects` | `fsProjects` | getAll, getById, create, update, delete |
| `tags` | `fsDomains` | getAll, create, update, delete |

### Firestore User Operations

```javascript
fsUsers.getAll()           // Get all users
fsUsers.getById(uid)       // Get user by UID
fsUsers.create(uid, data)  // Create user document
fsUsers.update(uid, data)  // Update user fields
fsUsers.delete(uid)        // Delete user document
```

### Firestore Project Operations

```javascript
fsProjects.getAll(status)  // Get all projects (optional status filter)
fsProjects.getById(id)     // Get project by ID
fsProjects.create(data)    // Create project (auto-sets status: 'pending')
fsProjects.update(id, data)// Update project fields
fsProjects.delete(id)      // Delete project
```

### Firestore Domain/Tag Operations

```javascript
fsDomains.getAll()         // Get all domains
fsDomains.create(name)     // Create domain
fsDomains.update(id, data) // Update domain
fsDomains.delete(id)       // Delete domain
```

---

## Environment Variables

### Frontend (Vite) - `.env`

```bash
# Backend API URL
VITE_API_URL=http://localhost:3000

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Backend (Node.js) - `.env`

```bash
NODE_ENV=development
PORT=3000

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Firebase Service Account
# Place serviceAccountKey.json in backend directory
```

---

## Error Handling

### API Error Response Format

```javascript
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "..."
  }
}
```

### Frontend Error Handling Pattern

```javascript
try {
    const res = await api.get('/endpoint').catch(() => null);
    if (res) return res;

    // Fallback to Firestore
    const data = await firestoreMethod();
    return { data };
} catch (err) {
    return { data: { defaultValue: [] } };
}
```

### HTTP Status Codes

| Code | Meaning | Frontend Action |
|------|---------|-----------------|
| 200 | Success | Process response |
| 201 | Created | Process response |
| 400 | Bad Request | Show error message |
| 401 | Unauthorized | Auto-logout user |
| 403 | Forbidden | Show permission error |
| 404 | Not Found | Show not found message |
| 500 | Server Error | Fallback to Firestore |

---

## API Endpoint Summary Table

| Category | Endpoint | Method | Auth Required | Fallback |
|----------|----------|--------|---------------|----------|
| **Projects** | `/projects` | GET | No | ✅ |
| | `/projects/:id` | GET | No | ✅ |
| | `/projects` | POST | Yes | ✅ |
| | `/projects/:id` | PUT | Yes | ✅ |
| | `/projects/:id` | DELETE | Yes | ✅ |
| **Users** | `/users/:uid` | GET | Yes | ✅ |
| | `/users/:uid` | DELETE | Yes | ✅ |
| | `/users` | GET | Admin | ✅ |
| | `/users` | POST | Admin | ✅ |
| **Admin** | `/admin/analytics` | GET | Admin | ✅ |
| | `/admin/projects/:id/review` | POST | Admin | ✅ |
| **Tags** | `/tags` | GET | No | ✅ |
| | `/tags` | POST | Admin | ✅ |
| | `/tags/:id` | PUT | Admin | ✅ |
| | `/tags/:id` | DELETE | Admin | ✅ |
| **Assets** | `/assets/upload` | POST | Yes | ❌ |
| | `/projects/:id/assets` | GET | Yes | ❌ |
| | `/assets/:id` | DELETE | Yes | ❌ |
| **Events** | `/events` | GET | No | ❌ |
| | `/events/:id` | GET | No | ❌ |
| | `/events` | POST | Admin | ❌ |
| | `/events/:id` | PUT | Admin | ❌ |
| | `/events/:id` | DELETE | Admin | ❌ |
| **Search** | `/search` | GET | No | ⚠️ Empty |
| **Auth** | `/auth/sync` | POST | Yes | ❌ |

---

## Quick Reference: Frontend Service Files

| File | Purpose |
|------|---------|
| `src/services/api.js` | Main API service with all endpoints |
| `src/services/firebaseService.js` | Direct Firestore operations (fallback) |
| `src/services/eventService.js` | Event-specific service wrapper |
| `src/api/axiosInstance.js` | Axios instance configuration |
| `src/store/authStore.js` | Authentication state management |
| `src/config/firebase.js` | Firebase SDK initialization |

---

*This document was auto-generated by analyzing the frontend codebase.*
