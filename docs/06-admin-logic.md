# Admin Logic & Privileges

This document explains how the Admin system works, who can be an admin, and what they can do.

## 👤 Who can be an Admin?
Any registered user whose Firestore user document has the field `role` set to `'admin'`.

*   **Default Role**: When a user signs up, they are assigned `role: 'member'`.
*   **Admin Role**: Gives full control over the platform's content.

## 🚀 How to become an Admin
Since there is no "Sign up as Admin" button for security reasons, you must promote an existing user using a server-side script.

1.  **Sign up** normally in the application.
2.  Open a terminal in the `backend/` directory.
3.  Run the following command:

```bash
node make-admin.js <your-email@example.com>
```

**What this script does:**
1.  Connects to Firebase Admin SDK.
2.  Finds the user's UID by email.
3.  Updates the `users` collection in Firestore, setting `role: 'admin'`.

## 🛡️ Admin Privileges
Admins are protected by the `requireAdmin` middleware. They have the following capabilities:

### 1. Project Moderation
*   **Review Projects**: Approve or reject pending projects (`POST /api/v1/admin/projects/:id/review`).
*   **Feature Projects**: Mark projects as "Featured" to highlight them (`POST /api/v1/admin/projects/:id/feature`).
*   **Archive Projects**: Delete (soft-delete) *any* project, regardless of ownership.

### 2. Tag Management
*   **Create Tags**: Add new technologies/tags to the global list (`POST /api/v1/tags`).
*   **Delete Tags**: Remove tags from the system (`DELETE /api/v1/tags/:id`).

### 3. Content Management
*   **Update Profiles**: Edit any user's profile details (`PUT /api/v1/users/:id`).
*   **Delete Assets**: Delete any file upload from any project (`DELETE /api/v1/assets/:id`).

### 4. Analytics
*   **View Dashboard**: Access platform-wide statistics like total users, project growth, and tech stack popularity (`GET /api/v1/admin/analytics`).

## 💻 Relevant Code
*   **Middleware**: `backend/middleware/admin.js` - Contains the `requireAdmin` function that checks `req.user.role`.
*   **Routes**: `backend/routes/admin.routes.js` - Contains the endpoints for moderation and analytics.
*   **Promotion Script**: `backend/make-admin.js` - The CLI tool for granting admin access.
