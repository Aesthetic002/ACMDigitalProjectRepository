---
tags: [project/ACMDigitalRepository, backend, express, api]
created: 2026-04-04
related: [[Obsidian-ACMDigitalRepository]]
---

# Backend Routes

## What this is

The backend uses **Express.js** to define REST API endpoints. Routes are organized by resource (users, projects, etc.) in separate files under `backend/routes/`.

This document explains:
- Route organization and mounting
- Middleware chain (auth, admin checks, validation)
- Key endpoints and their implementation
- Common patterns and gotchas

---

## Why it matters for this project

Proper route organization enables:
- **Separation of concerns**: Each resource has its own file
- **Middleware composition**: Auth/admin checks applied declaratively
- **Maintainability**: Easy to find and modify specific endpoints
- **Testability**: Routes can be tested independently

---

## How it works

### Route Mounting (app.js)

**File**: `backend/app.js`

```javascript
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const projectsReadRoutes = require('./routes/projects.read');
const projectsWriteRoutes = require('./routes/projects.write');
const adminRoutes = require('./routes/admin.routes');
const searchRoutes = require('./routes/search.routes');
const tagsRoutes = require('./routes/tags.routes');
const assetsRoutes = require('./routes/assets.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/projects', projectsReadRoutes);
app.use('/api/v1/projects', projectsWriteRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/tags', tagsRoutes);
app.use('/api/v1/assets', assetsRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Middleware Chain

**File**: `backend/middleware/auth.js`

```javascript
const { auth } = require('../firebase');

// Extract and verify Firebase JWT token
async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    
    // Attach user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: decodedToken.role || 'viewer'
    };
    
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { verifyToken };
```

**File**: `backend/middleware/admin.js`

```javascript
const { db } = require('../firebase');

// Require admin role
async function requireAdmin(req, res, next) {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    
    if (!userDoc.exists || userDoc.data().role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    next();
  } catch (error) {
    console.error('Admin check failed:', error);
    res.status(500).json({ error: 'Authorization failed' });
  }
}

// Require contributor role or higher
async function requireContributor(req, res, next) {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    
    if (!userDoc.exists) {
      return res.status(403).json({ error: 'User not found' });
    }
    
    const role = userDoc.data().role;
    if (!['contributor', 'admin'].includes(role)) {
      return res.status(403).json({ error: 'Contributor access required' });
    }
    
    next();
  } catch (error) {
    console.error('Contributor check failed:', error);
    res.status(500).json({ error: 'Authorization failed' });
  }
}

module.exports = { requireAdmin, requireContributor };
```

---

## Key parameters / configuration

### Route Files Structure

| File | Endpoints | Auth Required | Description |
|------|-----------|---------------|-------------|
| `auth.routes.js` | POST /login, /register, /logout | No | Authentication |
| `users.routes.js` | GET /, GET /:uid, PUT /:uid | Yes | User management |
| `projects.read.js` | GET /, GET /:id | Partial | Project listing/details |
| `projects.write.js` | POST /, PUT /:id, DELETE /:id | Yes | Project mutations |
| `admin.routes.js` | POST /projects/:id/review, etc. | Admin only | Admin operations |
| `search.routes.js` | GET /?q=...&type=... | No | Search |
| `tags.routes.js` | GET / | No | Tag listing |
| `assets.routes.js` | POST /upload | Yes | File uploads |

---

## Gotchas & edge cases

### 1. Route Order Matters (Critical)

**Problem**: Express matches routes in the order they're defined. Parameterized routes (`:id`) can match literal paths.

**Example** (`users.routes.js`):
```javascript
// ❌ WRONG ORDER
router.get('/:userId', verifyToken, getUserById);  // This matches "/users" too!
router.get('/', verifyToken, getAllUsers);         // Never reached

// ✅ CORRECT ORDER
router.get('/', verifyToken, getAllUsers);         // Exact match first
router.get('/:userId', verifyToken, getUserById);  // Param route last
```

**Real bug fixed**: This was causing 403 errors on `GET /api/v1/users` because it was matching `/:userId` route and trying to fetch a user with UID "users".

### 2. Domain Filtering Implementation

**Location**: `backend/routes/projects.read.js`

**Problem**: Need to filter projects by domain, but Firestore compound queries are limited.

**Solution**: Fetch all, filter in-memory.

```javascript
// GET /api/v1/projects?domain=ai&status=approved&limit=20
router.get('/', async (req, res) => {
  try {
    const { domain, status = 'approved', limit = 20, offset = 0 } = req.query;
    
    // Fetch all projects (ordered by creation date)
    const snapshot = await db.collection('projects')
      .orderBy('createdAt', 'desc')
      .get();
    
    const projects = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      
      // Skip deleted projects
      if (data.isDeleted) return;
      
      // Filter by status
      if (data.status !== status) return;
      
      // Filter by domain (if provided)
      if (domain && data.domain !== domain) return;
      
      projects.push({
        projectId: doc.id,
        ...data
      });
    });
    
    // Pagination
    const paginatedProjects = projects.slice(offset, offset + parseInt(limit));
    
    res.json({
      projects: paginatedProjects,
      total: projects.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});
```

### 3. Contributor Enrichment

**Location**: `backend/routes/projects.read.js`, lines 243-266

**Problem**: Projects store `contributors: ["uid1", "uid2"]` but frontend needs full user objects.

**Solution**: Fetch user docs for each contributor UID.

```javascript
// GET /api/v1/projects/:projectId
router.get('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const projectDoc = await db.collection('projects').doc(projectId).get();
    if (!projectDoc.exists) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const projectData = projectDoc.data();
    
    // Enrich contributors
    const contributorsList = [];
    if (projectData.contributors && Array.isArray(projectData.contributors)) {
      for (const contributorUid of projectData.contributors) {
        const userDoc = await db.collection('users').doc(contributorUid).get();
        
        if (userDoc.exists) {
          const userData = userDoc.data();
          contributorsList.push({
            uid: contributorUid,
            displayName: userData.displayName || 'Unknown User',
            avatar: userData.avatar || null,
            role: userData.role || 'contributor'
          });
        } else {
          // Handle deleted users
          contributorsList.push({
            uid: contributorUid,
            displayName: 'Unknown User',
            avatar: null,
            role: 'contributor'
          });
        }
      }
    }
    
    // Increment view count
    await db.collection('projects').doc(projectId).update({
      views: admin.firestore.FieldValue.increment(1)
    });
    
    res.json({
      projectId,
      ...projectData,
      contributorsList,  // Frontend uses this
      views: (projectData.views || 0) + 1
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});
```

### 4. Contributor ID Filtering

**Location**: `backend/routes/projects.read.js`, lines 97-108

**Problem**: Need to find projects where user is owner OR contributor.

**Solution**: Use `contributorId` query param to filter both.

```javascript
// GET /api/v1/projects?contributorId=user123
const { contributorId } = req.query;

if (contributorId) {
  // Option 1: Query by ownerId
  const ownedSnapshot = await db.collection('projects')
    .where('ownerId', '==', contributorId)
    .get();
  
  // Option 2: Query by contributors array
  const contributedSnapshot = await db.collection('projects')
    .where('contributors', 'array-contains', contributorId)
    .get();
  
  // Merge results (deduplicate by projectId)
  const projectMap = new Map();
  
  ownedSnapshot.forEach(doc => {
    projectMap.set(doc.id, { projectId: doc.id, ...doc.data() });
  });
  
  contributedSnapshot.forEach(doc => {
    projectMap.set(doc.id, { projectId: doc.id, ...doc.data() });
  });
  
  const projects = Array.from(projectMap.values());
  return res.json({ projects });
}
```

### 5. Search Endpoint Type Handling

**Location**: `backend/gateway/index.js`, lines 633-717

**Problem**: Search needs to support `type=projects`, `type=users`, and `type=all`.

**Solution**: Branch on type parameter.

```javascript
// GET /api/v1/search?q=machine learning&type=users
app.get('/api/v1/search', async (req, res) => {
  const { q, type = 'all' } = req.query;
  
  if (!q) {
    return res.status(400).json({ error: 'Query parameter required' });
  }
  
  const query = q.toLowerCase();
  const results = {};
  
  try {
    if (type === 'users' || type === 'all') {
      const usersSnapshot = await db.collection('users').get();
      const users = [];
      
      usersSnapshot.forEach(doc => {
        const data = doc.data();
        const searchableText = [
          data.displayName,
          data.bio,
          ...(data.skills || [])
        ].join(' ').toLowerCase();
        
        if (searchableText.includes(query)) {
          users.push({ uid: doc.id, ...data });
        }
      });
      
      results.users = users;
    }
    
    if (type === 'projects' || type === 'all') {
      const projectsSnapshot = await db.collection('projects')
        .where('status', '==', 'approved')
        .get();
      
      const projects = [];
      
      projectsSnapshot.forEach(doc => {
        const data = doc.data();
        const searchableText = [
          data.title,
          data.description,
          ...(data.techStack || [])
        ].join(' ').toLowerCase();
        
        if (searchableText.includes(query)) {
          projects.push({ projectId: doc.id, ...data });
        }
      });
      
      results.projects = projects;
    }
    
    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});
```

---

## Examples

### 1. Creating a Project

```javascript
// POST /api/v1/projects
router.post('/', verifyToken, requireContributor, async (req, res) => {
  try {
    const {
      title,
      description,
      domain,
      techStack,
      contributors,
      githubUrl,
      assets
    } = req.body;
    
    // Validation
    if (!title || !description || !domain) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const projectId = uuidv4();
    const ownerId = req.user.uid;
    
    // Ensure owner is in contributors list
    const contributorsList = contributors || [];
    if (!contributorsList.includes(ownerId)) {
      contributorsList.push(ownerId);
    }
    
    const projectData = {
      projectId,
      title,
      description,
      domain,
      techStack: techStack || [],
      contributors: contributorsList,
      ownerId,
      status: 'pending',
      assets: assets || [],
      githubUrl: githubUrl || '',
      views: 0,
      isDeleted: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection('projects').doc(projectId).set(projectData);
    
    res.status(201).json({
      message: 'Project created successfully',
      projectId,
      ...projectData
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});
```

### 2. Updating User Profile

```javascript
// PUT /api/v1/users/:uid
router.put('/:uid', verifyToken, async (req, res) => {
  try {
    const { uid } = req.params;
    
    // Only allow users to edit their own profile (or admins)
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    const isAdmin = userDoc.exists && userDoc.data().role === 'admin';
    
    if (req.user.uid !== uid && !isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const {
      displayName,
      bio,
      skills,
      githubUrl,
      linkedinUrl,
      avatar
    } = req.body;
    
    const updates = {};
    if (displayName !== undefined) updates.displayName = displayName;
    if (bio !== undefined) updates.bio = bio;
    if (skills !== undefined) updates.skills = skills;
    if (githubUrl !== undefined) updates.githubUrl = githubUrl;
    if (linkedinUrl !== undefined) updates.linkedinUrl = linkedinUrl;
    if (avatar !== undefined) updates.avatar = avatar;
    
    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    
    await db.collection('users').doc(uid).update(updates);
    
    res.json({
      message: 'Profile updated successfully',
      uid,
      ...updates
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});
```

### 3. Admin Analytics

```javascript
// GET /api/v1/admin/analytics
router.get('/analytics', verifyToken, requireAdmin, async (req, res) => {
  try {
    // Count users
    const usersSnapshot = await db.collection('users').get();
    const totalUsers = usersSnapshot.size;
    
    // Count projects by status
    const projectsSnapshot = await db.collection('projects').get();
    let totalProjects = 0;
    let approvedProjects = 0;
    let pendingProjects = 0;
    
    projectsSnapshot.forEach(doc => {
      const data = doc.data();
      if (!data.isDeleted) {
        totalProjects++;
        if (data.status === 'approved') approvedProjects++;
        if (data.status === 'pending') pendingProjects++;
      }
    });
    
    // Count by domain
    const domainCounts = {};
    projectsSnapshot.forEach(doc => {
      const data = doc.data();
      if (!data.isDeleted && data.status === 'approved') {
        domainCounts[data.domain] = (domainCounts[data.domain] || 0) + 1;
      }
    });
    
    res.json({
      users: {
        total: totalUsers
      },
      projects: {
        total: totalProjects,
        approved: approvedProjects,
        pending: pendingProjects
      },
      domains: domainCounts
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});
```

---

## Links / references

- [[Obsidian-ACMDigitalRepository]] — Master documentation
- [[Obsidian-Firebase-Integration]] — Firebase Auth and Firestore patterns
- [Express Routing Guide](https://expressjs.com/en/guide/routing.html)
- [Express Middleware](https://expressjs.com/en/guide/using-middleware.html)
