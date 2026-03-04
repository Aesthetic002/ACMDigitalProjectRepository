# Frontend Developer Guide - UI/UX Enhancement

## 📋 Table of Contents
- [Overview](#overview)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Current Frontend Logic](#current-frontend-logic)
- [Backend API Reference](#backend-api-reference)
- [UI/UX Improvement Guidelines](#uiux-improvement-guidelines)
- [State Management](#state-management)
- [Component Architecture](#component-architecture)
- [Design System & Styling](#design-system--styling)
- [Best Practices](#best-practices)
- [What NOT to Change](#what-not-to-change)

---

## 🎯 Overview

**ACM Digital Project Repository** is a full-stack web application for managing and showcasing ACM student projects. Your role is to **enhance the UI/UX** while maintaining the existing backend logic and frontend functionality.

### Tech Stack
- **Frontend**: React 18 + Vite
- **Styling**: TailwindCSS
- **Routing**: React Router v6
- **State**: Zustand (for auth)
- **Data Fetching**: Axios + React Query
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Backend**: Node.js + Express + Firebase

---

## 🚀 Quick Start

### 1. Clone & Setup
```bash
git clone https://github.com/Aesthetic002/ACMDigitalProjectRepository.git
cd ACMDigitalProjectRepository
```

### 2. Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend (separate terminal)
cd ../frontend
npm install
```

### 3. Configure Firebase
Create `frontend/src/config/firebase.js` with your Firebase credentials:
```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  // ... other config
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

### 4. Run Development Servers
```bash
# Terminal 1 - Backend (runs on http://localhost:3000)
cd backend
npm start

# Terminal 2 - Frontend (runs on http://localhost:5173)
cd frontend
npm run dev
```

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Navbar.jsx       # Top navigation bar
│   │   ├── Footer.jsx       # Footer component
│   │   ├── Layout.jsx       # Page wrapper with Navbar + Footer
│   │   ├── ProjectCard.jsx  # Project list/grid item
│   │   └── ProtectedRoute.jsx # Auth guard wrapper
│   ├── pages/               # Route-level components
│   │   ├── HomePage.jsx     # Landing page
│   │   ├── ProjectsPage.jsx # Browse all projects
│   │   ├── ProjectDetailPage.jsx # Single project view
│   │   ├── SearchPage.jsx   # Search & filter projects
│   │   ├── CreateProjectPage.jsx # Project submission form
│   │   ├── ProfilePage.jsx  # User profile & their projects
│   │   ├── AdminPage.jsx    # Admin dashboard
│   │   ├── LoginPage.jsx    # Authentication
│   │   └── RegisterPage.jsx # User registration
│   ├── services/
│   │   └── api.js           # Axios instance & API calls
│   ├── store/
│   │   └── authStore.js     # Zustand auth state
│   ├── config/
│   │   └── firebase.js      # Firebase initialization
│   ├── App.jsx              # Route configuration
│   ├── main.jsx             # React entry point
│   └── index.css            # Global styles + Tailwind
├── public/
│   └── favicon.svg
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## 🧠 Current Frontend Logic

### Authentication Flow
**File**: `src/store/authStore.js`

```javascript
// Key functions you should NOT modify:
- login(email, password)      // Firebase auth + JWT token
- register(email, password)   // User registration
- logout()                    // Clear session
- checkAuth()                 // Restore session on mount
```

**What this handles**:
- Firebase Authentication (email/password)
- Custom backend JWT token for API calls
- Persists auth state in `localStorage`
- Auto-restores session on page reload

**UI/UX Enhancement Opportunity**:
- Add loading skeletons during `checkAuth()`
- Improve login/register form design
- Add password strength indicator
- Better error message display

---

### API Service Layer
**File**: `src/services/api.js`

All API calls go through this centralized service. **Do NOT modify the API endpoints**, but you can:
- Add loading states
- Improve error handling UI
- Add retry logic with better UX feedback
- Create custom hooks for queries

**Available API Functions**:
```javascript
// Projects
- api.getProjects()
- api.getProjectById(id)
- api.createProject(data)
- api.updateProject(id, data)
- api.deleteProject(id)

// Search
- api.searchProjects(query, filters)

// Users
- api.getUserProfile()
- api.getUserProjects(userId)

// Admin
- api.getAllUsers()
- api.makeAdmin(userId)
- api.removeAdmin(userId)
```

---

### Page Components (Detailed)

#### 1. **HomePage.jsx**
- Hero section
- Featured projects
- Call-to-action buttons

**UI/UX Improvements**:
- Add animations on scroll
- Improve hero section design
- Add project statistics/counters
- Better mobile responsiveness

---

#### 2. **ProjectsPage.jsx**
Lists all projects with pagination/infinite scroll.

**Current Logic**:
- Fetches all projects via `api.getProjects()`
- Displays in grid layout using `ProjectCard`
- No pagination implemented yet

**UI/UX Improvements**:
- Add grid/list view toggle
- Implement infinite scroll or pagination
- Add loading skeletons
- Filter by tags/categories (UI only, backend supports it)
- Sort options (recent, popular, etc.)

---

#### 3. **ProjectDetailPage.jsx**
Shows individual project details.

**Current Logic**:
- Fetches project by ID from URL params
- Displays: title, description, team members, tags, images, links
- Edit/Delete buttons for project owners

**UI/UX Improvements**:
- Image gallery/carousel for multiple images
- Better tag display
- Team member cards with profiles
- Related projects section
- Share buttons
- Comment section (if backend adds it later)

---

#### 4. **SearchPage.jsx**
Advanced search and filtering.

**Current Logic**:
- Search by title, description, tags
- Filter by tags, team members
- Uses `api.searchProjects()`

**UI/UX Improvements**:
- Faceted search filters
- Search suggestions/autocomplete
- Filter chips with clear buttons
- Save search preferences
- Search history

---

#### 5. **CreateProjectPage.jsx**
Form to submit new projects.

**Current Logic**:
- Multi-field form with validation
- Supports: title, description, team members, tags, images, links
- Protected route (requires authentication)

**UI/UX Improvements**:
- Multi-step form wizard
- Drag-and-drop for images
- Tag autocomplete from existing tags
- Real-time preview
- Auto-save drafts
- Better validation messages
- Progress indicator

---

#### 6. **ProfilePage.jsx**
User profile and their projects.

**Current Logic**:
- Shows user info from Firebase auth
- Lists user's projects
- Edit/delete project actions

**UI/UX Improvements**:
- Profile avatar upload
- Edit profile information
- Project stats (views, likes if added)
- Tabbed interface (Projects, About, Activity)
- Bio/description field

---

#### 7. **AdminPage.jsx**
Admin dashboard for user management.

**Current Logic**:
- Lists all users
- Make/remove admin privileges
- Protected by `isAdmin` check

**UI/UX Improvements**:
- User table with search/sort
- Bulk actions
- User statistics dashboard
- Project moderation interface
- Activity logs

---

### Shared Components

#### **Navbar.jsx**
Top navigation with links and auth status.

**UI/UX Improvements**:
- Sticky/floating navbar
- Mobile hamburger menu
- User dropdown with avatar
- Search bar in navbar
- Notifications indicator

---

#### **ProjectCard.jsx**
Reusable project preview card.

**Current Props**:
```javascript
{
  id, title, description, tags, 
  teamMembers, coverImage, createdAt
}
```

**UI/UX Improvements**:
- Hover animations
- Tag badges with colors
- Like/bookmark buttons
- Share button
- View count
- Truncate long descriptions

---

#### **Footer.jsx**
Site footer with links.

**UI/UX Improvements**:
- Multi-column layout
- Social media links
- Newsletter signup
- ACM branding

---

## 🔌 Backend API Reference

**Base URL**: `http://localhost:3000/api/v1`

### Authentication Required
Add header: `Authorization: Bearer <JWT_TOKEN>`

### Endpoints

#### **Projects**
```
GET    /projects              # Get all projects
GET    /projects/:id          # Get single project
POST   /projects              # Create project (auth required)
PUT    /projects/:id          # Update project (auth + owner)
DELETE /projects/:id          # Delete project (auth + owner)
```

#### **Search**
```
GET    /search?q=<query>&tags[]=<tag>&teamMembers[]=<name>
```

#### **Users**
```
GET    /users/profile         # Get current user (auth required)
GET    /users/:id/projects    # Get user's projects
```

#### **Admin**
```
GET    /admin/users           # Get all users (admin only)
POST   /admin/make-admin      # Make user admin (admin only)
DELETE /admin/remove-admin/:userId  # Remove admin (admin only)
```

#### **Authentication**
```
POST   /auth/register         # Register new user
POST   /auth/login            # Login
POST   /auth/logout           # Logout
GET    /auth/verify-token     # Verify JWT
```

### Sample Project Object
```json
{
  "id": "project123",
  "title": "AI Chatbot",
  "description": "A conversational AI built with Python",
  "teamMembers": ["Alice", "Bob"],
  "tags": ["AI", "Python", "NLP"],
  "coverImage": "https://...",
  "images": ["url1", "url2"],
  "githubLink": "https://github.com/...",
  "liveLink": "https://demo.com",
  "videoLink": "https://youtube.com/...",
  "userId": "user123",
  "createdAt": "2026-03-04T10:00:00Z",
  "updatedAt": "2026-03-04T10:00:00Z"
}
```

---

## 🎨 UI/UX Improvement Guidelines

### Do's ✅
1. **Enhance Visual Design**
   - Improve color schemes
   - Add animations and transitions
   - Better typography
   - Consistent spacing

2. **Improve Interactions**
   - Loading states for all async actions
   - Hover effects
   - Smooth transitions
   - Micro-interactions

3. **Better Feedback**
   - Success/error toasts (already using react-hot-toast)
   - Form validation messages
   - Progress indicators
   - Empty states

4. **Responsive Design**
   - Mobile-first approach
   - Test on all screen sizes
   - Touch-friendly elements

5. **Accessibility**
   - ARIA labels
   - Keyboard navigation
   - Color contrast
   - Screen reader support

6. **Performance**
   - Lazy load images
   - Code splitting
   - Optimize re-renders
   - Debounce search inputs

### Don'ts ❌
1. **Do NOT change**:
   - API endpoint URLs
   - Authentication logic flow
   - Data structures from backend
   - Route paths (unless coordinated)
   - Environment variable names

2. **Do NOT add**:
   - New backend features (without backend dev approval)
   - Database schema changes
   - New authentication methods
   - Breaking changes to existing components

3. **Do NOT remove**:
   - Existing functionality
   - Required form fields
   - Authentication checks
   - Admin-only features

---

## 📦 State Management

### Zustand Auth Store
**File**: `src/store/authStore.js`

```javascript
// Current state structure
{
  user: null,           // Firebase user object
  token: null,          // Backend JWT token
  isAuthenticated: false,
  isAdmin: false,
  loading: true,
  error: null
}
```

**When to use**:
- Accessing current user info
- Checking authentication status
- Conditional rendering based on user role

**Example**:
```javascript
import { useAuthStore } from '../store/authStore';

function MyComponent() {
  const { user, isAuthenticated, isAdmin } = useAuthStore();
  
  if (!isAuthenticated) return <LoginPrompt />;
  if (isAdmin) return <AdminView />;
  return <UserView user={user} />;
}
```

### React Query (Optional Enhancement)
Consider adding React Query for:
- Caching API responses
- Automatic refetching
- Optimistic updates
- Better loading/error states

**Example Implementation**:
```javascript
import { useQuery } from '@tanstack/react-query';

function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: api.getProjects,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

---

## 🏗️ Component Architecture

### Recommended Structure
```
components/
├── common/          # Shared across entire app
│   ├── Button.jsx
│   ├── Input.jsx
│   ├── Card.jsx
│   ├── Modal.jsx
│   └── Spinner.jsx
├── layout/          # Layout components
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── Sidebar.jsx
│   └── Layout.jsx
├── project/         # Project-specific
│   ├── ProjectCard.jsx
│   ├── ProjectGrid.jsx
│   ├── ProjectForm.jsx
│   └── ProjectFilters.jsx
└── user/            # User-specific
    ├── UserAvatar.jsx
    ├── UserCard.jsx
    └── UserProfile.jsx
```

### Component Best Practices
```javascript
// 1. Use functional components with hooks
function MyComponent({ title, onAction }) {
  // Custom hooks at the top
  const { user } = useAuthStore();
  const [state, setState] = useState();

  // Event handlers
  const handleClick = () => { /* ... */ };

  // Render
  return <div>...</div>;
}

// 2. Prop types (optional but recommended)
MyComponent.propTypes = {
  title: PropTypes.string.isRequired,
  onAction: PropTypes.func
};

// 3. Default props
MyComponent.defaultProps = {
  onAction: () => {}
};
```

---

## 🎨 Design System & Styling

### TailwindCSS Configuration
**File**: `tailwind.config.js`

**Current Theme** (feel free to customize):
```javascript
theme: {
  extend: {
    colors: {
      // Add your custom colors
      primary: '#...',
      secondary: '#...',
    },
    fontFamily: {
      // Add custom fonts
    }
  }
}
```

### Styling Guidelines

#### 1. **Use Tailwind Utility Classes**
```jsx
// Good
<button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
  Click Me
</button>

// Better (with custom classes for reusable styles)
<button className="btn btn-primary">Click Me</button>
```

#### 2. **Create Reusable Components**
```jsx
// components/common/Button.jsx
export function Button({ variant = 'primary', children, ...props }) {
  const variants = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
  };

  return (
    <button 
      className={`px-4 py-2 rounded font-medium ${variants[variant]}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

#### 3. **Responsive Design**
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Mobile: 1 col, Tablet: 2 cols, Desktop: 3 cols */}
</div>
```

#### 4. **Dark Mode (Optional)**
```jsx
// Add dark mode support
<div className="bg-white dark:bg-gray-800 text-black dark:text-white">
  {/* Content */}
</div>
```

---

## ✅ Best Practices

### 1. **Code Organization**
- One component per file
- Group related components in folders
- Use index.js for cleaner imports

### 2. **Performance**
```jsx
// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));

// Memoize expensive computations
const sortedProjects = useMemo(() => 
  projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
  [projects]
);

// Debounce search inputs
const debouncedSearch = useDebouncedCallback((value) => {
  api.searchProjects(value);
}, 300);
```

### 3. **Error Handling**
```jsx
function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getProjects()
      .then(setProjects)
      .catch(err => {
        setError(err.message);
        toast.error('Failed to load projects');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} />;
  if (!projects.length) return <EmptyState />;

  return <ProjectGrid projects={projects} />;
}
```

### 4. **Accessibility**
```jsx
// Semantic HTML
<button onClick={handleClick} aria-label="Close modal">
  <X className="w-5 h-5" />
</button>

// Form labels
<label htmlFor="email" className="block mb-2">
  Email Address
</label>
<input id="email" type="email" required />

// Skip to main content
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

### 5. **Testing Friendly**
```jsx
// Add data-testid for testing
<button data-testid="submit-project">Submit</button>
```

---

## 🚫 What NOT to Change

### Backend Logic
- Do NOT modify `backend/` folder
- Do NOT change API endpoint URLs
- Do NOT alter request/response formats
- Do NOT change authentication flow

### Core Frontend Logic
- Auth store logic in `authStore.js`
- API service functions in `api.js`
- Firebase configuration structure
- Protected route logic
- Route paths (coordinate with team if needed)

### Environment & Configuration
- Vite configuration (unless performance optimization)
- Firebase SDK setup
- Package.json scripts

### Data Structures
- Do NOT change how data is sent to backend
- Do NOT modify expected response formats
- Keep form field names matching backend expectations

---

## 🎯 Recommended Improvements Priority

### High Priority (Start Here)
1. **Responsive Navigation**
   - Mobile hamburger menu
   - User dropdown with avatar
   
2. **Loading States**
   - Skeleton screens for all data fetching
   - Button loading spinners
   
3. **Empty States**
   - No projects found
   - No search results
   - First-time user experience

4. **Form UX**
   - Better validation feedback
   - Loading states on submit
   - Success confirmation

### Medium Priority
5. **Project Cards**
   - Hover animations
   - Better image handling
   - Tag display improvements

6. **Search & Filters**
   - Filter UI enhancements
   - Clear filters button
   - Active filter indicators

7. **Profile Page**
   - User avatar
   - Better project organization

### Low Priority (Nice to Have)
8. **Animations**
   - Page transitions
   - Scroll animations
   - Micro-interactions

9. **Dark Mode**
   - Theme toggle
   - Persistent preference

10. **Advanced Features**
    - Project bookmarks (UI only, backend needs implementation)
    - Share functionality
    - Statistics dashboard

---

## 📚 Additional Resources

### Documentation
- [React Documentation](https://react.dev)
- [TailwindCSS Docs](https://tailwindcss.com)
- [React Router](https://reactrouter.com)
- [Zustand](https://github.com/pmndrs/zustand)
- [React Query](https://tanstack.com/query)
- [Lucide Icons](https://lucide.dev)

### Backend Documentation
- See `backend/README.md` for API details
- See `docs/` folder for system architecture
- See `docs/05-api-endpoints.md` for complete API reference

### Getting Help
- Check existing code comments
- Review `docs/04-code-structure.md`
- Ask in team chat before making breaking changes
- Test your changes with both backend and frontend running

---

## 🤝 Contributing

### Before You Start
1. Pull latest changes from `main`
2. Create a feature branch: `git checkout -b ui/feature-name`
3. Run both frontend and backend servers
4. Test on multiple screen sizes

### During Development
1. Follow existing code style
2. Write meaningful commit messages
3. Test authentication flows
4. Verify admin features work

### Before Submitting
1. Test all pages and components
2. Check mobile responsiveness
3. Verify no console errors
4. Test with and without authentication
5. Lint your code: `npm run lint`

### Submitting Changes
```bash
git add .
git commit -m "ui: improve project card hover effects"
git push origin ui/feature-name
# Create Pull Request on GitHub
```

---

## 🐛 Common Issues & Solutions

### Issue: "Token expired" errors
**Solution**: The user was logged out. Design a better session expiry UX with auto-redirect to login.

### Issue: Images not loading
**Solution**: Add fallback images and loading states for all image components.

### Issue: Form validation not showing
**Solution**: Ensure error states are visible and accessible.

### Issue: Mobile menu overlapping content
**Solution**: Use proper z-index and overlay states.

---

## 📞 Contact

For questions on:
- **Backend Logic**: Contact backend team
- **UI/UX Design**: Contact design team  
- **Frontend Architecture**: Contact frontend lead
- **Firebase/Auth Issues**: Contact backend team

---

**Happy Coding! 🚀**

Remember: Your goal is to make the user experience delightful while respecting the existing functionality and backend architecture.
