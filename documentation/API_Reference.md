---
tags: [api, endpoints, rest, reference]
related: ["[[Project_Overview]]", "[[Authentication]]", "[[CRUD_Operations]]", "[[Comment_System]]", "[[Media_Upload]]"]
created: 2026-04-11
---

# API Reference

## Overview

All REST endpoints are exposed by the **API Gateway** at port `3000` under the base path `/api/v1`. The frontend Axios instance is pre-configured with `baseURL: http://localhost:3000/api/v1`.

**Auth header format:** `Authorization: Bearer <Firebase ID Token>`

---

## Authentication Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/verify` | Bearer token | Verify token, upsert user doc, return full profile |

**POST /auth/verify response:**
```json
{
  "success": true,
  "user": {
    "uid": "string",
    "email": "string",
    "name": "string",
    "role": "viewer | contributor | admin",
    "avatar": "string",
    "emailVerified": true,
    "createdAt": "ms-epoch-string",
    "updatedAt": "ms-epoch-string"
  }
}
```

---

## User Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/users/:userId` | None | Get user by UID |
| `GET` | `/users` | Bearer | List users (limit, offset, role) |
| `POST` | `/users` | Admin | Create user |
| `PUT` | `/users/:userId` | Bearer | Update user (own or admin) |
| `DELETE` | `/users/:userId` | Admin | Delete user |

---

## Project Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/projects` | Bearer | List projects (filterable) |
| `GET` | `/projects/:id` | Bearer | Get single project |
| `POST` | `/projects` | Bearer | Create project |
| `PUT` | `/projects/:id` | Bearer | Update project |
| `DELETE` | `/projects/:id` | Bearer | Soft-delete project |
| `GET` | `/projects/:id/assets` | Bearer | List project assets |
| `POST` | `/projects/:id/assets` | Bearer | Upload asset (multipart) |
| `DELETE` | `/projects/:id/assets/:assetId` | Bearer | Remove specific asset |

### GET `/projects` Query Parameters

| Param | Type | Description |
|---|---|---|
| `limit` | number | Results per page (default 50) |
| `offset` | number | Skip N results |
| `status` | string | `pending`, `approved`, `rejected` |
| `domain` | string | Domain filter |
| `owner_id` | string | Filter by owner UID |
| `user_id` | string | Filter by contributor UID |
| `tag_ids` | string | Comma-separated tag IDs |

---

## Tag Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/tags` | None | List all tags |
| `POST` | `/tags` | Admin | Create tag |
| `PUT` | `/tags/:tagId` | Admin | Update tag |
| `DELETE` | `/tags/:tagId` | Admin | Delete tag |

---

## Comment Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/comments` | Bearer | Create comment |
| `GET` | `/comments/project/:id` | None | Get comments (chronological) |
| `GET` | `/comments/project/:id/sorted` | None | Get sorted comments (ML/likes/recent/oldest) |
| `PUT` | `/comments/:commentId/like` | Bearer | Toggle like |
| `PUT` | `/comments/:commentId` | Bearer | Edit own comment |
| `DELETE` | `/comments/:commentId` | Bearer | Delete own comment |
| `DELETE` | `/comments/:commentId/admin` | Admin | Admin delete any comment |

### GET `/comments/project/:id/sorted` Query Parameters

| Param | Values | Default |
|---|---|---|
| `sortBy` | `ml-top`, `recent`, `oldest`, `likes` | `recent` |
| `limit` | 1–200 | `50` |

---

## Asset Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/assets/upload` | Bearer | Direct asset upload (multipart) |
| `POST` | `/assets/upload-url` | Bearer | Get Cloudinary signed upload URL |
| `DELETE` | `/assets/:assetId` | Bearer | Delete asset |

---

## Event Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/events` | None | List all events |
| `GET` | `/events/:id` | None | Get single event |
| `POST` | `/events` | Admin | Create event |
| `PUT` | `/events/:id` | Admin | Update event |
| `DELETE` | `/events/:id` | Admin | Delete event |

---

## Admin Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/admin/analytics` | Admin | Platform-wide analytics |
| `POST` | `/admin/projects/:id/review` | Admin | Approve/reject/reset project |

### POST `/admin/projects/:id/review` body:
```json
{ "action": "approve" | "reject" | "pending" }
```

---

## Search Endpoint

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/search` | Bearer | Search projects and users |

### GET `/search` Query Parameters

| Param | Description |
|---|---|
| `q` | Search query string |
| `limit` | Max results |
| `techStack` | Filter by tech (optional) |
| `status` | Filter by status (optional) |

**Response `200`:**
```json
{
  "success": true,
  "results": [
    {
      "id": "...",
      "type": "project",
      "title": "...",
      "description": "...",
      "techStack": ["React"],
      ...
    }
  ],
  "total": 5
}
```

---

## Domains Endpoint

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/domains/stats` | None | Public domain statistics |

**Response `200`:**
```json
{
  "success": true,
  "domains": [
    { "name": "AI/ML", "projectCount": 12, "memberCount": 8 },
    { "name": "Web Development", "projectCount": 24, "memberCount": 15 },
    ...
  ],
  "totalProjects": 42
}
```

---

## Health Check

| Method | Path | Auth | Response |
|---|---|---|---|
| `GET` | `/health` | None | `{ "success": true, "message": "...running", "timestamp": "ISO" }` |

---

## Standard Error Response

```json
{
  "success": false,
  "error": "NotFound | Unauthorized | Forbidden | BadRequest | InternalServerError",
  "message": "Human-readable detail"
}
```

| HTTP Code | Meaning |
|---|---|
| 400 | Bad request / validation failed |
| 401 | Missing or invalid auth token |
| 403 | Authenticated but insufficient role |
| 404 | Resource not found |
| 500 | Internal server error |

---

## Related

- [[Project_Overview]]
- [[Authentication]]
- [[CRUD_Operations]]
- [[Comment_System]]
- [[Media_Upload]]
- [[Search_System]]
