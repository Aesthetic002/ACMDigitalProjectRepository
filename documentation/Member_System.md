---
tags: [members, roles, profiles, contributors, domains]
related: ["[[Project_Overview]]", "[[Authentication]]", "[[Database]]", "[[Frontend]]", "[[CRUD_Operations]]"]
created: 2026-04-11
---

# Member System

## Overview

Every registered user is a "member" of the platform. Members have a role (`viewer`, `contributor`, `admin`), a public profile page, and can be listed as contributors on projects. The system supports admin management of members, clickable contributor links throughout the UI, and domain-based activity categorization.

---

## Roles

| Role | Who gets it | What they can do |
|---|---|---|
| `viewer` | All new registrations (default) | Browse projects, view member profiles, comment on projects |
| `contributor` | Assigned by admin | Everything viewer can do + create/edit own projects + upload assets |
| `admin` | Assigned by admin | Full platform control: approve/reject projects, promote users, delete any comment, manage events/tags |

Role is stored in `users/{uid}.role` in Firestore and is authoritative — the frontend reads it from the backend-synced user object in Zustand, not from the Firebase token claims.

---

## Registration & Onboarding

1. User registers via `/register` page (email/password or OAuth)
2. `createUserWithEmailAndPassword` (or popup) → Firebase ID token
3. Frontend calls `POST /api/v1/auth/verify` → Auth Service upserts Firestore user doc with `role: "viewer"`
4. User lands on the platform as a viewer
5. Admin can promote them at `/admin/members/:uid`

---

## Public Profile Page

Route: `/members/:uid`  
Component: `frontend/src/pages/MemberProfilePage.jsx`

Shows:
- Avatar, name, role badge (styled per role with distinct color/icon)
- Email (if available)
- Join date
- Member's projects (both owned and as contributor)

Data fetched via two parallel queries:
```js
const { data: userData } = useQuery(['member', uid], () => usersAPI.getById(uid));
const { data: projectsData } = useQuery(['member-projects', uid], () =>
  projectsAPI.getAll({ user_id: uid })
);
```

### Role Styling

```js
// MemberProfilePage.jsx
const ROLE_STYLES = {
  admin:       { text: "text-amber-500",  icon: ShieldCheck,  label: "Administrator" },
  contributor: { text: "text-green-500",  icon: Edit3,        label: "Contributor" },
  viewer:      { text: "text-acm-blue",   icon: Eye,          label: "Viewer" },
};
```

---

## Contributor Links

Across the platform, any display of a member's name or avatar links to their public profile:

- **ProjectDetailPage** — "Core Contributors" sidebar: each card links to `/members/:uid`
- **ProjectComments** — comment author name/avatar links to `/members/:userId`
- **MembersPage** — directory of all members with cards

This is implemented consistently with `<Link to={'/members/${uid}'}>`.

---

## Members Directory

Route: `/members`  
Component: `frontend/src/pages/MembersPage.jsx`

Displays a searchable/filterable grid of all users fetched via `usersAPI.getAll()`. Each card shows:
- Avatar and name
- Role badge
- Link to public profile

---

## Admin Member Management

Route: `/admin/members` and `/admin/members/:uid`  
Components: `AdminMembersPage.jsx`, `AdminMemberProfilePage.jsx`

Admins can:
- View all users with role/status information
- Promote a user from `viewer` → `contributor` → `admin`
- Demote a user
- Delete a user account

The role change calls:
```js
adminAPI.updateUser(uid, { role: 'contributor' })
// → PUT /api/v1/users/:uid → User Service UpdateUser gRPC
```

---

## Contributor Field on Projects

Projects have a `contributors` field (array of user UIDs). When a project is displayed on `ProjectDetailPage`, the gateway resolves these UIDs into full user objects. This is handled in the gateway by iterating the contributor UIDs and calling `userClient.getUser()` for each.

```json
// Resolved in ProjectDetailPage.jsx via parallel useQuery calls
project.contributorsList = [
  { uid: "uid_alice", name: "Alice", role: "contributor", avatar: "https://..." },
  { uid: "uid_bob",  name: "Bob",   role: "viewer",      avatar: "" }
]
```

---

## Domain Activity

The Domains page (`/domains`) shows which technical domains members are most active in, based on the projects they've contributed to. The `GET /api/v1/domains/stats` endpoint aggregates this in real-time from Firestore.

Nine predefined domains:
- Web Development
- App Development
- AI / ML
- Cybersecurity
- Blockchain
- Cloud Computing
- IoT
- UI/UX Design
- Other

---

## Admin Pre-Add

Route: `/admin/pre-add`  
Component: `AdminPreAddPage.jsx`

Allows admins to pre-register members before they have signed up. Creates a user document in Firestore with specified email, name, and role, so that when they first log in via Firebase Auth, the `VerifyIdToken` upsert finds an existing doc and preserves the pre-assigned role.

---

## Related

- [[Project_Overview]]
- [[Authentication]]
- [[Database]]
- [[Frontend]]
- [[CRUD_Operations]]
- [[Comment_System]]
