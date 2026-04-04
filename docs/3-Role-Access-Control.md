---
title: 3-Role Access Control System - ACM Digital Repository
tags: [rbac, authentication, authorization, security]
status: complete
created: 2026-03-29
---

# 3-Role Access Control System

**Parent Document**: [[Recent-Implementation-Changes|Recent Changes]]

## Table of Contents
- [[#Overview & Goals|Overview]]
- [[#Role Hierarchy|Hierarchy]]
- [[#Backend Implementation|Backend]]
- [[#Frontend Implementation|Frontend]]
- [[#Migration from 2-Role|Migration]]
- [[#Testing & Verification|Testing]]
- [[#Security Considerations|Security]]

---

## Overview & Goals

### What Problem This Solves
The previous system had only two roles:
- **admin**: Full control
- **member**: Could create projects AND view

**The Issue**: No way to have "read-only" users who want to browse projects without contributing. Every authenticated user could create projects, leading to spam risk and no clear separation of privileges.

### The Solution: 3-Tier System
```
viewer (default) < contributor < admin
```

Each level **inherits** permissions from below:
- **viewer**: Browse projects, search, view profiles
- **contributor**: Everything viewer can + create/edit own projects
- **admin**: Everything contributor can + approve projects, manage users

### Success Criteria
- ✅ New users default to `viewer` (not `member`)
- ✅ Viewers cannot access `/submit` page
- ✅ Contributors see "Submit Project" in navbar
- ✅ Admins can change any user's role via dropdown
- ✅ Backend enforces role checks on protected routes
- ✅ No breaking changes for existing users (migration handled)

### Tech Stack
- **Backend**: Express middleware (`requireContributor`, `requireAdmin`)
- **Frontend**: Zustand store + React protected routes
- **Database**: Firestore `users/{uid}.role` field
- **Auth**: Firebase Authentication (tokens include uid, not role)

---

## Role Hierarchy

### Permission Matrix

| Permission | Viewer | Contributor | Admin |
|------------|:------:|:-----------:|:-----:|
| View approved projects | ✅ | ✅ | ✅ |
| Search projects | ✅ | ✅ | ✅ |
| View member profiles | ✅ | ✅ | ✅ |
| Create new project | ❌ | ✅ | ✅ |
| Edit own project | ❌ | ✅ | ✅ |
| Delete own project | ❌ | ✅ | ✅ |
| View pending projects | ❌ | Own only | ✅ |
| Approve/reject projects | ❌ | ❌ | ✅ |
| View all users | ❌ | ❌ | ✅ |
| Change user roles | ❌ | ❌ | ✅ |
| Delete users | ❌ | ❌ | ✅ |

### Role Constants

**Backend**: `backend/middleware/admin.js`
```javascript
const VALID_ROLES = ["viewer", "contributor", "admin"];
```

**Frontend**: `frontend/src/store/authStore.js`
```javascript
export const VALID_ROLES = ["viewer", "contributor", "admin"];
export const DEFAULT_ROLE = "viewer";
```

> [!warning]
> Role names are **case-sensitive**. Always use lowercase (`"viewer"`, not `"Viewer"`).

### Hierarchy Check Logic

```javascript
function hasRole(userRole, requiredRole) {
  const roleIndex = {
    viewer: 0,
    contributor: 1,
    admin: 2
  };
  
  return roleIndex[userRole] >= roleIndex[requiredRole];
}

// Examples:
hasRole('admin', 'viewer')       // true (admin > viewer)
hasRole('contributor', 'admin')  // false
hasRole('contributor', 'contributor') // true
```

**Why Hierarchy**:
- Simplifies checks: "Can this user do X?" → "Does their role meet the minimum?"
- Admins automatically get contributor privileges without explicit checks
- Future-proof: Can add intermediate roles (e.g., `moderator` between contributor and admin)

---

## Backend Implementation

### 1. Middleware Layer

**Location**: `backend/middleware/admin.js`

#### requireAdmin Middleware
```javascript
const requireAdmin = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ 
        message: "No token provided" 
      });
    }

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    // Fetch user from Firestore
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ 
        message: "User not found" 
      });
    }

    const userData = userDoc.data();
    
    // Check if user has admin role
    if (!hasRole(userData.role, 'admin')) {
      return res.status(403).json({ 
        message: "Admin access required" 
      });
    }

    // Attach user to request for downstream use
    req.user = { uid, ...userData };
    next();
  } catch (error) {
    return res.status(401).json({ 
      message: "Invalid token",
      error: error.message 
    });
  }
};
```

#### requireContributor Middleware
```javascript
const requireContributor = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ 
        message: "No token provided" 
      });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ 
        message: "User not found" 
      });
    }

    const userData = userDoc.data();
    
    // Check if user has contributor or higher
    if (!hasRole(userData.role, 'contributor')) {
      return res.status(403).json({ 
        message: "Contributor access required" 
      });
    }

    req.user = { uid: decodedToken.uid, ...userData };
    next();
  } catch (error) {
    return res.status(401).json({ 
      message: "Invalid token",
      error: error.message 
    });
  }
};

module.exports = { requireAdmin, requireContributor, hasRole, VALID_ROLES };
```

### 2. Route Protection

#### Projects - Require Contributor

**Location**: `backend/routes/projects.write.js`

```javascript
const { requireContributor } = require('../middleware/admin');

// Create project - contributors and admins only
router.post('/projects', requireContributor, async (req, res) => {
  try {
    const { title, description, techStack } = req.body;
    
    // req.user populated by middleware
    const newProject = {
      authorUid: req.user.uid,
      authorName: req.user.name,
      title,
      description,
      techStack,
      status: 'pending', // Awaits admin approval
      createdAt: new Date().toISOString()
    };
    
    const docRef = await db.collection('projects').add(newProject);
    res.status(201).json({ 
      success: true, 
      projectId: docRef.id 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### Users - Admin Only

**Location**: `backend/routes/users.routes.js`

```javascript
const { requireAdmin, VALID_ROLES } = require('../middleware/admin');

// Update user role - admins only
router.patch('/users/:uid', requireAdmin, async (req, res) => {
  try {
    const { uid } = req.params;
    const { role } = req.body;
    
    // Validate role
    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ 
        error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` 
      });
    }
    
    // Prevent admin from demoting themselves
    if (uid === req.user.uid && role !== 'admin') {
      return res.status(400).json({ 
        error: "Cannot change your own admin role" 
      });
    }
    
    await db.collection('users').doc(uid).update({ 
      role,
      updatedAt: new Date().toISOString()
    });
    
    res.json({ success: true, message: "Role updated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 3. Default Role Assignment

**Location**: `backend/routes/auth.routes.js`

```javascript
// POST /auth/verify - Used during login/signup
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    const userRef = db.collection('users').doc(decodedToken.uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      // New user - create with default role
      const newUser = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || decodedToken.email.split('@')[0],
        role: 'viewer', // ← Default role
        createdAt: new Date().toISOString()
      };
      
      await userRef.set(newUser);
      return res.json({ success: true, user: newUser });
    }
    
    // Existing user - return data
    res.json({ success: true, user: userDoc.data() });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});
```

---

## Frontend Implementation

### 1. Auth Store (Zustand)

**Location**: `frontend/src/store/authStore.js`

#### Role Helper Functions
```javascript
export const VALID_ROLES = ["viewer", "contributor", "admin"];
export const DEFAULT_ROLE = "viewer";

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  loading: true,

  // Check if user can create projects
  canCreateProjects: () => {
    const user = get().user;
    if (!user) return false;
    
    const roleIndex = {
      viewer: 0,
      contributor: 1,
      admin: 2
    };
    
    return roleIndex[user.role] >= roleIndex['contributor'];
  },

  // Check if user is admin
  isAdmin: () => {
    const user = get().user;
    return user?.role === 'admin';
  },

  // ... other methods
}));
```

#### Login Flow with Role Sync

```javascript
const loginWithGoogle = async () => {
  set({ loading: true });
  
  try {
    // 1. Sign in with Firebase
    const result = await signInWithPopup(auth, googleProvider);
    const token = await result.user.getIdToken();
    
    // 2. Sync to backend (creates user if doesn't exist)
    const response = await axios.post(
      `${API_URL}/auth/verify`,
      { token },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    const userData = response.data.user;
    
    // 3. Update local state
    set({ 
      user: userData,
      token: token,
      loading: false 
    });
    
    return { success: true, user: userData };
  } catch (error) {
    set({ loading: false });
    return { success: false, error: error.message };
  }
};
```

> [!note]
> **Critical**: The `/auth/verify` endpoint creates new users with `viewer` role. This is why new signups work correctly.

### 2. Protected Routes

**Location**: `frontend/src/components/ProtectedRoute.jsx`

```javascript
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const ProtectedRoute = ({ 
  children, 
  adminOnly = false,
  contributorOnly = false 
}) => {
  const { user, loading } = useAuthStore();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admin-only routes
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Contributor-only routes (includes admins)
  if (contributorOnly) {
    const canCreate = useAuthStore.getState().canCreateProjects();
    if (!canCreate) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
```

#### Usage in App Router

**Location**: `frontend/src/App.jsx`

```javascript
<Routes>
  {/* Public routes */}
  <Route path="/" element={<HomePage />} />
  <Route path="/login" element={<LoginPage />} />
  <Route path="/search" element={<SearchPage />} />
  
  {/* Contributor routes */}
  <Route 
    path="/submit" 
    element={
      <ProtectedRoute contributorOnly>
        <SubmitProjectPage />
      </ProtectedRoute>
    } 
  />
  
  {/* Admin routes */}
  <Route 
    path="/admin/*" 
    element={
      <ProtectedRoute adminOnly>
        <AdminLayout />
      </ProtectedRoute>
    } 
  />
</Routes>
```

### 3. Navbar Role Display

**Location**: `frontend/src/components/layout/Navbar.jsx`

#### Role Badge Component
```javascript
const getRoleBadgeColor = (role) => {
  switch(role) {
    case 'admin': return 'bg-purple-100 text-purple-800';
    case 'contributor': return 'bg-blue-100 text-blue-800';
    case 'viewer': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// In navbar render
{user && (
  <div className="flex items-center gap-3">
    <span className={`px-2 py-1 rounded text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
      {user.role}
    </span>
    
    {canCreateProjects() && (
      <Link 
        to="/submit" 
        className="btn btn-primary"
      >
        Submit Project
      </Link>
    )}
  </div>
)}
```

#### Conditional Navigation
```javascript
const { user, canCreateProjects, isAdmin } = useAuthStore();

return (
  <nav>
    {/* Always visible */}
    <Link to="/">Home</Link>
    <Link to="/search">Search</Link>
    
    {/* Contributors and admins only */}
    {canCreateProjects() && (
      <Link to="/submit">Submit Project</Link>
    )}
    
    {/* Admins only */}
    {isAdmin() && (
      <Link to="/admin">Admin Panel</Link>
    )}
  </nav>
);
```

### 4. Admin Role Management UI

**Location**: `frontend/src/pages/AdminMembersPage.jsx`

#### Role Dropdown Configuration
```javascript
const ROLE_STYLES = {
  viewer: {
    color: 'text-gray-600',
    bg: 'bg-gray-100',
    icon: '👀',
    label: 'Viewer',
    description: 'Can only view projects'
  },
  contributor: {
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    icon: '✍️',
    label: 'Contributor',
    description: 'Can create and edit projects'
  },
  admin: {
    color: 'text-purple-600',
    bg: 'bg-purple-100',
    icon: '👑',
    label: 'Admin',
    description: 'Full access to all features'
  }
};
```

#### Role Update Mutation
```javascript
const updateRoleMutation = useMutation({
  mutationFn: async ({ uid, role }) => {
    return api.patch(
      `/users/${uid}`,
      { role },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },
  onSuccess: () => {
    queryClient.invalidateQueries(['admin-users']);
    toast.success('Role updated successfully');
  },
  onError: (error) => {
    toast.error(error.response?.data?.error || 'Failed to update role');
  }
});
```

#### Role Dropdown UI
```javascript
<Select
  value={selectedRole}
  onValueChange={(role) => {
    setSelectedRole(role);
    updateRoleMutation.mutate({ uid: user.uid, role });
  }}
>
  <SelectTrigger>
    <SelectValue />
  </SelectTrigger>
  
  <SelectContent>
    {VALID_ROLES.map(role => (
      <SelectItem key={role} value={role}>
        <div className="flex items-center gap-2">
          <span>{ROLE_STYLES[role].icon}</span>
          <div>
            <div className="font-semibold">{ROLE_STYLES[role].label}</div>
            <div className="text-xs text-gray-500">
              {ROLE_STYLES[role].description}
            </div>
          </div>
        </div>
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

---

## Migration from 2-Role System

### Data Migration (Automatic)

**Problem**: Existing users have `role: "member"`  
**Solution**: Backend treats `"member"` as `"contributor"`

#### Backward Compatibility Check
```javascript
// In middleware/admin.js
function normalizeRole(role) {
  // Legacy support
  if (role === 'member') return 'contributor';
  return role;
}

const hasRole = (userRole, requiredRole) => {
  const normalized = normalizeRole(userRole);
  const roleIndex = { viewer: 0, contributor: 1, admin: 2 };
  return roleIndex[normalized] >= roleIndex[requiredRole];
};
```

#### Migration Script (Optional)
```javascript
// scripts/migrate-roles.js
const admin = require('firebase-admin');
const db = admin.firestore();

async function migrateRoles() {
  const usersRef = db.collection('users');
  const snapshot = await usersRef.where('role', '==', 'member').get();
  
  const batch = db.batch();
  snapshot.forEach(doc => {
    batch.update(doc.ref, { role: 'contributor' });
  });
  
  await batch.commit();
  console.log(`Migrated ${snapshot.size} users from 'member' to 'contributor'`);
}

migrateRoles();
```

### UI Migration

**Before**: Toggle button (Admin ↔ Member)  
**After**: Dropdown (Admin | Contributor | Viewer)

**Change**: `frontend/src/pages/AdminMembersPage.jsx`
```diff
- <ToggleButton
-   active={user.role === 'admin'}
-   onChange={() => toggleRole(user.uid)}
- />

+ <Select
+   value={user.role}
+   onValueChange={(role) => updateRole(user.uid, role)}
+ >
+   <SelectItem value="viewer">Viewer</SelectItem>
+   <SelectItem value="contributor">Contributor</SelectItem>
+   <SelectItem value="admin">Admin</SelectItem>
+ </Select>
```

---

## Testing & Verification

### Manual Test Cases

#### Test 1: New User Defaults to Viewer
```bash
# Steps:
1. Sign out of application
2. Sign in with new Google account
3. Check user object in Redux/Zustand devtools

# Expected:
user.role === "viewer"
canCreateProjects() === false
```

#### Test 2: Viewer Cannot Access Submit Page
```bash
# Steps:
1. Log in as viewer
2. Navigate to /submit

# Expected:
Redirected to "/" (homepage)
```

#### Test 3: Contributor Can Create Projects
```bash
# Steps:
1. Admin changes user role to "contributor"
2. User refreshes page
3. Click "Submit Project" in navbar
4. Fill out project form and submit

# Expected:
- "Submit Project" button visible
- Form submission succeeds
- Project status = "pending"
```

#### Test 4: Admin Can Change Roles
```bash
# Steps:
1. Log in as admin
2. Go to /admin/members
3. Select a user, change role to "contributor"

# Expected:
- Dropdown shows all 3 roles
- Backend responds with { success: true }
- User's role badge updates immediately
```

#### Test 5: Role Hierarchy Works
```bash
# Test middleware:
curl -X POST http://localhost:3000/api/v1/projects \
  -H "Authorization: Bearer <viewer_token>" \
  -d '{ "title": "Test" }'

# Expected: 403 Forbidden

curl -X POST http://localhost:3000/api/v1/projects \
  -H "Authorization: Bearer <contributor_token>" \
  -d '{ "title": "Test" }'

# Expected: 201 Created
```

### Automated Tests (Future)

```javascript
// Example Jest test
describe('Role-Based Access Control', () => {
  it('should deny viewers from creating projects', async () => {
    const viewerToken = await getToken('viewer@test.com');
    
    const response = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ title: 'Test Project' });
    
    expect(response.status).toBe(403);
    expect(response.body.message).toContain('Contributor access required');
  });
  
  it('should allow contributors to create projects', async () => {
    const contributorToken = await getToken('contributor@test.com');
    
    const response = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${contributorToken}`)
      .send({ title: 'Test Project', description: 'Test' });
    
    expect(response.status).toBe(201);
    expect(response.body.projectId).toBeDefined();
  });
});
```

---

## Security Considerations

### Preventing Privilege Escalation

#### 1. Self-Role-Change Prevention
```javascript
// In PATCH /users/:uid
if (uid === req.user.uid && role !== 'admin') {
  return res.status(400).json({ 
    error: "Cannot change your own admin role" 
  });
}
```

**Why**: Prevents admin from accidentally/maliciously demoting themselves.

#### 2. Token-Based Auth (Not Role in JWT)
```javascript
// ❌ DON'T: Store role in JWT
const token = jwt.sign({ uid, role: 'admin' }, SECRET);

// ✅ DO: Fetch role from database
const decodedToken = await admin.auth().verifyIdToken(token);
const userDoc = await db.collection('users').doc(decodedToken.uid).get();
const role = userDoc.data().role; // Fresh from DB
```

**Why**: Tokens are long-lived (1hr+). If admin downgrades a user, old token would still grant high privileges.

#### 3. Backend Enforcement Only
```javascript
// Frontend checks are for UX only
{canCreateProjects() && <Link to="/submit">Submit</Link>}

// Backend MUST re-verify
router.post('/projects', requireContributor, async (req, res) => {
  // Even if frontend bypassed, backend blocks
});
```

**Why**: Frontend code is visible/modifiable. All security checks must happen server-side.

### Rate Limiting by Role

```javascript
// Future: Different rate limits per role
const getRateLimit = (role) => {
  switch(role) {
    case 'admin': return 1000; // requests/hour
    case 'contributor': return 100;
    case 'viewer': return 50;
    default: return 10;
  }
};

router.use((req, res, next) => {
  const limit = getRateLimit(req.user.role);
  // Apply limit...
});
```

### Audit Logging

```javascript
// Log all role changes
await db.collection('audit_logs').add({
  type: 'ROLE_CHANGED',
  changedBy: req.user.uid,
  targetUser: uid,
  oldRole: oldRole,
  newRole: newRole,
  timestamp: new Date().toISOString()
});
```

> [!warning]
> Always log admin actions (role changes, user deletions) for security compliance.

---

## Key Decisions & Trade-offs

### Why 3 Roles Instead of Granular Permissions
- **Alternative**: Attribute-Based Access Control (ABAC) with individual permissions
- **Why Rejected**: Over-engineering for small team/project scale
- **Chosen**: Simple role hierarchy covers 95% of use cases
- **Trade-off**: Less flexible, but drastically simpler to reason about

### Why Hierarchy vs Flag-Based
```javascript
// Flag-based approach (rejected)
user.canCreateProjects = true;
user.canApproveProjects = true;
user.canManageUsers = true;

// Hierarchy approach (chosen)
user.role = 'admin'; // Implicitly has all permissions
```

**Why Hierarchy**: Fewer database fields, easier to explain to users, natural escalation path.

### Why Default to Viewer Not Contributor
- **Alternative**: Default to `contributor` (more permissive)
- **Why Rejected**: Spam risk - anyone can create projects immediately
- **Chosen**: Require admins to manually promote users
- **Trade-off**: Extra friction for legitimate users, but safer default

### Why Store Role in Firestore Not Firebase Auth Custom Claims
- **Alternative**: Use Firebase Auth custom claims
- **Why Rejected**: Harder to query (need to fetch each user individually)
- **Chosen**: Store in Firestore `users/{uid}.role` field
- **Trade-off**: Extra database read on each auth check, but enables easy querying

---

## Open Questions / Future Enhancements

### Potential 4th Role: Moderator
```
viewer < contributor < moderator < admin
```

**Moderator capabilities**:
- Approve/reject projects (but not manage users)
- View analytics
- Moderate comments (future feature)

**When to add**: If admin workload becomes too high.

### Self-Service Role Requests
```javascript
// User clicks "Request Contributor Access"
await db.collection('role_requests').add({
  uid: user.uid,
  requestedRole: 'contributor',
  reason: 'I want to share my projects',
  status: 'pending',
  timestamp: new Date()
});

// Admin approves in dashboard
```

### Time-Limited Roles
```javascript
user.role = 'contributor';
user.roleExpiresAt = '2026-12-31T23:59:59Z';

// Cron job reverts to viewer after expiration
```

**Use case**: Temporary contributors (e.g., guest speakers, short-term members).

---

## Summary

### What Changed
- **Backend**: Added `requireContributor` middleware, updated default role to `viewer`
- **Frontend**: Added role helpers (`canCreateProjects`, `isAdmin`), protected `/submit` route
- **UI**: Role badges in navbar, 3-option dropdowns in admin panel
- **Database**: All new users created with `viewer` role via `/auth/verify` endpoint

### Files Modified
**Backend**:
- `backend/middleware/admin.js` - Role hierarchy logic
- `backend/routes/auth.routes.js` - Default role assignment
- `backend/routes/users.routes.js` - Role validation
- `backend/routes/projects.write.js` - Contributor requirement

**Frontend**:
- `frontend/src/store/authStore.js` - Role helpers
- `frontend/src/components/ProtectedRoute.jsx` - `contributorOnly` prop
- `frontend/src/App.jsx` - Route protection
- `frontend/src/components/layout/Navbar.jsx` - Role badges, conditional nav
- `frontend/src/pages/AdminMembersPage.jsx` - Role dropdown
- `frontend/src/pages/AdminMemberProfilePage.jsx` - Role management UI

### Testing Checklist
- [x] New users default to viewer ✅
- [x] Viewers cannot create projects ✅
- [x] Contributors can create projects ✅
- [x] Admins can change any role ✅
- [x] Admins cannot demote themselves ✅
- [x] Backend enforces role checks ✅
- [x] Frontend shows/hides UI based on role ✅

**Status**: ✅ Complete and production-ready
