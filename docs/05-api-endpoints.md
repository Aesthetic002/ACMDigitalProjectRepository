# API Documentation

Base URL: `http://localhost:3000/api/v1`

## Authentication (`/auth`)

### POST `/verify`
Verifies a Firebase ID token and syncs the user to the database.
- **Auth**: `Authorization: Bearer <token>`
- **Response**: `200 OK` - Returns user profile.

---

## Users (`/users`)

### GET `/:userId`
Get public profile of a user.
- **Auth**: Required
- **Response**: `200 OK` - User object.

### PUT `/:userId`
Update user profile.
- **Auth**: Required (Owner or Admin)
- **Body**: `{ name, role, ... }`
- **Response**: `200 OK` - Updated user object.

### GET `/`
List users.
- **Auth**: Required
- **Query**: `role`, `limit`

---

## Projects (`/projects`)

### GET `/`
List projects with pagination and filters.
- **Auth**: Optional
- **Query**: `limit`, `pageToken`, `status`, `techStack`, `ownerId`
- **Response**: `200 OK` - List of projects.

### GET `/:projectId`
Get details of a specific project.
- **Auth**: Optional
- **Response**: `200 OK` - Project object with assets.

### POST `/`
Create a new project.
- **Auth**: Required
- **Body**: `{ title, description, techStack, contributors }`
- **Response**: `201 Created`

### PUT `/:projectId`
Update a project.
- **Auth**: Required (Owner or Contributor)
- **Body**: `{ title, description, status, ... }`
- **Response**: `200 OK`

### DELETE `/:projectId`
Archive (soft-delete) a project.
- **Auth**: Required (Owner or Admin)
- **Response**: `200 OK`

---

## Search (`/search`)

### GET `/`
Search projects and users.
- **Auth**: Optional
- **Query**: `q` (query string), `type` (all/projects/users)
- **Response**: `200 OK` - List of matching results.

---

## Assets (`/assets`)

### POST `/upload-url`
Generate a signed URL for file upload.
- **Auth**: Required
- **Body**: `{ projectId, filename, contentType }`
- **Response**: `201 Created` - Returns `{ uploadUrl, assetId }`.

### GET `/projects/:projectId/assets`
List assets for a project with download URLs.
- **Auth**: Optional
- **Response**: `200 OK` - List of assets.

### DELETE `/:assetId`
Delete an asset.
- **Auth**: Required (Owner/Admin)
- **Query**: `projectId`
- **Response**: `200 OK`

---

## Tags (`/tags`)

### GET `/`
List all tags.
- **Auth**: Optional
- **Query**: `limit`

### POST `/`
Create a new tag.
- **Auth**: Admin Only
- **Body**: `{ name, slug }`

### DELETE `/:tagId`
Delete a tag.
- **Auth**: Admin Only

---

## Admin (`/admin`)

### POST `/projects/:projectId/review`
Approve or reject a project.
- **Auth**: Admin Only
- **Body**: `{ action: 'approve'|'reject' }`

### POST `/projects/:projectId/feature`
Feature or unfeature a project.
- **Auth**: Admin Only
- **Body**: `{ featured: true|false }`

### GET `/analytics`
Get platform stats.
- **Auth**: Admin Only
