---
tags: [project/ACMDigitalRepository, firebase, auth, database]
created: 2026-04-04
related: [[Obsidian-ACMDigitalRepository]]
---

# Firebase Integration

## What this is

Firebase provides two critical services for the ACM Digital Repository:
1. **Firebase Authentication** - User identity and JWT token management
2. **Firebase Firestore** - NoSQL document database for all persistent data

This document explains how both services are integrated, configured, and used throughout the application.

---

## Why it matters for this project

### Firebase Auth
- **Zero authentication code**: Firebase handles password hashing, email verification, password reset flows
- **Social auth ready**: Can add Google/GitHub login with minimal config
- **JWT tokens**: Industry-standard tokens that work seamlessly with backend verification
- **Free tier**: 10K monthly active users for free

### Firestore
- **Serverless**: No database server to manage or scale
- **Real-time**: Can subscribe to document changes (currently not used but available)
- **Offline-first**: Client SDKs cache data for offline use
- **Flexible schema**: No migrations needed for schema changes
- **Free tier**: 50K reads + 20K writes + 1GB storage per day

---

## How it works

### Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      FRONTEND                                 │
│  ┌────────────────┐          ┌──────────────────┐            │
│  │ Firebase SDK   │          │ axiosInstance    │            │
│  │ (Client-side)  │          │ (API client)     │            │
│  └────────┬───────┘          └─────────┬────────┘            │
│           │                            │                     │
│           │ 1. Auth with               │ 2. API calls        │
│           │    email/password          │    + Bearer token   │
│           ▼                            ▼                     │
└───────────┼────────────────────────────┼─────────────────────┘
            │                            │
            │                            │
┌───────────▼────────────────────────────▼─────────────────────┐
│                      FIREBASE CLOUD                           │
│  ┌────────────────┐          ┌──────────────────┐            │
│  │ Firebase Auth  │          │   Firestore      │            │
│  │ (Managed)      │          │   (Database)     │            │
│  └────────┬───────┘          └─────────┬────────┘            │
└───────────┼────────────────────────────┼─────────────────────┘
            │                            │
            │ 3. Return                  │ 4. Store/fetch
            │    ID token                │    documents
            ▼                            ▼
┌──────────────────────────────────────────────────────────────┐
│                      BACKEND                                  │
│  ┌────────────────┐          ┌──────────────────┐            │
│  │ Firebase Admin │          │ Firestore Admin  │            │
│  │ SDK (verifyToken)│        │ SDK (CRUD ops)   │            │
│  └────────────────┘          └──────────────────┘            │
└──────────────────────────────────────────────────────────────┘
```

### Frontend (Client SDK)

**Location**: Not directly used (auth handled by backend API)

The frontend does NOT use Firebase client SDK. Instead:
1. User submits login form
2. Frontend sends `POST /api/v1/auth/login` with email/password
3. Backend handles Firebase Auth and returns custom token
4. Frontend stores token in Zustand and axios interceptor

### Backend (Admin SDK)

**Location**: `backend/firebase.js`

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

module.exports = { db, auth, admin };
```

**Key exports**:
- `db` - Firestore database instance
- `auth` - Firebase Auth instance for token verification
- `admin` - Full admin SDK for advanced operations

---

## Key parameters / configuration

### Service Account Key

**File**: `backend/serviceAccountKey.json` (not in git)

This JSON file contains:
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "...",
  "client_x509_cert_url": "..."
}
```

**How to obtain**:
1. Go to Firebase Console
2. Project Settings → Service Accounts
3. Click "Generate new private key"
4. Save as `serviceAccountKey.json` in backend root

### Firestore Collections

| Collection | Document Structure | Purpose |
|------------|-------------------|---------|
| `users` | `{ uid, email, displayName, role, avatar, bio, skills[], githubUrl, linkedinUrl, joinedAt }` | User profiles |
| `projects` | `{ projectId, title, description, domain, techStack[], contributors[], ownerId, status, assets[], createdAt, updatedAt, views }` | Project submissions |
| `tags` | `{ tagId, name, category, count }` | Tag definitions and usage counts |
| `events` | `{ eventId, title, description, date, ... }` | Events (if used) |

---

## Gotchas & edge cases

### 1. Token Verification Performance

**Problem**: Verifying tokens on every request adds latency (~50-100ms).

**Solution**: The `verifyToken` middleware caches decoded tokens:
```javascript
// In middleware/auth.js
const tokenCache = new Map();

async function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split('Bearer ')[1];
  
  // Check cache first
  if (tokenCache.has(token)) {
    req.user = tokenCache.get(token);
    return next();
  }
  
  // Verify with Firebase
  const decodedToken = await admin.auth().verifyIdToken(token);
  tokenCache.set(token, decodedToken);
  req.user = decodedToken;
  next();
}
```

> [!WARNING]
> Cache must expire when tokens expire (1 hour by default). Current implementation doesn't handle this.

### 2. Firestore Timestamp Formats

**Problem**: Firestore timestamps can appear as:
- Firestore Timestamp object: `{ _seconds: 1234567890 }`
- ISO string: `"2026-04-04T12:00:00Z"`
- JavaScript Date object
- Raw number (milliseconds)

**Solution**: Use the `safeFormatDate()` helper in frontend:
```javascript
const safeFormatDate = (dateValue) => {
  if (!dateValue) return '—';
  
  try {
    let date;
    if (dateValue._seconds) {
      date = new Date(dateValue._seconds * 1000);
    } else if (typeof dateValue === 'string') {
      date = new Date(dateValue);
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else if (typeof dateValue === 'number') {
      date = new Date(dateValue);
    }
    
    return isNaN(date.getTime()) ? 'Unknown date' : format(date, 'PPP');
  } catch (error) {
    return 'Unknown date';
  }
};
```

### 3. Route Order Bug (verifyToken)

**Problem**: Express matches routes sequentially. If `GET /users/:userId` comes before `GET /users`, requests to `/users` match `:userId` route.

**Example** (`backend/routes/users.routes.js`):
```javascript
// ❌ WRONG - /users matches /:userId
router.get('/:userId', verifyToken, getUserById);
router.get('/', verifyToken, getAllUsers);

// ✅ CORRECT - exact path first
router.get('/', verifyToken, getAllUsers);
router.get('/:userId', verifyToken, getUserById);
```

### 4. Contributor Enrichment

**Problem**: Projects store `contributors: ["uid1", "uid2"]` but need full user objects for display.

**Solution**: Backend enriches contributors before returning project:
```javascript
// In projects.read.js
const project = await db.collection('projects').doc(projectId).get();
const contributorsList = [];

for (const contributorUid of project.contributors || []) {
  const userDoc = await db.collection('users').doc(contributorUid).get();
  if (userDoc.exists) {
    const userData = userDoc.data();
    contributorsList.push({
      uid: contributorUid,
      displayName: userData.displayName || 'Unknown',
      avatar: userData.avatar || null,
      role: userData.role || 'contributor'
    });
  }
}

return res.json({
  ...project.data(),
  contributorsList  // Frontend uses this instead of raw contributors array
});
```

### 5. Domain Filtering

**Problem**: Firestore doesn't support `.where('domain', '==', domain)` filtering efficiently when combined with other filters.

**Solution**: Fetch all projects, filter in-memory:
```javascript
const domain = req.query.domain;
const status = req.query.status || 'approved';

const snapshot = await db.collection('projects')
  .orderBy('createdAt', 'desc')
  .get();

const projects = [];
snapshot.forEach(doc => {
  const data = doc.data();
  
  // Filter deleted
  if (data.isDeleted) return;
  
  // Filter by status
  if (data.status !== status) return;
  
  // Filter by domain
  if (domain && data.domain !== domain) return;
  
  projects.push({ projectId: doc.id, ...data });
});

return res.json({ projects });
```

> [!NOTE]
> This approach is fine for <10K projects. For larger scale, consider composite indexes or Algolia.

---

## Examples

### 1. Creating a User

```javascript
// POST /api/v1/users
const { email, password, displayName, role } = req.body;

// Create Firebase Auth user
const userRecord = await admin.auth().createUser({
  email,
  password,
  displayName
});

// Create Firestore user document
await db.collection('users').doc(userRecord.uid).set({
  uid: userRecord.uid,
  email,
  displayName,
  role: role || 'contributor',
  avatar: null,
  bio: '',
  skills: [],
  githubUrl: '',
  linkedinUrl: '',
  joinedAt: admin.firestore.FieldValue.serverTimestamp()
});

res.status(201).json({ uid: userRecord.uid, email, displayName });
```

### 2. Getting User Profile with Projects

```javascript
// GET /api/v1/users/:uid
const { uid } = req.params;

// Fetch user document
const userDoc = await db.collection('users').doc(uid).get();
if (!userDoc.exists) {
  return res.status(404).json({ error: 'User not found' });
}

// Fetch projects where user is owner OR contributor
const projectsSnapshot = await db.collection('projects')
  .where('contributors', 'array-contains', uid)
  .where('status', '==', 'approved')
  .get();

const projects = [];
projectsSnapshot.forEach(doc => {
  projects.push({ projectId: doc.id, ...doc.data() });
});

res.json({
  ...userDoc.data(),
  projects
});
```

### 3. Approving a Project (Admin)

```javascript
// POST /api/v1/admin/projects/:projectId/review
const { projectId } = req.params;
const { action } = req.body;  // 'approve' or 'reject'

if (!['approve', 'reject'].includes(action)) {
  return res.status(400).json({ error: 'Invalid action' });
}

const status = action === 'approve' ? 'approved' : 'rejected';

await db.collection('projects').doc(projectId).update({
  status,
  reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
  reviewedBy: req.user.uid  // From verifyToken middleware
});

res.json({ message: `Project ${status}`, status });
```

### 4. Search Across Collections

```javascript
// GET /api/v1/search?q=machine learning&type=all
const { q, type } = req.query;
const query = q.toLowerCase();

let results = { projects: [], users: [] };

if (type === 'all' || type === 'projects') {
  const projectsSnapshot = await db.collection('projects')
    .where('status', '==', 'approved')
    .get();
  
  projectsSnapshot.forEach(doc => {
    const data = doc.data();
    const searchableText = `${data.title} ${data.description} ${data.techStack?.join(' ')}`.toLowerCase();
    
    if (searchableText.includes(query)) {
      results.projects.push({ projectId: doc.id, ...data });
    }
  });
}

if (type === 'all' || type === 'users') {
  const usersSnapshot = await db.collection('users').get();
  
  usersSnapshot.forEach(doc => {
    const data = doc.data();
    const searchableText = `${data.displayName} ${data.bio} ${data.skills?.join(' ')}`.toLowerCase();
    
    if (searchableText.includes(query)) {
      results.users.push({ uid: doc.id, ...data });
    }
  });
}

res.json(results);
```

---

## Links / references

- [Firebase Admin SDK Docs](https://firebase.google.com/docs/admin/setup)
- [Firestore Data Model](https://firebase.google.com/docs/firestore/data-model)
- [Firebase Auth Token Verification](https://firebase.google.com/docs/auth/admin/verify-id-tokens)
- [Firestore Query Limitations](https://firebase.google.com/docs/firestore/query-data/queries#query_limitations)
