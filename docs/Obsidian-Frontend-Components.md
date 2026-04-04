---
tags: [project/ACMDigitalRepository, frontend, react, components]
created: 2026-04-04
related: [[Obsidian-ACMDigitalRepository]]
---

# Frontend Components

## What this is

The frontend is a **React 19 + Vite 7** single-page application (SPA) with:
- Component-based architecture
- Zustand for auth state management
- TanStack Query for server state
- React Router 7 for routing
- TailwindCSS + shadcn/ui for styling

This document explains:
- Component organization
- Key pages and features
- State management patterns
- Common utilities and helpers

---

## Why it matters for this project

Proper component architecture enables:
- **Reusability**: Common UI elements (buttons, cards) used everywhere
- **Maintainability**: Clear separation between pages, features, and shared components
- **Type safety**: PropTypes or TypeScript for component contracts
- **Performance**: Code splitting, lazy loading, memoization

---

## How it works

### Component Hierarchy

```
App.jsx
├── Layout.jsx (for public pages)
│   ├── Navbar
│   ├── <Routes>
│   │   ├── HomePage
│   │   ├── ProjectsPage
│   │   ├── ProjectDetailPage
│   │   ├── MembersPage
│   │   ├── MemberProfilePage
│   │   ├── ProfilePage
│   │   └── SearchPage
│   └── Footer
│
└── AdminLayout.jsx (for admin pages)
    ├── AdminNavbar
    ├── Sidebar
    ├── <Routes>
    │   ├── AdminDashboard
    │   ├── AdminAnalytics
    │   ├── AdminProjects
    │   ├── AdminUsers
    │   └── AdminTags
    └── Footer
```

### Routing (App.jsx)

**File**: `frontend/src/App.jsx`

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import MembersPage from './pages/MembersPage';
import MemberProfilePage from './pages/MemberProfilePage';
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminAnalytics from './features/admin/components/AdminAnalytics';
import AdminProjects from './pages/AdminProjects';
import AdminUsers from './pages/AdminUsers';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:projectId" element={<ProjectDetailPage />} />
          <Route path="members" element={<MembersPage />} />
          <Route path="members/:uid" element={<MemberProfilePage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          
          {/* Protected Routes */}
          <Route path="profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
        </Route>
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### State Management

**Auth State (Zustand)**

**File**: `frontend/src/store/authStore.js`

```javascript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      
      setAuth: (user, token) => set({ user, token }),
      
      logout: () => set({ user: null, token: null }),
      
      isAuthenticated: () => {
        const state = useAuthStore.getState();
        return !!state.user && !!state.token;
      },
      
      isAdmin: () => {
        const state = useAuthStore.getState();
        return state.user?.role === 'admin';
      }
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage
    }
  )
);

export default useAuthStore;
```

**Server State (TanStack Query)**

**File**: `frontend/src/pages/ProjectsPage.jsx` (example)

```jsx
import { useQuery } from '@tanstack/react-query';
import { getProjects } from '../services/api';

function ProjectsPage() {
  const [domain, setDomain] = useState('');
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['projects', domain],
    queryFn: () => getProjects({ domain }),
    staleTime: 5 * 60 * 1000  // 5 minutes
  });
  
  if (isLoading) return <Loader />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      <DomainFilter value={domain} onChange={setDomain} />
      <ProjectGrid projects={data?.projects || []} />
    </div>
  );
}
```

---

## Key parameters / configuration

### API Client (axiosInstance)

**File**: `frontend/src/api/axiosInstance.js`

```javascript
import axios from 'axios';
import useAuthStore from '../store/authStore';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: Attach auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
```

---

## Gotchas & edge cases

### 1. Date Formatting (RangeError: Invalid time value)

**Problem**: Firestore timestamps come in multiple formats, causing `new Date()` to fail.

**Solution**: `safeFormatDate()` helper function.

**Location**: Multiple files (AdminAnalytics.jsx, ProfilePage.jsx)

```javascript
import { format } from 'date-fns';

const safeFormatDate = (dateValue) => {
  if (!dateValue) return '—';
  
  try {
    let date;
    
    // Firestore Timestamp object
    if (dateValue._seconds) {
      date = new Date(dateValue._seconds * 1000);
    }
    // ISO string
    else if (typeof dateValue === 'string') {
      date = new Date(dateValue);
    }
    // Date object
    else if (dateValue instanceof Date) {
      date = dateValue;
    }
    // Numeric timestamp (milliseconds)
    else if (typeof dateValue === 'number') {
      date = new Date(dateValue);
    }
    else {
      return 'Unknown date';
    }
    
    // Validate date
    if (isNaN(date.getTime())) {
      return 'Unknown date';
    }
    
    return format(date, 'PPP');  // Jan 1, 2026
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Unknown date';
  }
};
```

**Usage**:
```jsx
<p>Member since: {safeFormatDate(userData.joinedAt)}</p>
<p>Project created: {safeFormatDate(project.createdAt)}</p>
```

### 2. Clickable Contributor Names

**Problem**: Contributors displayed as plain text, users expect to click to view profiles.

**Solution**: Wrap in Link components.

**Location**: `frontend/src/pages/ProjectDetailPage.jsx`

```jsx
import { Link } from 'react-router-dom';

function ProjectDetailPage() {
  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProjectById(projectId)
  });
  
  return (
    <div>
      <h2>Project Team</h2>
      <div className="grid grid-cols-3 gap-4">
        {project?.contributorsList?.map(contributor => (
          <Link
            key={contributor.uid}
            to={`/members/${contributor.uid}`}
            className="p-4 border rounded hover:bg-gray-50"
          >
            <img src={contributor.avatar || '/default-avatar.png'} alt="" />
            <p className="font-medium">{contributor.displayName}</p>
            <p className="text-sm text-gray-500">{contributor.role}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

### 3. Clickable Member Cards

**Problem**: Member directory cards not clickable.

**Solution**: Wrap entire card in Link.

**Location**: `frontend/src/pages/MembersPage.jsx`

```jsx
import { Link } from 'react-router-dom';

function MembersPage() {
  const { data } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers
  });
  
  return (
    <div className="grid grid-cols-4 gap-4">
      {data?.users?.map(user => (
        <Link
          key={user.uid}
          to={`/members/${user.uid}`}
          className="card hover:shadow-lg transition"
        >
          <img src={user.avatar || '/default-avatar.png'} alt="" />
          <h3>{user.displayName}</h3>
          <p>{user.bio}</p>
          <div className="flex gap-2">
            {user.skills?.slice(0, 3).map(skill => (
              <span key={skill} className="badge">{skill}</span>
            ))}
          </div>
        </Link>
      ))}
    </div>
  );
}
```

### 4. Member Profile with Projects

**Problem**: Need to show all projects where user is owner OR contributor.

**Solution**: Use `contributorId` query param.

**Location**: `frontend/src/pages/MemberProfilePage.jsx`

```jsx
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getUserById, getProjects } from '../services/api';

function MemberProfilePage() {
  const { uid } = useParams();
  
  // Fetch user data
  const { data: userData } = useQuery({
    queryKey: ['user', uid],
    queryFn: () => getUserById(uid)
  });
  
  // Fetch user's projects (owned + contributed)
  const { data: projectsData } = useQuery({
    queryKey: ['projects', 'contributor', uid],
    queryFn: () => getProjects({ contributorId: uid, status: 'approved' })
  });
  
  return (
    <div>
      <section>
        <img src={userData?.avatar || '/default-avatar.png'} alt="" />
        <h1>{userData?.displayName}</h1>
        <p>{userData?.bio}</p>
        <div className="skills">
          {userData?.skills?.map(skill => (
            <span key={skill}>{skill}</span>
          ))}
        </div>
      </section>
      
      <section>
        <h2>Projects</h2>
        <ProjectGrid projects={projectsData?.projects || []} />
      </section>
    </div>
  );
}

export default MemberProfilePage;
```

### 5. Protected Routes

**Problem**: Need to prevent unauthorized access to certain pages.

**Solution**: `ProtectedRoute` component.

**Location**: `frontend/src/components/ProtectedRoute.jsx`

```jsx
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, isAuthenticated, isAdmin } = useAuthStore();
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

export default ProtectedRoute;
```

---

## Examples

### 1. Project Card Component

```jsx
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';

function ProjectCard({ project }) {
  return (
    <Card className="hover:shadow-lg transition">
      <CardHeader>
        <h3 className="text-xl font-bold">{project.title}</h3>
        <Badge variant={project.status === 'approved' ? 'success' : 'warning'}>
          {project.status}
        </Badge>
      </CardHeader>
      
      <CardContent>
        <p className="text-gray-600 line-clamp-3">{project.description}</p>
        
        <div className="flex gap-2 mt-4">
          {project.techStack?.slice(0, 5).map(tech => (
            <Badge key={tech} variant="outline">{tech}</Badge>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="flex -space-x-2">
          {project.contributorsList?.slice(0, 3).map(contributor => (
            <img
              key={contributor.uid}
              src={contributor.avatar || '/default-avatar.png'}
              alt={contributor.displayName}
              className="w-8 h-8 rounded-full border-2 border-white"
              title={contributor.displayName}
            />
          ))}
        </div>
        
        <Link
          to={`/projects/${project.projectId}`}
          className="text-blue-600 hover:underline"
        >
          View Details →
        </Link>
      </CardFooter>
    </Card>
  );
}

export default ProjectCard;
```

### 2. Domain Filter Component

```jsx
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';

const DOMAINS = [
  { value: '', label: 'All Domains' },
  { value: 'ai', label: 'AI/ML' },
  { value: 'web', label: 'Web Development' },
  { value: 'app', label: 'App Development' },
  { value: 'blockchain', label: 'Blockchain' },
  { value: 'security', label: 'Cybersecurity' },
  { value: 'cloud', label: 'Cloud Computing' },
  { value: 'design', label: 'UI/UX Design' }
];

function DomainFilter({ value, onChange }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-64">
        <SelectValue placeholder="Select domain" />
      </SelectTrigger>
      <SelectContent>
        {DOMAINS.map(domain => (
          <SelectItem key={domain.value} value={domain.value}>
            {domain.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default DomainFilter;
```

### 3. Admin Analytics Dashboard

```jsx
import { useQuery } from '@tanstack/react-query';
import { getAdminAnalytics } from '../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';

function AdminAnalytics() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: getAdminAnalytics
  });
  
  if (isLoading) return <Loader />;
  
  return (
    <div className="grid grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Total Users</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{data?.users?.total || 0}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Approved Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{data?.projects?.approved || 0}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Pending Review</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-orange-600">
            {data?.projects?.pending || 0}
          </p>
        </CardContent>
      </Card>
      
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Projects by Domain</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(data?.domains || {}).map(([domain, count]) => (
              <div key={domain} className="text-center p-4 bg-gray-50 rounded">
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-sm text-gray-600">{domain}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminAnalytics;
```

---

## Links / references

- [[Obsidian-ACMDigitalRepository]] — Master documentation
- [[Obsidian-Backend-Routes]] — API endpoints used by frontend
- [[Obsidian-Firebase-Integration]] — Auth flow details
- [React Router Docs](https://reactrouter.com/)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [shadcn/ui Components](https://ui.shadcn.com/)
