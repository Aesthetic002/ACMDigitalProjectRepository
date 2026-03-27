# Viewer/Contributor Role Selection - Complete! ✅

## What's New

When users visit any project detail page for the first time, they'll see a **beautiful role selection dialog** asking them to choose between **Viewer** or **Contributor**.

---

## Features

### 🎯 Role Selection Dialog

- **Appears once per session** when first visiting a project
- **Beautiful card-based UI** with gradients and icons
- **Clear permission descriptions** for each role
- **No backend required** - works in guest mode

### 👁️ Viewer Role

**What viewers can do:**

- ✅ View all projects
- ✅ Comment on projects
- ✅ Like comments
- ✅ Browse member profiles

**Perfect for:** People exploring projects, community members engaging with content

### 💻 Contributor Role

**What contributors can do:**

- ✅ Everything viewers can do
- ✅ Create new projects
- ✅ Edit your projects
- ✅ Collaborate with team

**Perfect for:** Active developers, project creators, team members

---

## User Flow

### First-Time Visitor

1. User clicks on any project
2. **Role dialog appears** with two options
3. User selects Viewer or Contributor
4. Dialog closes, user sees success toast
5. User can browse and see comments
6. **Dialog won't show again** this session

### Guest Mode

- After selecting role, users are in **"guest mode"**
- Can browse projects freely
- Can view all comments
- **Must login to post comments** - prompted with "Sign In to Comment" button

### Logged-In Users

- Dialog **never shows** for authenticated users
- Use their account role directly
- Full comment posting abilities

---

## Technical Implementation

### New Components

**`RoleSelectionDialog.jsx`** (Created)

- Beautiful modal with two role cards
- Gradient icons (Blue for Viewer, Purple for Contributor)
- Permission lists with checkmarks
- Selection indicator with animated check
- Guest mode info banner
- Responsive design

### Updated Files

**`authStore.js`** (Modified)

- Added `guestRole` state (viewer/contributor)
- Added `hasSeenRoleDialog` flag
- New methods:
  - `setGuestRole(role)` - Store guest role choice
  - `getEffectiveRole()` - Get user or guest role
  - `canCreateProjects()` - Check creation permission
  - `canComment()` - Check comment permission
  - `requiresLogin()` - Check if login needed

**`ProjectDetailPage.jsx`** (Modified)

- Imports RoleSelectionDialog
- useEffect hook shows dialog for non-authenticated users
- `handleRoleSelect` stores choice and shows toast
- Dialog wrapped in Fragment with page content

**`CommentSection.jsx`** (Modified)

- Shows guest role badge in header
- Updated comment form area for guests:
  - Beautiful "Sign In to Comment" prompt
  - Shows current role (Viewer/Contributor)
  - Button redirects to /login
- Checks guest role before allowing comments

---

## Behavior Rules

### When Dialog Shows

✅ **Shows:** Non-authenticated user visiting project page for first time  
❌ **Never shows:** Logged-in users  
❌ **Never shows:** Same session after first time

### Comment Permissions

- ✅ **Logged-in users:** Can post comments immediately
- ⚠️ **Guest users:** Must click "Sign In to Comment" button
- ✅ **All users:** Can view and read comments

### Storage

- Guest role stored in **localStorage** via Zustand persist
- Survives page refreshes
- Cleared when localStorage is cleared

---

## UI/UX Highlights

### Dialog Design

- **Dark theme** matching ACM branding
- **Gradient icons** (Blue/Purple)
- **Hover effects** with scale animation
- **Selection indicator** with check icon
- **Permission lists** clearly showing capabilities
- **Info banner** explaining guest mode

### Comment Section Updates

- **Role badge** shows current guest role
- **Login prompt** with icon and description
- **Styled button** to sign in
- **Smooth transitions** and animations

---

## Testing Instructions

### Test as New Visitor

1. **Clear localStorage** (Dev Tools > Application > Storage > Clear)
2. Navigate to any project detail page
3. **Dialog should appear** automatically
4. Click on "Viewer" card - see selection indicator
5. Click "Continue as Viewer"
6. See success toast: "Welcome! You're browsing as a Viewer"
7. Scroll down to comments
8. See role badge and "Sign In to Comment" prompt
9. Visit another project - **dialog should NOT show**

### Test Viewer vs Contributor

1. Clear localStorage and select **Viewer**
2. Note the permissions shown
3. Clear localStorage and select **Contributor**
4. Note the different permission list

### Test Logged-In User

1. Login to your account
2. Visit any project page
3. **Dialog should NOT show**
4. Comment form should be available immediately

### Test Guest Comment Attempt

1. As guest, try to scroll to comment section
2. Should see "Sign In to Comment" button
3. Click button - redirects to /login

---

## Console Messages

When dialog appears, you'll see:

```
[Mock Auth] Guest role set: viewer
```

or

```
[Mock Auth] Guest role set: contributor
```

---

## Customization Options

### Change When Dialog Shows

Edit `ProjectDetailPage.jsx`, line ~53:

```javascript
useEffect(() => {
  if (!isAuthenticated && !hasSeenRoleDialog) {
    setShowRoleDialog(true);
  }
}, [isAuthenticated, hasSeenRoleDialog]);
```

### Change Role Options

Edit `RoleSelectionDialog.jsx`, `roles` array to add/modify roles

### Change Permissions

Edit the `permissions` arrays in each role definition

---

## Role Upgrade Path

If a Viewer wants to become a Contributor:

1. They must **create an account** (sign up)
2. Login with contributor permissions
3. Or use the `upgradeRole()` method (already implemented in authStore)

---

## Future Enhancements

Possible improvements:

- Add "Change Role" button in user menu
- Show role in navigation bar
- Track role selection analytics
- Add "Skip" option (browse as viewer)
- Remember role preference across sessions

---

## Summary

✅ **Role dialog appears** on first project visit  
✅ **Guest mode implemented** - browse without account  
✅ **Login prompt** when guests try to comment  
✅ **Beautiful UI** matching ACM design  
✅ **Session persistence** - dialog shows once  
✅ **Zero breaking changes** to existing code

**Your viewer/contributor system is now fully functional!** 🎉

Test it by refreshing your browser and visiting any project page!
