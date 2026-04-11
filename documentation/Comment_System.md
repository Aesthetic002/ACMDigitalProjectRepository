---
tags: [comments, discussions, ml-ranking, firestore, rest]
related: ["[[Project_Overview]]", "[[Database]]", "[[API_Reference]]", "[[Authentication]]"]
created: 2026-04-11
---

# Comment System

## Overview

The comment system powers the **"Discussions"** section at the bottom of every project detail page. It is implemented as a standalone Express router (`backend/gateway/routes/comments.routes.js`) mounted directly in the API Gateway at `/api/v1/comments`. Unlike the project/user system, comments bypass gRPC entirely and read/write to Firestore directly through the Firebase Admin SDK.

---

## Data Model

Comments live in a top-level Firestore collection: `comments`.

```
comments/{commentId}
├── id: string                  (same as document ID)
├── projectId: string           (reference to projects/{id})
├── userId: string              (reference to users/{uid})
├── authorName: string          (denormalized from users.name at write time)
├── authorAvatar: string        (denormalized from users.avatar at write time)
├── text: string                (1–5000 characters)
├── likes: number               (total like count)
├── likedBy: string[]           (array of user UIDs who liked)
├── timestamp: string           (ISO 8601, e.g. "2026-04-11T10:30:00.000Z")
├── edited: boolean
└── editedAt: string | null     (ISO 8601 or null)
```

The `projects/{id}` document also maintains a **denormalized** `commentCount` field that is incremented/decremented atomically on comment create/delete.

---

## Architecture

```mermaid
flowchart TD
    Browser -->|POST /api/v1/comments| GW[API Gateway]
    GW --> VT[verifyToken middleware]
    VT --> VA[viewerAuth middleware]
    VA -->|fetch users/{uid}| FS[(Firestore)]
    VA --> CR[Comments Router]
    CR -->|write| FS
    CR -->|update commentCount| FS

    Browser -->|GET /api/v1/comments/project/:id/sorted| GW
    GW --> CR2[Comments Router\n(no auth required)]
    CR2 -->|query comments| FS
    CR2 -->|in-memory sort| ML[ML Scoring / Sort]
    ML -->|response| Browser
```

---

## viewerAuth Middleware

Before any write operation (create/like/edit/delete), the gateway fetches the acting user's Firestore document to populate `req.userData`:

```js
const viewerAuth = async (req, res, next) => {
  const userRef = db.collection("users").doc(req.user.uid);
  const userDoc = await userRef.get();
  req.userData = userDoc.exists
    ? userDoc.data()
    : { name: req.user.email?.split('@')[0] || "Anonymous", avatar: "" };
  next();
};
```

This replaces the `canComment` permission check from the original reference implementation — **any authenticated user can comment**.

---

## API Endpoints

### Create Comment
```
POST /api/v1/comments
Auth: Required (verifyToken + viewerAuth)
```
**Request body:**
```json
{
  "projectId": "Hu98oxMtBWjvKv3YtEZW",
  "text": "This is a really interesting approach to the problem!"
}
```
**Response `201`:**
```json
{
  "success": true,
  "comment": {
    "id": "auto-generated",
    "projectId": "Hu98oxMtBWjvKv3YtEZW",
    "userId": "uid123",
    "authorName": "Hemanth",
    "authorAvatar": "https://...",
    "text": "This is a really interesting approach to the problem!",
    "likes": 0,
    "likedBy": [],
    "timestamp": "2026-04-11T10:30:00.000Z",
    "edited": false,
    "editedAt": null
  }
}
```

### Get Comments (Sorted)
```
GET /api/v1/comments/project/:projectId/sorted
Auth: None (public)
Query params:
  sortBy: "recent" | "oldest" | "likes" | "ml-top"  (default: "recent")
  limit:  1–200                                       (default: 50)
```
**Response `200`:**
```json
{
  "success": true,
  "count": 3,
  "sortBy": "ml-top",
  "comments": [ ...comment objects with optional mlScore field... ]
}
```

### Like / Unlike
```
PUT /api/v1/comments/:commentId/like
Auth: Required
```
Toggles like state. If the UID is already in `likedBy`, removes it and decrements `likes`. Otherwise appends and increments.

**Response `200`:**
```json
{ "success": true, "liked": true, "likes": 5 }
```

### Edit Comment
```
PUT /api/v1/comments/:commentId
Auth: Required (own comment only)
Body: { "text": "Updated text" }
```
Sets `edited: true` and `editedAt` to current ISO timestamp.

### Delete Comment (User)
```
DELETE /api/v1/comments/:commentId
Auth: Required (own comment only)
```
Deletes comment + decrements `projects/{id}.commentCount`.

### Admin Delete
```
DELETE /api/v1/comments/:commentId/admin
Auth: Required (adminOnly via requireAdmin)
```
Same as user delete but no ownership check.

---

## ML-Heuristic Sorting (`sortBy=ml-top`)

When `sortBy=ml-top`, all comments for the project are fetched from Firestore into memory and scored with `calculateMLScores()`. The composite score has four components:

| Component | Weight | Formula |
|---|---|---|
| **Likes** | 40% | `(comment.likes / maxLikes) * 0.4` |
| **Recency** | 30% | `Math.max(0, 1 - daysSince / 180) * 0.3` — decays to 0 at 180 days |
| **Author Reputation** | 20% | `(author avg likes / max avg likes across all authors) * 0.2` |
| **Length Relevance** | 10% | `0.10` if 50–500 chars • `0.05` if 20–1000 chars • `0` otherwise |

```js
const mlScore = likesScore + recencyScore + reputationScore + relevanceScore;
// Range: 0.0 – 1.0
```

Comments with `mlScore` above 0 receive a **"Recommended"** badge in the UI.

> ⚠️ Reputation is computed locally within the current result set only, not from historical data across the entire platform.

---

## Frontend Integration (`ProjectComments.jsx`)

Located at `frontend/src/features/projects/components/ProjectComments.jsx`.

Key behaviours:
- Mounted at the bottom of `ProjectDetailPage` via `<ProjectComments projectId={project.id} />`
- Uses `useQuery(['comments', projectId, sortBy], ...)` — cache invalidated on create/like/edit/delete
- Unauthenticated users see the comment feed but get a prompt instead of the input box
- Authors see **Edit** / **Delete** icons on their own comments (hover-revealed)
- Admins see **Delete** icon on all comments
- Clicking an author's avatar or name navigates to `/members/:userId` via `<Link>`
- `sonner` toasts for success/error feedback

---

## Constraints & Known Limitations

- `likedBy` is an array — race conditions possible if two users like simultaneously (no Firestore transaction)
- `commentCount` on the project document can drift if comments are deleted outside this API
- No real-time updates — comments refresh only when the sort or page is changed (no Firestore `onSnapshot`)

---

## Related

- [[Project_Overview]]
- [[Database]]
- [[API_Reference]]
- [[Authentication]]
- [[Member_System]]
