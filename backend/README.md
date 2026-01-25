# ACM Project Archive Platform - Backend

Backend API for the ACM Project Archive Platform. This is a **team project** with multiple backend developers working on different API surfaces.

## 👥 Team Responsibilities

### Your Area (Hemanth - Authentication & Project Writes)
- ✅ Authentication & Authorization middleware
- ✅ User management (CRUD operations)
- ✅ Project write operations (Create, Update, Archive)
- ✅ Access control (Owner, Contributor, Admin roles)
- ✅ Firestore schema definition

### Other Developer's Area (To Be Integrated)
- 🔄 Project READ & Discovery APIs (list, search, filters)
- 🔄 Media & Asset management (uploads, storage)
- 🔄 Tags & Taxonomy management
- 🔄 Admin & Moderation features
- 🔄 Analytics endpoints

## 🏗️ Architecture

- **Framework**: Node.js + Express
- **Authentication**: Firebase Authentication (Admin SDK)
- **Database**: Firebase Firestore (NoSQL)
- **Authorization**: JWT Bearer token-based with middleware
- **Storage**: Firebase Storage (for media - to be implemented)

## 📁 Project Structure

```
backend/
├── routes/
│   ├── auth.routes.js         # Authentication endpoints
│   ├── users.routes.js        # User management endpoints
│   └── projects.write.js      # Project write operations
├── middleware/
│   └── auth.js                # Authentication middleware
├── services/                  # Optional helper services
├── utils/                     # Utility functions
├── firebase.js                # Firebase Admin SDK setup
├── app.js                     # Main application entry point
└── package.json               # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16 or higher
- Firebase project with Authentication and Firestore enabled
- Firebase Admin SDK service account credentials

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Firebase credentials**:
   
   **Option 1**: Using environment variable (Recommended for production)
   ```bash
   export FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"..."}'
   ```

   **Option 2**: Using service account file (Development)
   - Download your Firebase Admin SDK service account JSON from Firebase Console
   - Save it as `serviceAccountKey.json` in the backend directory
   - Add `serviceAccountKey.json` to `.gitignore`

3. **Start the server**:
   
   Development mode (with auto-reload):
   ```bash
   npm run dev
   ```

   Production mode:
   ```bash
   npm start
   ```

The server will start on `http://localhost:3000` (or the port specified in `PORT` environment variable).

## 🔌 API Endpoints

### Authentication

#### Verify Token
```http
POST /api/v1/auth/verify
Authorization: Bearer <firebase-id-token>

Response: { success: true, user: {...} }
```

### User Management

All user endpoints require authentication (`Authorization: Bearer <token>`).

#### Get User by ID
```http
GET /api/v1/users/:userId
Authorization: Bearer <token>

Response: { success: true, user: {...} }
```

#### Update User
```http
PUT /api/v1/users/:userId
Authorization: Bearer <token>
Content-Type: application/json

Body: { name: "...", role: "..." }
Response: { success: true, user: {...} }
```

#### Get All Users
```http
GET /api/v1/users?role=member&limit=50
Authorization: Bearer <token>

Response: { success: true, users: [...], count: number }
```

### Project Management

All project endpoints require authentication (`Authorization: Bearer <token>`).

#### Create Project
```http
POST /api/v1/projects
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "title": "My Project",
  "description": "Project description",
  "techStack": ["React", "Node.js"],
  "contributors": ["uid1", "uid2"],
  "status": "pending"
}

Response: { success: true, project: {...} }
```

**Note**: The `ownerId` is automatically set from the authenticated user's token and cannot be specified in the request body.

#### Update Project
```http
PUT /api/v1/projects/:projectId
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "title": "Updated Title",
  "description": "Updated description",
  "status": "approved"
}

Response: { success: true, project: {...} }
```

**Authorization**: Only the project owner or contributors can update a project.

#### Archive Project (Soft Delete)
```http
DELETE /api/v1/projects/:projectId
Authorization: Bearer <token>

Response: { success: true, message: "Project archived successfully" }
```

**Authorization**: Only the project owner or contributors can archive a project.

## 🔐 Security

- All write operations require Firebase authentication
- Tokens are verified using Firebase Admin SDK
- `ownerId` is always set from authenticated user, never from request body
- Users can only update their own profiles (unless admin)
- Only project owners/contributors can modify projects
- Soft delete for data recovery

## 🗄️ Firestore Schema

### users Collection

```javascript
{
  uid: "firebase-uid",           // Document ID
  email: "user@example.com",
  name: "User Name",
  role: "member" | "admin",
  createdAt: "ISO-8601 timestamp",
  updatedAt: "ISO-8601 timestamp"
}
```

### projects Collection

```javascript
{
  title: "Project Title",
  description: "Project description",
  techStack: ["Tech1", "Tech2"],
  contributors: ["uid1", "uid2"],
  ownerId: "firebase-uid",
  status: "pending" | "approved" | "rejected",
  createdAt: "ISO-8601 timestamp",
  updatedAt: "ISO-8601 timestamp",
  isDeleted: false,
  deletedAt: "ISO-8601 timestamp",  // Only if isDeleted = true
  deletedBy: "firebase-uid"         // Only if isDeleted = true
}
```

## 🧪 Testing with Postman

1. **Get a Firebase ID token**:
   - Use Firebase Authentication to sign in a user
   - Get the ID token from the response
   
2. **Set Authorization header**:
   ```
   Authorization: Bearer <your-firebase-id-token>
   ```

3. **Test endpoints**:
   - Start with `/api/v1/auth/verify` to verify your token
   - Then test user and project endpoints

## 🚫 Out of Scope

This backend implementation does **NOT** include:
- File/media upload functionality
- Search and filtering APIs (read operations)
- Admin moderation features
- Frontend code
- Email notifications

These features are handled by other team members.

## 📝 Error Response Format

All errors follow this consistent format:

```json
{
  "success": false,
  "error": "ErrorType",
  "message": "Human-readable error message"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

## 🔧 Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)
- `FIREBASE_SERVICE_ACCOUNT`: Firebase Admin SDK credentials (JSON string)

## 👥 Responsibilities

**Developer**: Hemanth (Backend)

**Scope**:
- ✅ Authentication & Authorization
- ✅ User Database Management
- ✅ Project Metadata Write Operations
- ✅ Access Control & Security
- ✅ Firestore Schema & Validation
- ✅ Integration-ready APIs

## 📄 License

ISC
