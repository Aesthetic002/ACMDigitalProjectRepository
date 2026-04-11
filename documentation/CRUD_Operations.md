---
tags: [api, crud, projects, users, tags, events]
related: ["[[Project_Overview]]", "[[API_Reference]]", "[[Database]]", "[[Microservices]]", "[[Authentication]]"]
created: 2026-04-11
---

# CRUD Operations

## Overview

Full Create/Read/Update/Delete operations exist for four core entities: **Projects**, **Users**, **Tags**, and **Events**. Projects and Users flow through the gRPC microservices. Tags are managed within the Project Service. Events are managed by the Notification Service. All write endpoints require authentication; some require admin role.

---

## Projects

### Create a Project
```
POST /api/v1/projects
Auth: verifyToken required (contributor or admin recommended)
```

**Request body:**
```json
{
  "title": "AI-Driven Network Controller",
  "description": "A DQN-based SDN controller that optimizes packet routing.",
  "tags": ["machine-learning", "networking"],
  "techStack": ["Python", "TensorFlow", "OpenFlow"],
  "contributors": ["uid_alice", "uid_bob"],
  "domain": "AI/ML",
  "githubUrl": "https://github.com/acm/ai-sdn",
  "demoUrl": "https://demo.example.com"
}
```

**Response `201`:**
```json
{
  "success": true,
  "project": {
    "id": "auto-generated-firestore-id",
    "title": "AI-Driven Network Controller",
    "status": "pending",
    "ownerId": "submitter-uid",
    "ownerName": "Hemanth",
    "domain": "AI/ML",
    "tags": ["machine-learning"],
    "techStack": ["Python", "TensorFlow"],
    "contributors": ["uid_alice"],
    "assets": [],
    "isFeatured": false,
    "createdAt": "1712814881000",
    "updatedAt": "1712814881000"
  }
}
```

New projects always receive `status: "pending"` until an admin approves them.

---

### List Projects
```
GET /api/v1/projects
Auth: verifyToken required
Query params:
  limit:      number (default 50)
  offset:     number (default 0)
  status:     "pending" | "approved" | "rejected"
  domain:     "AI/ML" | "Web" | "App" | etc.
  owner_id:   string (filter by owner)
  user_id:    string (filter by contributor membership)
  tag_ids:    comma-separated tag IDs
```

**Response `200`:**
```json
{
  "success": true,
  "projects": [...],
  "total": 42,
  "count": 10
}
```

---

### Get Single Project
```
GET /api/v1/projects/:projectId
Auth: verifyToken required
```

Returns the full project document including `assets[]` and `contributorsList[]` (resolved from UIDs in the gateway).

---

### Update Project
```
PUT /api/v1/projects/:projectId
Auth: verifyToken required (owner or admin)
```

**Request body (all fields optional):**
```json
{
  "title": "Updated Title",
  "description": "...",
  "tags": [...],
  "techStack": [...],
  "contributors": [...],
  "domain": "Cloud",
  "status": "approved"   // admin-only field
}
```

> Only admins can change `status`. The gateway does not enforce this at the REST layer — it is expected that only admin-facing UI surfaces the status field.

---

### Delete Project
```
DELETE /api/v1/projects/:projectId
Auth: verifyToken required (owner or admin)
```

Performs a **soft delete** — sets `is_deleted: true` on the Firestore document. Deleted projects are excluded from list queries.

---

### Admin Project Review
```
POST /api/v1/admin/projects/:projectId/review
Auth: verifyToken + requireAdmin
Body: { "action": "approve" | "reject" | "pending" }
```

Changes the project `status` field and updates `updatedAt`.

---

## Users

### Get User by ID
```
GET /api/v1/users/:userId
Auth: None (public — used for public member profiles)
```

### List Users
```
GET /api/v1/users
Auth: verifyToken required
Query: limit, offset, role
```

### Create User (Admin)
```
POST /api/v1/users
Auth: verifyToken + requireAdmin
Body: { uid, email, name, role, avatar }
```

### Update User
```
PUT /api/v1/users/:userId
Auth: verifyToken (own profile, or admin to change role)
Body: { name, avatar, role }
```

### Delete User
```
DELETE /api/v1/users/:userId
Auth: verifyToken + requireAdmin
```

---

## Tags

Tags are string labels applied to projects. They have their own collection managed by the Project Service.

### List All Tags
```
GET /api/v1/tags
Auth: None
```

### Create Tag (Admin)
```
POST /api/v1/tags
Auth: verifyToken + requireAdmin
Body: { "name": "blockchain", "slug": "blockchain" }
```

### Update Tag
```
PUT /api/v1/tags/:tagId
Auth: verifyToken + requireAdmin
Body: { "name": "Blockchain", "slug": "blockchain" }
```

### Delete Tag
```
DELETE /api/v1/tags/:tagId
Auth: verifyToken + requireAdmin
```

---

## Events

Events are announcements (hackathons, workshops, etc.) managed by the Notification Service.

### List Events
```
GET /api/v1/events
Auth: None
```

### Get Event
```
GET /api/v1/events/:eventId
Auth: None
```

### Create Event (Admin)
```
POST /api/v1/events
Auth: verifyToken + requireAdmin
Body:
{
  "title": "ACM Hackathon 2026",
  "description": "24-hour coding competition",
  "startDate": 1717977600000,
  "endDate": 1718064000000,
  "type": "hackathon"
}
```

### Update / Delete Event
```
PUT  /api/v1/events/:eventId   (admin)
DELETE /api/v1/events/:eventId (admin)
```

---

## Validation Rules

| Entity | Field | Constraint |
|---|---|---|
| Project | `title` | Required, string |
| Project | `description` | Required, string |
| Project | `domain` | One of 9 predefined domains or "Other" |
| Comment | `text` | 1–5000 characters |
| User | `role` | Must be `viewer`, `contributor`, or `admin` |
| Tag | `slug` | Lowercase, URL-safe string |

---

## Error Response Shape

All endpoints return consistent error responses:
```json
{
  "success": false,
  "error": "NotFound",
  "message": "Project not found"
}
```

HTTP status codes follow standard conventions: 400 bad request, 401 unauthorized, 403 forbidden, 404 not found, 500 internal.

---

## Related

- [[Project_Overview]]
- [[API_Reference]]
- [[Database]]
- [[Microservices]]
- [[Authentication]]
