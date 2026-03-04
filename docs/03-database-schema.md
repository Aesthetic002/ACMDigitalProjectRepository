# Database Schema (Firestore)

The application uses Google Cloud Firestore, a NoSQL database. Data is stored in **Collections** (like folders) containing **Documents** (like JSON files).

## 1. Collection: `users`
Stores user profiles and roles.
**Document ID**: `uid` (from Firebase Auth)

| Field | Type | Description |
| :--- | :--- | :--- |
| `uid` | String | Unique User ID (Primary Key) |
| `email` | String | User's email address |
| `name` | String | User's full name (from Google or Input) |
| `photoURL` | String | URL to profile picture |
| `role` | String | `'member'` OR `'admin'` |
| `createdAt` | ISO String | When the account was first created |
| `updatedAt` | ISO String | Last update time |
| `bio` | String | (Optional) User biography |
| `githubUrl` | String | (Optional) GitHub profile link |
| `linkedinUrl` | String | (Optional) LinkedIn profile link |
| `skills` | Array | (Optional) List of skills `["React", "Node"]` |

## 2. Collection: `projects`
Stores all project submissions.
**Document ID**: Auto-generated UUID

| Field | Type | Description |
| :--- | :--- | :--- |
| `title` | String | Project Title |
| `description` | String | Short description |
| `content` | String | Full markdown content/details |
| `ownerId` | String | `uid` of the creator |
| `ownerName` | String | Name of the creator (cached) |
| `status` | String | `'pending'` \| `'approved'` \| `'rejected'` |
| `isFeatured` | Boolean | Whether it appears on the "Featured" list |
| `techStack` | Array | List of technologies `["Python", "TensorFlow"]` |
| `repoUrl` | String | Link to GitHub repository |
| `demoUrl` | String | Link to live demo |
| `thumbnail` | String | URL to cover image |
| `viewCount` | Number | Number of times viewed |
| `createdAt` | Timestamp | Creation time |

## 3. Collection: `tags`
Stores available technologies for categorization.
**Document ID**: Auto-generated or Tag Name

| Field | Type | Description |
| :--- | :--- | :--- |
| `name` | String | Tag name (e.g., "Machine Learning") |
| `slug` | String | URL-friendly version (e.g., "machine-learning") |
| `count` | Number | How many projects use this tag |

## Data Relationships
*   **One-to-Many**: One User (`users`) can own many Projects (`projects`).
    *   This is linked by `projects.ownerId`.
