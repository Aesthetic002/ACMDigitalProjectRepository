# ACM Project Archive Platform - Backend Integration Guide

**For Backend Developers Working on This Team Project**

This guide helps you understand the existing codebase, integrate your features without conflicts, and maintain consistency across the API.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Tech Stack](#architecture--tech-stack)
3. [Project Structure](#project-structure)
4. [Team Responsibilities](#team-responsibilities)
5. [Getting Started](#getting-started)
6. [Firestore Schema](#firestore-schema)
7. [Authentication & Authorization](#authentication--authorization)
8. [Existing API Endpoints](#existing-api-endpoints)
9. [Integration Guidelines](#integration-guidelines)
10. [Git Workflow](#git-workflow)
11. [Testing](#testing)
12. [Deployment](#deployment)

---

## 📌 Project Overview

The ACM Project Archive Platform is a centralized repository for ACM club projects. The backend provides:
- User authentication & management
- Project metadata CRUD operations
- Role-based access control
- Firebase integration for auth & database

**Current Status**: ✅ Authentication, Users, and Project Write Operations are complete.

**Your Mission**: Implement READ operations, Media APIs, Search, Tags, and Admin features.

---

## 🏗️ Architecture & Tech Stack

### Core Technologies
- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Authentication**: Firebase Authentication (Admin SDK)
- **Database**: Firebase Firestore (NoSQL)
- **Storage**: Firebase Storage (to be integrated by you)
- **Authorization**: JWT Bearer tokens via middleware

### Design Patterns
- **Router-based modular routes** (no business logic in `app.js`)
- **Middleware-first authentication** (`verifyToken` attaches `req.user`)
- **Consistent error responses** (`{ success, error, message }`)
- **Soft deletes** (`isDeleted` flag, not hard deletes)

---

## 📁 Project Structure

```
backend/
├── routes/                     # API route handlers (modular)
│   ├── auth.routes.js         # ✅ EXISTING: POST /api/v1/auth/verify
│   ├── users.routes.js        # ✅ EXISTING: GET/PUT /api/v1/users/*
│   ├── projects.write.js      # ✅ EXISTING: POST/PUT/DELETE /api/v1/projects/*
│   │
│   ├── test.routes.js         # 🧪 Dev-only test helpers (REMOVE in prod)
│   └── diagnose.routes.js     # 🧪 Firebase diagnostics (REMOVE in prod)
│   │
│   └── 🔄 TO BE ADDED BY YOU:
│       ├── projects.read.js   # GET /api/v1/projects, GET /api/v1/projects/:id
│       ├── search.routes.js   # GET /api/v1/search
│       ├── assets.routes.js   # POST /api/v1/assets/upload-url, etc.
│       ├── tags.routes.js     # GET/POST /api/v1/tags
│       └── admin.routes.js    # POST /api/v1/admin/* (moderation, analytics)
│
├── middleware/
│   └── auth.js                # ✅ EXISTING: verifyToken middleware
│   └── 🔄 TO BE ADDED:
│       └── admin.js           # requireAdmin middleware
│
├── services/                  # Business logic helpers (optional)
│   └── 🔄 TO BE ADDED:
│       ├── storage.service.js # Firebase Storage operations
│       └── search.service.js  # Search indexing/querying
│
├── utils/
│   └── tokenGenerator.js      # 🧪 Test token generator (dev only)
│
├── firebase.js                # ✅ EXISTING: Firebase Admin initialization
├── app.js                     # ✅ EXISTING: Express app setup & route wiring
├── package.json               # Dependencies
├── .gitignore                 # Git ignore rules
├── .env.example               # Environment variable template
└── README.md                  # Main README
```

### **Code Ownership** (Avoid Conflicts)
- **Hemanth (Existing)**:
  - `routes/auth.routes.js`
  - `routes/users.routes.js`
  - `routes/projects.write.js`
  - `middleware/auth.js`
  - `firebase.js`
  - `app.js`

- **You (New Features)**:
  - `routes/projects.read.js`
  - `routes/search.routes.js`
  - `routes/assets.routes.js`
  - `routes/tags.routes.js`
  - `routes/admin.routes.js`
  - `middleware/admin.js`
  - `services/*`

**Rule**: Don't modify files you don't own without team discussion.

---

## 👥 Team Responsibilities

### ✅ Already Implemented (Hemanth)

#### Authentication & Authorization
- Firebase token verification middleware
- User authentication endpoint
- Test token generation (dev mode)

#### User Management
- Create users (test endpoint)
- Get user profile (`GET /api/v1/users/:userId`)
- Update user profile (`PUT /api/v1/users/:userId`)
- List all users (`GET /api/v1/users`)

#### Project Write Operations
- Create project (`POST /api/v1/projects`)
- Update project (`PUT /api/v1/projects/:projectId`)
- Archive project (`DELETE /api/v1/projects/:projectId`)
- Owner/contributor access control

---

### 🔄 Your Responsibilities (To Implement)

#### 1️⃣ Project READ & Discovery
**Priority: HIGH** (Frontend needs this ASAP)

Endpoints to implement:
```
GET /api/v1/projects
  - List projects with pagination
  - Query params: limit, pageToken, status, techStack, ownerId
  - Filter out isDeleted === true
  - Return: { projects: [...], nextPageToken }

GET /api/v1/projects/:projectId
  - Get single project details
  - Return 404 if isDeleted === true
  - Include asset URLs (signed if private)
```

**Implementation Notes**:
- Reuse existing Firestore schema (no schema changes needed)
- Use existing `projects` collection
- Filter: `where('isDeleted', '==', false)`
- Pagination: use Firestore `.startAfter(lastDoc).limit(n)`
- No authentication required for public read (or optional auth for analytics)

**File to create**: `routes/projects.read.js`

---

#### 2️⃣ Search API
**Priority: MEDIUM**

Endpoints:
```
GET /api/v1/search?q=<query>&type=<projects|users|all>&limit=20
  - Search projects by title/description/techStack
  - Search users by name/email
  - Return: { results: [...], type }
```

**Implementation Options**:
- **Simple**: Firestore compound queries (limited flexibility)
- **Better**: Use Algolia or Typesense for full-text search
- **Firebase**: Use Cloud Functions to index data on write

**File to create**: `routes/search.routes.js`

---

#### 3️⃣ Media & Asset Management
**Priority: HIGH**

Endpoints:
```
POST /api/v1/assets/upload-url
  - Body: { projectId, filename, contentType }
  - Auth: Required (owner or contributor only)
  - Returns: { uploadUrl, assetId }
  - Action: Generate Firebase Storage signed upload URL

POST /api/v1/projects/:projectId/assets
  - Body: { assetId, filename, storagePath }
  - Auth: Required
  - Action: Attach asset metadata to project

GET /api/v1/projects/:projectId/assets
  - Returns: [ { id, filename, url (signed), uploadedBy, createdAt } ]

DELETE /api/v1/assets/:assetId
  - Auth: Required (owner/contributor/admin)
  - Action: Delete from storage + Firestore metadata
```

**Firestore Schema Addition** (you create this):
```
projects/{projectId}/assets/{assetId}
  - id: string
  - filename: string
  - storagePath: string (Firebase Storage path)
  - contentType: string
  - size: number
  - uploadedBy: string (uid)
  - createdAt: timestamp
```

**Security**:
- Verify `req.user.uid` is project owner or contributor before issuing upload URL
- Use short-lived signed URLs (15 min expiry)
- Validate file size and type server-side

**File to create**: `routes/assets.routes.js`, `services/storage.service.js`

---

#### 4️⃣ Tags & Taxonomy
**Priority: LOW**

Endpoints:
```
GET /api/v1/tags
  - Returns: [ { id, name, slug, count } ]
  - Public (no auth)

POST /api/v1/tags
  - Body: { name, slug }
  - Auth: Admin only
  - Action: Create new tag
```

**Firestore Schema**:
```
tags/{tagId}
  - id: string
  - name: string
  - slug: string (URL-friendly)
  - count: number (projects using this tag)
  - createdAt: timestamp
```

**Integration with Projects**:
- Add `tags: string[]` to `projects` collection schema
- When creating/updating project, validate tags exist
- Update tag counts on project create/delete

**File to create**: `routes/tags.routes.js`

---

#### 5️⃣ Admin & Moderation
**Priority: MEDIUM**

Endpoints:
```
POST /api/v1/admin/projects/:projectId/review
  - Body: { action: 'approve'|'reject', notes }
  - Auth: Admin only
  - Action: Update project.moderation metadata

POST /api/v1/admin/projects/:projectId/feature
  - Body: { featured: true|false }
  - Auth: Admin only
  - Action: Set isFeatured flag

GET /api/v1/admin/analytics
  - Auth: Admin only
  - Returns: { totalProjects, totalUsers, topTags, recentProjects }
```

**Firestore Schema Addition**:
```
projects/{projectId}
  + moderation: {
      status: 'pending' | 'approved' | 'rejected'
      reviewedBy: string (uid)
      reviewedAt: timestamp
      notes: string
    }
  + isFeatured: boolean
  + featuredAt: timestamp
```

**Middleware to create**: `middleware/admin.js`
```javascript
const requireAdmin = async (req, res, next) => {
  const { db } = require('../firebase');
  const userDoc = await db.collection('users').doc(req.user.uid).get();
  if (userDoc.data().role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Forbidden' });
  }
  next();
};
```

**File to create**: `routes/admin.routes.js`, `middleware/admin.js`

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone <repo-url>
cd backend
npm install
```

### 2. Setup Firebase

You need a Firebase service account key:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: `acmdigitalprojectrepository`
3. Project Settings → Service Accounts → Generate New Private Key
4. Save as `backend/serviceAccountKey.json`
5. **NEVER commit this file** (already in `.gitignore`)

### 3. Environment Variables

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env`:
```env
NODE_ENV=development
PORT=3000
```

### 4. Run Development Server

```bash
npm run dev
```

Server starts at `http://localhost:3000`

### 5. Test Existing Endpoints

Use the test endpoints to verify setup:
```bash
# Health check
curl http://localhost:3000/health

# Diagnose Firebase
curl http://localhost:3000/api/v1/diagnose/diagnose
```

All services should show ✅ OK.

---

## 🗄️ Firestore Schema

### Current Schema (DO NOT MODIFY)

#### `users` Collection
```javascript
users/{uid}
  - uid: string (document ID)
  - email: string
  - name: string
  - role: 'member' | 'admin'
  - createdAt: ISO timestamp
  - updatedAt: ISO timestamp
```

#### `projects` Collection
```javascript
projects/{projectId}
  - title: string
  - description: string
  - techStack: string[] (e.g., ['React', 'Node.js'])
  - contributors: string[] (array of uids)
  - ownerId: string (uid, IMMUTABLE)
  - status: 'pending' | 'approved' | 'rejected'
  - createdAt: ISO timestamp
  - updatedAt: ISO timestamp
  - isDeleted: boolean (soft delete flag)
  - deletedAt: ISO timestamp (optional)
  - deletedBy: string (uid, optional)
```

### Schema Extensions (You Add These)

#### `projects/{projectId}/assets` Subcollection
```javascript
projects/{projectId}/assets/{assetId}
  - id: string
  - filename: string
  - storagePath: string
  - contentType: string
  - size: number (bytes)
  - uploadedBy: string (uid)
  - createdAt: ISO timestamp
```

#### `tags` Collection
```javascript
tags/{tagId}
  - id: string
  - name: string
  - slug: string
  - count: number
  - createdAt: ISO timestamp
```

#### Add to `projects` Collection
```javascript
projects/{projectId}
  + tags: string[] (array of tag slugs)
  + moderation: {
      status: 'pending' | 'approved' | 'rejected'
      reviewedBy: string
      reviewedAt: ISO timestamp
      notes: string
    }
  + isFeatured: boolean
  + featuredAt: ISO timestamp
```

---

## 🔐 Authentication & Authorization

### How Authentication Works

1. **Frontend** sends Firebase ID token in header:
   ```
   Authorization: Bearer <firebase-id-token>
   ```

2. **Middleware** (`verifyToken`) validates token and attaches user:
   ```javascript
   req.user = {
     uid: 'user-firebase-uid',
     email: 'user@acm.com',
     ...
   }
   ```

3. **Routes** access `req.user` to enforce permissions

### Using the Middleware

```javascript
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

// Protected endpoint
router.get('/my-endpoint', verifyToken, async (req, res) => {
  const userId = req.user.uid;  // Authenticated user
  const email = req.user.email;
  // ... your logic
});
```

### Role-Based Access Control

**Roles**:
- `member` (default): Can create projects, update own profile
- `owner`: Creator of a project (ownerId === req.user.uid)
- `contributor`: Listed in project.contributors array
- `admin`: role === 'admin' in users collection

**Access Checks**:

Owner/Contributor check:
```javascript
const projectDoc = await db.collection('projects').doc(projectId).get();
const project = projectDoc.data();

const isOwner = project.ownerId === req.user.uid;
const isContributor = project.contributors.includes(req.user.uid);

if (!isOwner && !isContributor) {
  return res.status(403).json({ success: false, error: 'Forbidden' });
}
```

Admin check (create this middleware):
```javascript
// middleware/admin.js
const { db } = require('../firebase');

const requireAdmin = async (req, res, next) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    
    if (!userDoc.exists || userDoc.data().role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Admin access required'
      });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: error.message
    });
  }
};

module.exports = { requireAdmin };
```

Usage:
```javascript
const { verifyToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

router.post('/admin/feature-project', verifyToken, requireAdmin, async (req, res) => {
  // Only admins reach here
});
```

---

## 📡 Existing API Endpoints

### Authentication
```
POST /api/v1/auth/verify
  - Headers: Authorization: Bearer <token>
  - Returns: { success, user }
  - Creates user in Firestore if doesn't exist
```

### User Management
```
GET /api/v1/users/:userId
  - Auth: Required
  - Returns: { success, user }

PUT /api/v1/users/:userId
  - Auth: Required (own profile or admin)
  - Body: { name, role, ... }
  - Returns: { success, user }

GET /api/v1/users?role=member&limit=50
  - Auth: Required
  - Returns: { success, users, count }
```

### Project Write Operations
```
POST /api/v1/projects
  - Auth: Required
  - Body: { title, description, techStack, contributors, status }
  - Returns: { success, project }
  - ownerId auto-set from req.user.uid

PUT /api/v1/projects/:projectId
  - Auth: Required (owner or contributor)
  - Body: { title, description, techStack, contributors, status }
  - Returns: { success, project }

DELETE /api/v1/projects/:projectId
  - Auth: Required (owner or contributor)
  - Soft delete: sets isDeleted = true
  - Returns: { success, message }
```

### Test Endpoints (Dev Only - Remove in Production)
```
POST /api/v1/test/create-user
GET /api/v1/test/list-projects
GET /api/v1/test/list-users
POST /api/v1/test/get-id-token
GET /api/v1/diagnose/diagnose
```

---

## 🔗 Integration Guidelines

### Rule 1: Don't Modify Existing Routes

**DO NOT** edit these files:
- `routes/auth.routes.js`
- `routes/users.routes.js`
- `routes/projects.write.js`
- `middleware/auth.js`
- `firebase.js`

**Exception**: Discuss with team first if you need to modify shared files.

### Rule 2: Follow Existing Patterns

**Consistent Error Responses**:
```javascript
// Success
res.status(200).json({
  success: true,
  data: { ... }
});

// Error
res.status(400).json({
  success: false,
  error: 'ValidationError',
  message: 'Title is required'
});
```

**HTTP Status Codes**:
- 200: Success
- 201: Created
- 400: Bad Request (validation)
- 401: Unauthorized (missing/invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Internal Server Error

**Route File Structure**:
```javascript
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { db } = require('../firebase');

/**
 * GET /api/v1/your-endpoint
 * 
 * Description of what this endpoint does.
 */
router.get('/your-endpoint', verifyToken, async (req, res) => {
  try {
    // Your logic here
    
    return res.status(200).json({
      success: true,
      data: { ... }
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: error.message
    });
  }
});

module.exports = router;
```

### Rule 3: Register Your Routes in app.js

After creating a new route file:

1. Import at top of `app.js`:
```javascript
const yourRoutes = require('./routes/your.routes');
```

2. Wire it below existing routes:
```javascript
app.use('/api/v1/your-path', yourRoutes);
```

3. Create a PR for review before merging

### Rule 4: Maintain Backward Compatibility

- Don't change existing response formats
- Don't rename existing fields
- Don't change existing query params
- Add new fields as optional
- Use API versioning if breaking changes needed (`/api/v2/...`)

### Rule 5: Reuse Existing Firestore Schema

- Use `projects` and `users` collections as-is
- Add subcollections for new data (e.g., `projects/{id}/assets`)
- Add new top-level collections sparingly (e.g., `tags`)
- Add new fields to existing docs (e.g., `project.tags`)

---

## 🔄 Git Workflow

### Branch Strategy

- `main` — Protected, deployable only via PR
- `develop` — Optional integration branch
- Feature branches: `feature/your-feature-name`
- Bugfix branches: `fix/issue-description`

### Creating a Feature

1. **Create branch from main**:
```bash
git checkout main
git pull origin main
git checkout -b feature/projects-read-api
```

2. **Make changes, commit often**:
```bash
git add routes/projects.read.js
git commit -m "feat: implement GET /api/v1/projects endpoint"
```

3. **Push to remote**:
```bash
git push origin feature/projects-read-api
```

4. **Create Pull Request** on GitHub:
   - Title: `feat: Add project list and detail read endpoints`
   - Description: Explain what you implemented
   - Link related issue
   - Request review from team

5. **Address review comments**, then merge

### Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add search API endpoint
fix: correct pagination bug in projects list
docs: update integration guide
chore: update dependencies
refactor: simplify asset upload logic
test: add unit tests for admin routes
```

### Before Pushing

**Run checks**:
```bash
npm run lint   # (if configured)
npm test       # (if configured)
```

**Avoid committing**:
- `serviceAccountKey.json`
- `.env`
- `node_modules/`
- Large files

---

## 🧪 Testing

### Manual Testing with Postman

1. **Get a test token**:
```bash
POST http://localhost:3000/api/v1/test/get-id-token
Body: { "email": "test@acm.com" }
```
Copy the `idToken` from response.

2. **Use token in requests**:
```
Authorization: Bearer <your-id-token>
```

3. **Test your endpoints**

### Example Postman Tests

**Test GET /api/v1/projects**:
```
GET http://localhost:3000/api/v1/projects?limit=10&status=approved

Expected: 200 OK
{
  "success": true,
  "projects": [...],
  "nextPageToken": "..."
}
```

**Test unauthorized access**:
```
GET http://localhost:3000/api/v1/admin/analytics
(No Authorization header)

Expected: 401 Unauthorized
```

---

## 🚀 Deployment

### Environment Variables

Set these in production:
```
NODE_ENV=production
PORT=3000
FIREBASE_SERVICE_ACCOUNT=<base64-encoded-json>
```

### Remove Test Endpoints

Before deploying:
1. Delete `routes/test.routes.js`
2. Delete `routes/diagnose.routes.js`
3. Remove from `app.js`:
```javascript
// DELETE THESE LINES:
const testRoutes = require('./routes/test.routes');
const diagnoseRoutes = require('./routes/diagnose.routes');
app.use('/api/v1/test', testRoutes);
app.use('/api/v1/diagnose', diagnoseRoutes);
```

### Build & Deploy

```bash
# Install production dependencies only
npm ci --production

# Start server
npm start
```

---

## 📞 Contact & Support

- **Team Lead**: Hemanth
- **Codebase**: [GitHub Repo URL]
- **API Docs**: See `openapi.yaml` (to be created)
- **Questions**: Open a GitHub Issue or ask in team chat

---

## 📚 Additional Resources

- [Firebase Admin SDK Docs](https://firebase.google.com/docs/admin/setup)
- [Firestore Data Model](https://firebase.google.com/docs/firestore/data-model)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

**Good luck building! 🚀**

For questions, create a GitHub issue or reach out to the team.
