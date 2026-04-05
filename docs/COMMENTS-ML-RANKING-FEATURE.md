# Comments & ML Ranking Feature Integration

This document outlines the recent architectural additions and bug fixes applied to integrate the new **Comments ecosystem** and **Python ML Ranking microservice** into the ACM Digital Project Repository.

---

## 1. New Microservices

### A. Comment Service (Node.js)
- **Location**: `backend/services/comment-service/`
- **Port**: `50056`
- **Purpose**: Handles all database operations for comments in Firebase Firestore.
- **Features**:
  - **Create**: Inserts comments bounded to specific `projectId`s and `userId`s.
  - **Validation**: Enforces a maximum length of 1000 characters and restricts users to a maximum of 5 comments per project.
  - **Read & Delete**: Retrieves comments via project IDs and handles deletion (restricted to the comment author or an `admin`).
  - **Upvote**: Safely increments the `upvotes` counter on individual comments.

### B. Ranking Service (Python 3.9)
- **Location**: `backend/services/ranking-service/`
- **Port**: `50057`
- **Purpose**: A Python-based gRPC server specialized in data sorting. 
- **Features**: 
  - Receives an array of comments and applies a heuristic scoring algorithm (balancing `upvotes` against `recency`).
  - Returns a newly sorted array to the API Gateway. 

---

## 2. API Gateway & gRPC Contracts

### Protobufs 
- **`backend/proto/comment.proto`**: Contract mapping `CreateComment`, `DeleteComment`, `GetProjectComments`, and `UpvoteComment`.
- **`backend/proto/ranking.proto`**: Contract mapping `SortComments`.

### Express REST Endpoints (`backend/gateway/index.js`)
The API Gateway was successfully wired to translate frontend REST requests into the internal gRPC channels:
- `POST /api/v1/projects/:projectId/comments` (Requires Auth)
- `GET /api/v1/projects/:projectId/comments` (Public, accepts `?sort=true` to trigger the Python ML service)
- `POST /api/v1/comments/:commentId/upvote` (Requires Auth)
- `DELETE /api/v1/comments/:commentId` (Requires Auth, restricted permissions)

---

## 3. Frontend Integration

The React frontend was successfully transitioned from isolated "mock-data" memory to the live backend:
- **`frontend/src/services/commentService.js`**: Completely rewritten to replace dummy timeout strings with active `axiosInstance` REST calls. 
- **Data Mapping**: Merged the Firebase Firestore backend schema with the Zustand authenticated user (`displayName`, `photoURL`) to render `CommentCard.jsx` natively.
- **Sorting Logic**: Mapped the frontend "Top" and "Popular" view rules to instantly append the `?sort=true` query, bridging the user interface directly to the Python `<RankingService>`.
- **Auth Fix**: Exported `DEFAULT_ROLE` securely out of `authStore.js` to unblock Rollup/Vite compilation.

---

## 4. Infrastructure & DevOps Fixes

Several orchestration stability issues were permanently resolved to support these extensions cleanly:
- **Missing Dependencies**: Fixed API Gateway startup crashes by appending shared folders (`middleware`, `utils`) to the Gateway's Docker environment and installing missing libs (`multer`, `cloudinary`, `firebase-admin`).
- **Global Module Resolution**: Solved a systemic `MODULE_NOT_FOUND` error cascading across all microservices by injecting `ENV NODE_PATH=/app/services/[name]/node_modules` into every backend Dockerfile. 
- **Frontend Build Upgrade**: Escalated the frontend Docker compilation environment to `node:20-alpine`, fulfilling Vite v7's strict internal build requirements.
- **Unbuffered Logs**: Appended `PYTHONUNBUFFERED=1` to the Python service container to allow real-time terminal output diagnosis.

---

## 5. Testing Suite
- Added `backend/test-comments.js` as an uncoupled runtime API checker. It simulates authentication securely via JWT tooling and rigorously tests Comment Creation, Retrieval, ML ranking sorting, and Deletion cascades.