---
tags: [frontend, react, routing, state-management, vite]
related: ["[[Project_Overview]]", "[[Authentication]]", "[[API_Reference]]", "[[Member_System]]"]
created: 2026-04-11
---

# Frontend

## Overview

The frontend is a **React 18 SPA** built with **Vite**. It uses **React Router v6** for client-side routing, **TanStack Query** for server state, **Zustand** for global auth state, and **shadcn/ui + Tailwind CSS** for the design system. All pages are protected by route guards except `/`, `/login`, and `/register`.

---

## Entry Point

```
frontend/src/
├── main.jsx           # ReactDOM.createRoot + App mount
├── App.jsx            # QueryClientProvider + ThemeProvider + Routes
├── index.css          # Global CSS variables, Tailwind base
├── api/
│   └── axiosInstance.js   # Configured Axios with auth interceptors
├── config/
│   └── firebase.js        # Firebase client SDK initialization
├── services/
│   └── api.js             # All API method groups (projectsAPI, authAPI, etc.)
├── store/
│   └── authStore.js       # Zustand auth store (persisted)
├── pages/             # Full-page route components
├── components/        # Shared/layout components
├── features/          # Feature-scoped components
├── hooks/             # Custom hooks (useTheme)
└── data/              # Static data (domain lists, etc.)
```

---

## Routing Structure

All routes are defined in `App.jsx`. Protected routes are wrapped with `<ProtectedRoute>`. Admin routes use `<ProtectedRoute adminOnly>`.

```jsx
// App.jsx — simplified route tree
<Routes>
  <Route path="/"                  element={<HomePage />} />
  <Route path="/login"             element={<LoginPage />} />
  <Route path="/register"          element={<RegisterPage />} />

  {/* Viewer-accessible protected routes */}
  <Route path="/projects"          element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
  <Route path="/projects/:id"      element={<ProtectedRoute><ProjectDetailPage /></ProtectedRoute>} />
  <Route path="/projects/:id/edit" element={<ProtectedRoute><EditProjectPage /></ProtectedRoute>} />
  <Route path="/members"           element={<ProtectedRoute><MembersPage /></ProtectedRoute>} />
  <Route path="/members/:uid"      element={<ProtectedRoute><MemberProfilePage /></ProtectedRoute>} />
  <Route path="/domains"           element={<ProtectedRoute><DomainsPage /></ProtectedRoute>} />
  <Route path="/search"            element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
  <Route path="/profile"           element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

  {/* Contributor-only */}
  <Route path="/submit"            element={<ProtectedRoute contributorOnly><CreateProjectPage /></ProtectedRoute>} />

  {/* Admin nested routes */}
  <Route path="/admin"             element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
    <Route index                   element={<AdminPage />} />
    <Route path="members"          element={<AdminMembersPage />} />
    <Route path="members/:uid"     element={<AdminMemberProfilePage />} />
    <Route path="projects"         element={<AdminProjectsPage />} />
    <Route path="projects/:id"     element={<AdminProjectDetailPage />} />
    <Route path="moderation"       element={<AdminModerationPage />} />
    <Route path="pre-add"          element={<AdminPreAddPage />} />
    <Route path="events/new"       element={<CreateEventPage />} />
    <Route path="domains"          element={<AdminDomainsPage />} />
  </Route>
</Routes>
```

### ProtectedRoute Logic

```jsx
// components/ProtectedRoute.jsx
// - If !isAuthenticated → redirect to /login?from=<current path>
// - If adminOnly && role !== 'admin' → redirect to /
// - If contributorOnly && role not in ['contributor','admin'] → redirect to /
```

---

## State Management

### Auth State — Zustand (`authStore.js`)

Single global store, persisted to `localStorage` under key `auth-storage`.

| Field | Type | Description |
|---|---|---|
| `user` | `object \| null` | Full user object from backend + Firebase |
| `token` | `string \| null` | Firebase ID token |
| `isAuthenticated` | `boolean` | True when user + token are present |
| `isLoading` | `boolean` | True during auth initialization |

Key actions:
- `initAuth()` — sets up `onAuthStateChanged` Firebase listener; calls `/auth/verify` to sync backend user
- `login(email, password)` — Firebase `signInWithEmailAndPassword` + backend sync
- `loginWithGoogle()` — Firebase popup OAuth + backend sync
- `loginWithGithub()` — Firebase popup OAuth + backend sync
- `logout()` — Firebase `signOut` + clear store
- `refreshToken()` — calls `auth.currentUser.getIdToken(true)` for expired tokens

### Server State — TanStack Query

`QueryClient` is configured with:
```js
{ staleTime: 1000 * 60 * 5, retry: 1 }
```
All data-fetching hooks use `useQuery` with keys like `['projects', filters]`, `['comments', projectId, sortBy]`, `['member', uid]`.

---

## Key Pages

| Route | Component | Description |
|---|---|---|
| `/` | `HomePage.jsx` | Landing page with `BigBangAnimation` on first load |
| `/projects` | `ProjectsPage.jsx` | Paginated filterable project archive |
| `/projects/:id` | `ProjectDetailPage.jsx` | Full project view + contributors + `<ProjectComments>` |
| `/search` | `SearchPage.jsx` | Debounced search with autocomplete suggestions + filters |
| `/members` | `MembersPage.jsx` | Browsable member directory |
| `/members/:uid` | `MemberProfilePage.jsx` | Public contributor profile with linked projects |
| `/domains` | `DomainsPage.jsx` | Domain breakdown visualization |
| `/profile` | `ProfilePage.jsx` | Authenticated user's own profile + edit |
| `/submit` | `CreateProjectPage.jsx` | Project submission form (contributor+ only) |
| `/admin/*` | `AdminLayout.jsx` nested | Admin dashboard with sub-routes |

---

## Component Hierarchy

```
App
├── ThemeProvider
├── QueryClientProvider
├── AuthInitializer (sets up Firebase listener on mount)
├── BigBangAnimation (one-time intro, fades out)
└── BrowserRouter
    ├── Navbar
    ├── [Page Component]
    │   └── Layout (wraps in consistent padding/nav)
    │       └── [Feature Components]
    │           ├── ProjectCard
    │           ├── ProjectComments
    │           ├── DomainDistribution
    │           └── ...
    └── Toaster (sonner toast notifications)
```

---

## Axios Configuration

`api/axiosInstance.js` creates an Axios instance with:
- `baseURL`: `${VITE_API_URL}/api/v1` (defaults to `http://localhost:3000/api/v1`)
- Request interceptor: reads `token` from Zustand store and sets `Authorization: Bearer <token>`
- Response interceptor: on **401**, calls `logout(false)` to silently clear stale auth state

---

## Animation & Design

- **BigBangAnimation**: Canvas-based particle explosion shown once on app load; fades out by calling `onComplete()` after ~2.5s
- **Theme**: Dark-first design using CSS custom properties; `ThemeToggle` component switches between dark/light
- **Design system**: `index.css` defines CSS variables for the `acm-blue` brand color, glassmorphism utilities, and `shadow-acm-glow`

---

## Feature Modules (`src/features/`)

| Feature | Components |
|---|---|
| `features/projects/` | `DomainDistribution.jsx`, `ProjectComments.jsx`, `ProjectForm.jsx` |
| `features/admin/` | Admin-specific sub-components |
| `features/events/` | Event listing/form components |

---

## Related

- [[Project_Overview]]
- [[Authentication]]
- [[API_Reference]]
- [[Comment_System]]
- [[Member_System]]
- [[Search_System]]
