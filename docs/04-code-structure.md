# Code Structure Guide

This guide explains what the folders and files in this project actually *do*.

## 📂 frontend/
This contains the **React Application** (what users see).

*   **`public/`**: Static assets (images, icons).
*   **`src/`**: The source code.
    *   **`components/`**: Reusable UI blocks.
        *   `Navbar.jsx`: The top navigation bar.
        *   `ProjectCard.jsx`: The tile showing a project summary.
        *   `Layout.jsx`: The wrapper that puts the Navbar on every page.
    *   **`pages/`**: Full screens/routes.
        *   `HomePage.jsx`: Landing page.
        *   `AdminPage.jsx`: Dashboard for admins to approve projects.
        *   `RegisterPage.jsx`: The Sign-up page (Key file for Google Auth).
    *   **`services/`**: Code that talks to the Backend.
        *   `api.js`: The "messenger" that sends data to `localhost:3000`.
    *   **`store/`**: Data that persists while you browse (State Management).
        *   `authStore.js`: Remembers who is logged in (`zustand` library).
    *   **`config/`**: Setup files.
        *   `firebase.js`: Initializes the connection to Google.

## 📂 backend/
This contains the **Express API** (the logic server).

### Key Files
*   **`app.js`**: The main entry point. Sets up Express, Middleware (CORS, JSON), and wires up all routes.
*   **`firebase.js`**: Initializes the connection to Firebase Admin SDK and Firestore.
*   **`make-admin.js`**: Utility script to manually promote a user to 'admin' role via command line.

### 📂 middleware/
Security checkpoints that run before requests reach the routes.
*   **`auth.js`** (`verifyToken`): Checks the `Authorization: Bearer <token>` header. Verifies it against Firebase. Attaches `req.user`.
*   **`admin.js`** (`requireAdmin`): Ensures `req.user` has `role: 'admin'`. Must be used *after* `verifyToken`.

### 📂 routes/
The API Endpoints (URLs).
*   **`auth.routes.js`**: (`/api/v1/auth`) Handles token verification and user creation/syncing.
*   **`users.routes.js`**: (`/api/v1/users`) Get user profiles, update user details.
*   **`projects.write.js`**: (`/api/v1/projects`) Create, Update, Delete (Archive) projects.
*   **`projects.read.js`**: (`/api/v1/projects`) List projects (with filters/pagination) and get single project details.
*   **`search.routes.js`**: (`/api/v1/search`) Full-text search for projects and users.
*   **`assets.routes.js`**: (`/api/v1/assets`) Manage file uploads (signed URLs) and deletions.
*   **`tags.routes.js`**: (`/api/v1/tags`) Manage project tags/taxonomy.
*   **`admin.routes.js`**: (`/api/v1/admin`) Admin-only actions like approving projects, featuring projects, and analytics.
*   **`test.routes.js`**: (`/api/v1/test`) **DEV ONLY**. Helper endpoints to create test users/tokens without frontend.
*   **`diagnose.routes.js`**: (`/api/v1/diagnose`) **DEV ONLY**. Checks Firebase connection health.

### 📂 services/
Business logic separated from routes.
*   **`storage.service.js`**: Handles interactions with Firebase Storage (generating signed URLs, deleting files).

### 📂 utils/
Helper functions.
*   **`tokenGenerator.js`**: Generates fake tokens for testing environments.

## 📂 Root Files
*   **`.env`**: Secrets! (API Keys, Database URLs). Never share this.
*   **`make-admin.js`**: A script we created to manually promote users to Admin.
