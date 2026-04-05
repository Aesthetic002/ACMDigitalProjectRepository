---
tags: [project, acm, archive, firebase, react]
created: 2026-04-04
status: active
---

# ACM Digital Project Repository

## Table of Contents

- [[#Overview|Overview]]
- [[#Goals|Goals]]
- [[#Architecture|Architecture]]
- [[#Tech Stack|Tech Stack]]
- [[#Key Concepts|Key Concepts]]
- [[#File / Module Breakdown|File / Module Breakdown]]
- [[#Data Flow|Data Flow]]
- [[#Setup & Usage|Setup & Usage]]
- [[#API Endpoints|API Endpoints]]
- [[#Current Status|Current Status]]
- [[#Open Questions|Open Questions]]
- [[#Related Notes|Related Notes]]

---

## Overview

The **ACM Digital Project Repository** is a full-stack web application that serves as a centralized archive and showcase platform for student projects within an ACM (Association for Computing Machinery) student chapter. 

**Problem it solves:**
- Student projects often get lost after completion with no central place to discover them
- New members have no visibility into past work or active contributors
- Admins lack tools to moderate, organize, and track project submissions
- No searchable, filterable database of projects by domain, tech stack, or contributor

**What it does:**
- Allows contributors to submit projects with metadata (title, description, tech stack, domain, contributors, assets)
- Provides a public archive for browsing approved projects
- Enables search and filtering by domain (AI/ML, Web Dev, Cybersecurity, etc.), technology, and status
- Features member profiles showing contributions
- Includes an admin dashboard for moderation, analytics, and user management

---

## Goals

### Primary Goals
| Goal | Success Criteria |
|------|------------------|
| Centralized project archive | All chapter projects discoverable in one place |
| Member recognition | Contributors visible on projects and have profile pages |
| Discoverability | Search + domain/tech filtering returns relevant results <1s |
| Admin moderation | Projects require approval before public visibility |
| Asset management | Support for file uploads (PDFs, images) via Cloudinary |

### Non-Goals
- Real-time collaboration (this is an archive, not a workspace)
- Code hosting (projects link to external GitHub repos)
- Payment processing or premium features
- Mobile native apps (responsive web only)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React + Vite)                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │  Pages   │ │Components│ │ Features │ │  Hooks   │ │  Store   │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘  │
│       └────────────┴────────────┴────────────┴────────────┘        │
│                              │                                       │
│                    axiosInstance (with auth interceptor)             │
└──────────────────────────────┼───────────────────────────────────────┘
                               │ HTTP/REST
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js + Express)                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                      app.js (REST API)                       │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐ │    │
│  │  │  Auth   │ │ Users   │ │Projects │ │ Search  │ │ Admin  │ │    │
│  │  │ Routes  │ │ Routes  │ │ Routes  │ │ Routes  │ │ Routes │ │    │
│  │  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └───┬────┘ │    │
│  └───────┼──────────┼──────────┼──────────┼──────────┼─────────┘    │
│          └──────────┴──────────┴──────────┴──────────┘              │
│                              │                                       │
│                         Middleware                                   │
│              ┌───────────────┼───────────────┐                      │
│              │               │               │                      │
│         verifyToken     requireAdmin   requireContributor            │
└──────────────────────────────┼───────────────────────────────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                    ▼
   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
   │  Firebase   │     │  Firebase   │     │  Cloudinary │
   │    Auth     │     │  Firestore  │     │   (Assets)  │
   └─────────────┘     └─────────────┘     └─────────────┘
```

### Component Responsibilities

| Component | Responsibility |
|-----------|---------------|
| **Frontend** | React SPA handling UI, routing, state management, API calls |
| **app.js** | Main REST API server, route mounting, CORS, error handling |
| **Gateway** | Optional gRPC gateway for microservices architecture |
| **Middleware** | Authentication (Firebase token verification), authorization (role checks) |
| **Firebase Auth** | User authentication, token generation/verification |
| **Firestore** | NoSQL database for users, projects, tags, events |
| **Cloudinary** | Cloud storage for project assets (PDFs, images, documents) |

→ See [[Obsidian-Firebase-Integration]] and [[Obsidian-Backend-Routes]]

---

## Tech Stack

### Frontend

| Component | Technology | Why Chosen |
|-----------|------------|------------|
| Framework | React 19 | Modern hooks, large ecosystem, team familiarity |
| Build Tool | Vite 7 | Fast HMR, ESBuild-based, better DX than CRA |
| Styling | TailwindCSS 4 | Utility-first, rapid prototyping, consistent design system |
| UI Components | shadcn/ui | Accessible, customizable, Radix-based primitives |
| State Management | Zustand | Lightweight, no boilerplate, works with React Query |
| Server State | TanStack Query | Caching, background refetch, optimistic updates |
| Routing | React Router 7 | Industry standard, nested routes, loaders |
| Forms | React Hook Form + Zod | Performant forms with schema validation |
| Animations | Framer Motion + anime.js | Declarative animations, complex sequences |
| Icons | Lucide React | Consistent icon set, tree-shakeable |

### Backend

| Component | Technology | Why Chosen |
|-----------|------------|------------|
| Runtime | Node.js 18+ | JavaScript everywhere, non-blocking I/O |
| Framework | Express 4 | Minimal, flexible, massive middleware ecosystem |
| Database | Firebase Firestore | Serverless, real-time capable, generous free tier |
| Auth | Firebase Auth | Managed auth, social providers, JWT tokens |
| File Storage | Cloudinary | CDN, transformations, generous free tier |
| Validation | Manual + middleware | Simple validation without heavy dependencies |

---

## Key Concepts

### Roles & Permissions

| Role | Permissions |
|------|-------------|
| **viewer** | Browse approved projects, view member profiles, search |
| **contributor** | All viewer permissions + create/edit own projects |
| **admin** | All permissions + approve/reject projects, manage users, view analytics |

### Project Lifecycle

```
┌──────────┐    Submit    ┌─────────┐   Approve   ┌──────────┐
│  Draft   │ ──────────▶  │ Pending │ ──────────▶ │ Approved │
└──────────┘              └─────────┘             └──────────┘
                               │
                               │ Reject
                               ▼
                          ┌──────────┐
                          │ Rejected │
                          └──────────┘
```

### Domains

Projects are categorized into technology domains:
- **AI/ML** - Artificial Intelligence, Machine Learning, Data Science
- **Web Development** - Frontend, Backend, Full-stack web apps
- **App Development** - Mobile apps (iOS, Android, cross-platform)
- **Blockchain** - DApps, smart contracts, Web3
- **Cybersecurity** - Security tools, CTF projects, vulnerability research
- **Cloud Computing** - Infrastructure, DevOps, serverless
- **UI/UX Design** - Design systems, prototypes, user research

### Contributors vs Owners

- **Owner** (`ownerId`): The user who created/submitted the project
- **Contributors** (`contributors[]`): Array of user IDs who worked on the project (includes owner)

---

## File / Module Breakdown

### Frontend Structure

```
frontend/src/
├── api/
│   └── axiosInstance.js      # Axios config with auth interceptor
├── components/
│   ├── ui/                   # shadcn/ui primitives (Button, Card, etc.)
│   ├── Layout.jsx            # Main app layout with nav
│   ├── AdminLayout.jsx       # Admin dashboard layout
│   ├── ProtectedRoute.jsx    # Auth guard component
│   └── common/               # Shared components (Loader, etc.)
├── features/
│   ├── admin/components/     # Admin-specific components
│   └── projects/components/  # Project forms, cards, filters
├── pages/
│   ├── HomePage.jsx          # Landing page
│   ├── ProjectsPage.jsx      # Project archive listing
│   ├── ProjectDetailPage.jsx # Single project view
│   ├── MembersPage.jsx       # Member directory
│   ├── MemberProfilePage.jsx # Public member profile
│   ├── ProfilePage.jsx       # Current user's profile
│   ├── SearchPage.jsx        # Search results
│   ├── Admin*.jsx            # Admin dashboard pages
│   └── Auth pages            # Login, Register
├── services/
│   └── api.js                # API function exports
├── store/
│   └── authStore.js          # Zustand auth state
└── hooks/                    # Custom React hooks
```

### Backend Structure

```
backend/
├── app.js                    # Express server entry point
├── firebase.js               # Firebase Admin SDK init
├── middleware/
│   ├── auth.js               # verifyToken middleware
│   └── admin.js              # requireAdmin, requireContributor
├── routes/
│   ├── auth.routes.js        # /api/v1/auth/*
│   ├── users.routes.js       # /api/v1/users/*
│   ├── projects.read.js      # GET /api/v1/projects/*
│   ├── projects.write.js     # POST/PUT/DELETE projects
│   ├── search.routes.js      # /api/v1/search
│   ├── admin.routes.js       # /api/v1/admin/*
│   ├── assets.routes.js      # /api/v1/assets/*
│   ├── tags.routes.js        # /api/v1/tags/*
│   └── events.routes.js      # /api/v1/events/*
├── services/
│   ├── storage.service.js    # Cloudinary integration
│   └── *-service/            # gRPC microservices (optional)
├── gateway/
│   └── index.js              # gRPC-to-REST gateway (optional)
└── utils/
    └── cloudinary.js         # Cloudinary config
```

→ See [[Obsidian-Frontend-Components]] and [[Obsidian-Backend-Routes]]

---

## Data Flow

### Authentication Flow

```
┌────────┐     1. Login with     ┌──────────────┐
│ Client │ ──────────────────▶   │ Firebase Auth │
└────────┘     email/password    └──────┬───────┘
     │                                   │
     │         2. Returns ID Token       │
     │ ◀─────────────────────────────────┘
     │
     │         3. Store token in Zustand
     │         4. Attach to all API requests
     │
     │         5. API Request + Bearer Token
     ▼
┌────────┐                       ┌────────────┐
│Backend │ ◀──────────────────── │ verifyToken│
└────────┘                       │ middleware │
     │                           └────────────┘
     │         6. Token verified via Firebase Admin SDK
     │         7. req.user = { uid, email, ... }
     ▼
┌─────────────┐
│ Route Handler│
└─────────────┘
```

### Project Submission Flow

```
Contributor              Frontend                Backend                 Firestore
    │                       │                       │                       │
    │  Fill form            │                       │                       │
    │──────────────────────▶│                       │                       │
    │                       │                       │                       │
    │                       │  POST /projects       │                       │
    │                       │  + auth token         │                       │
    │                       │──────────────────────▶│                       │
    │                       │                       │                       │
    │                       │                       │  verifyToken()        │
    │                       │                       │  requireContributor() │
    │                       │                       │                       │
    │                       │                       │  Create project doc   │
    │                       │                       │  status: 'pending'    │
    │                       │                       │──────────────────────▶│
    │                       │                       │                       │
    │                       │  201 Created          │◀──────────────────────│
    │                       │◀──────────────────────│                       │
    │                       │                       │                       │
    │  Success toast        │                       │                       │
    │◀──────────────────────│                       │                       │
```

### Project Listing with Filters

```
User Request: GET /projects?domain=ai&status=approved

┌─────────────┐
│ Firestore   │
│ projects    │──────▶ Fetch all projects (ordered by createdAt DESC)
└─────────────┘
       │
       ▼
┌─────────────────────────────────────────────┐
│           In-Memory Filtering                │
│  ┌─────────────┐  ┌─────────────┐           │
│  │ isDeleted?  │  │ status ==   │           │
│  │ Skip if yes │  │ 'approved'? │           │
│  └─────────────┘  └─────────────┘           │
│  ┌─────────────┐  ┌─────────────┐           │
│  │ domain ==   │  │ Apply limit │           │
│  │ 'ai'?       │  │ + pagination│           │
│  └─────────────┘  └─────────────┘           │
└─────────────────────────────────────────────┘
       │
       ▼
┌─────────────┐
│ JSON Response│
│ { projects } │
└─────────────┘
```

---

## Setup & Usage

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project with Firestore + Auth enabled
- Cloudinary account (for asset uploads)

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Firebase and Cloudinary credentials

# Place Firebase service account key
# Download from Firebase Console > Project Settings > Service Accounts
# Save as serviceAccountKey.json

# Start development server
npm run dev
# Server runs on http://localhost:3000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Set VITE_API_URL=http://localhost:3000

# Start development server
npm run dev
# App runs on http://localhost:5173
```

### Environment Variables

**Backend (.env)**
```env
PORT=3000
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:3000
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
```

---

## API Endpoints

### Public Endpoints (No Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/v1/projects` | List projects (with filters) |
| GET | `/api/v1/projects/:id` | Get project details |
| GET | `/api/v1/search?q=...&type=...` | Search projects/users |
| GET | `/api/v1/tags` | List all tags |
| GET | `/api/v1/domains/stats` | Domain statistics |

### Authenticated Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/users` | any | List all users |
| GET | `/api/v1/users/:uid` | any | Get user profile |
| PUT | `/api/v1/users/:uid` | self/admin | Update user profile |
| POST | `/api/v1/projects` | contributor+ | Create project |
| PUT | `/api/v1/projects/:id` | owner/admin | Update project |
| DELETE | `/api/v1/projects/:id` | owner/admin | Soft-delete project |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/analytics` | Dashboard stats |
| POST | `/api/v1/admin/projects/:id/review` | Approve/reject project |
| POST | `/api/v1/users` | Create user |
| DELETE | `/api/v1/users/:uid` | Delete user |

---

## Current Status

### ✅ Working Features

- [x] User authentication (Firebase Auth)
- [x] Project CRUD operations
- [x] Project approval workflow (pending → approved/rejected)
- [x] Domain-based project filtering
- [x] Contributor display on project pages
- [x] Member directory with profile pages
- [x] Search functionality (projects + users)
- [x] Admin dashboard with analytics
- [x] Asset uploads via Cloudinary
- [x] Responsive UI with dark theme
- [x] Clickable contributor names linking to profiles
- [x] Clickable member cards in member directory
- [x] Projects showing both owned and contributed projects

### 🚧 In Progress

- [ ] Test suite implementation (Jest/Vitest)
- [ ] Next.js migration (frontend-next-migration folder exists)

### 🔮 Planned

- [ ] Email notifications for project approval
- [ ] Project comments/feedback
- [ ] Export functionality (PDF reports)
- [ ] Advanced analytics (charts, trends)

### 🐛 Recently Fixed

- ✅ Domain filtering not working (projects visible in all domains)
- ✅ Contributors not displayed on project detail pages
- ✅ 403 Forbidden errors on /users endpoint (route order issue)
- ✅ Contributor search not working during project creation
- ✅ RangeError: Invalid time value in admin analytics and profile pages
- ✅ Member profiles showing only owned projects instead of all contributions
- ✅ Contributor names not clickable in project team section

---

## Open Questions

> [!WARNING] Decisions Needed
> - Should soft-deleted projects be restorable by admins?
> - What's the maximum file size for asset uploads?
> - Should there be rate limiting on the search endpoint?

> [!NOTE] Technical Debt
> - Date handling inconsistency (some Firestore timestamps, some ISO strings) — partially addressed with safeFormatDate helper
> - Gateway vs direct app.js – which architecture to standardize on?
> - No automated tests currently exist
> - PowerShell 6+ required for CLI but not installed

---

## Related Notes

- [[Obsidian-Firebase-Integration]] — Firebase Auth + Firestore patterns
- [[Obsidian-Backend-Routes]] — API route implementation details
- [[Obsidian-Frontend-Components]] — React component documentation
