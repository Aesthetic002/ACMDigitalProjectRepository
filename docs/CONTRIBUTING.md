# Contributing to ACM Project Archive Platform

Thank you for contributing! This guide will help you work effectively with the team.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Workflow](#development-workflow)
3. [Code Standards](#code-standards)
4. [Testing](#testing)
5. [Pull Requests](#pull-requests)
6. [Code Review](#code-review)

---

## Getting Started

### Prerequisites

- Node.js 16+
- Git
- Firebase account with service account key
- GitHub account

### Initial Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-org/ACMDigitalProjectRepository.git
   cd ACMDigitalProjectRepository
   ```

2. **Install dependencies**:
   ```bash
   cd backend
   npm install
   ```

3. **Set up Firebase**:
   - Get `serviceAccountKey.json` from team lead
   - Place in `backend/` folder
   - NEVER commit this file

4. **Run development server**:
   ```bash
   npm run dev
   ```

---

## Development Workflow

### 1. Pick an Issue

- Check GitHub Issues for tasks
- Assign yourself to prevent duplicates
- Ask questions in the issue comments

### 2. Create a Branch

```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

**Branch naming**:
- `feature/` - New features
- `fix/` - Bug fixes
- `chore/` - Maintenance tasks
- `docs/` - Documentation updates

Examples:
- `feature/projects-read-api`
- `fix/auth-token-expiry`
- `chore/update-dependencies`

### 3. Make Changes

- Follow existing code patterns
- Write clear, commented code
- Keep commits small and focused
- Test your changes

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: implement project list endpoint"
```

**Commit message format** (Conventional Commits):
```
<type>: <description>

[optional body]

[optional footer]
```

**Types**:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Code style (formatting, no logic change)
- `refactor:` - Code restructuring
- `test:` - Adding tests
- `chore:` - Maintenance

**Examples**:
```
feat: add pagination to project list endpoint

fix: correct owner validation in update endpoint

docs: update integration guide with search API

chore: update Express to v4.18.3
```

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

---

## Code Standards

### File Structure

```javascript
/**
 * Route description
 * 
 * Endpoint: METHOD /path
 * Purpose: What it does
 */

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { db } = require('../firebase');

// Route handlers

module.exports = router;
```

### Response Format

**Success**:
```javascript
res.status(200).json({
  success: true,
  data: { ... }
});
```

**Error**:
```javascript
res.status(400).json({
  success: false,
  error: 'ErrorType',
  message: 'Human-readable message'
});
```

### HTTP Status Codes

- `200` - OK (successful GET, PUT)
- `201` - Created (successful POST)
- `204` - No Content (successful DELETE)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

### Async/Await Pattern

```javascript
router.get('/endpoint', verifyToken, async (req, res) => {
  try {
    // Your logic here
    const data = await someAsyncOperation();
    
    return res.status(200).json({
      success: true,
      data
    });
    
  } catch (error) {
    console.error('Operation error:', error.message);
    
    return res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: error.message
    });
  }
});
```

### Input Validation

Always validate user input:

```javascript
router.post('/endpoint', verifyToken, async (req, res) => {
  const { title, description } = req.body;
  
  // Validation
  if (!title || title.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'ValidationError',
      message: 'Title is required'
    });
  }
  
  if (description && description.length > 1000) {
    return res.status(400).json({
      success: false,
      error: 'ValidationError',
      message: 'Description too long (max 1000 chars)'
    });
  }
  
  // Process...
});
```

### Code Comments

```javascript
/**
 * GET /api/v1/projects
 * 
 * Lists projects with pagination and filtering.
 * 
 * Query params:
 *   - limit: number (default: 20, max: 100)
 *   - pageToken: string (for pagination)
 *   - status: 'pending' | 'approved' | 'rejected'
 * 
 * Returns: { projects: [...], nextPageToken }
 */
router.get('/', async (req, res) => {
  // Implementation
});
```

### Security Best Practices

1. **Never trust client input** - Always validate
2. **Use middleware for auth** - Don't duplicate auth logic
3. **Set ownerId server-side** - Never accept from client
4. **Filter sensitive data** - Don't return internal fields
5. **Use parameterized queries** - Prevent injection
6. **Log security events** - Track unauthorized attempts

---

## Testing

### Manual Testing

Use Postman or curl to test endpoints:

```bash
# Get test token
curl -X POST http://localhost:3000/api/v1/test/get-id-token \
  -H "Content-Type: application/json" \
  -d '{"email":"test@acm.com"}'

# Use token
curl http://localhost:3000/api/v1/projects \
  -H "Authorization: Bearer <token>"
```

### Test Checklist

Before submitting PR, test:

- ✅ Endpoint works with valid input
- ✅ Endpoint rejects invalid input (400)
- ✅ Endpoint requires authentication (401)
- ✅ Endpoint enforces permissions (403)
- ✅ Endpoint handles not found (404)
- ✅ Endpoint handles server errors gracefully (500)

---

## Pull Requests

### Creating a PR

1. **Push your branch**:
   ```bash
   git push origin feature/your-feature
   ```

2. **Open PR on GitHub**:
   - Go to repository
   - Click "Pull requests" → "New"
   - Select your branch
   - Fill in template

3. **PR Title Format**:
   ```
   feat: add project list endpoint with pagination
   fix: correct token validation in auth middleware
   docs: update README with deployment guide
   ```

### PR Description Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Related Issue
Closes #123

## Changes Made
- Added GET /api/v1/projects endpoint
- Implemented pagination with pageToken
- Added filtering by status and techStack
- Updated README with new endpoint docs

## Testing Done
- Tested with 0, 1, 10, 100 projects
- Tested pagination with different page sizes
- Tested invalid query params
- Tested unauthorized access

## Checklist
- [ ] Code follows the project's style guidelines
- [ ] Self-review of code completed
- [ ] Commented complex code sections
- [ ] Documentation updated (if needed)
- [ ] No sensitive data committed
- [ ] Tested manually
- [ ] No breaking changes (or documented if yes)

## Screenshots (if applicable)
Postman screenshots showing request/response
```

### PR Size Guidelines

- **Small** (preferred): 1-200 lines changed
- **Medium**: 200-500 lines
- **Large** (avoid): 500+ lines

If your PR is large, consider splitting into smaller PRs.

---

## Code Review

### For Reviewers

**What to Check**:
- ✅ Code follows patterns and standards
- ✅ Logic is correct and handles edge cases
- ✅ Security: auth, validation, permissions
- ✅ No sensitive data committed
- ✅ Error handling is appropriate
- ✅ Code is readable and well-commented
- ✅ Tests are adequate (if applicable)
- ✅ Documentation is updated

**How to Review**:
1. Read the PR description
2. Check related issue/context
3. Review code changes line by line
4. Test locally if needed
5. Leave constructive comments
6. Approve or request changes

**Review Comments**:
```
Good:
✅ "Consider adding validation for techStack array length to prevent abuse"
✅ "This could be more efficient using a Firestore query instead of filtering in-memory"

Bad:
❌ "This is wrong"
❌ "I don't like this"
```

### For PR Authors

**Responding to Reviews**:
- Address all comments
- Ask questions if unclear
- Make requested changes
- Reply when done
- Re-request review

**Don't**:
- Take feedback personally
- Ignore comments
- Merge without approval
- Force push after reviews (unless rebasing)

---

## Common Issues

### Merge Conflicts

```bash
git checkout main
git pull origin main
git checkout your-branch
git merge main
# Fix conflicts
git add .
git commit -m "merge: resolve conflicts with main"
git push origin your-branch
```

### Accidental Commit to Main

```bash
# If not pushed yet
git reset --soft HEAD~1
git checkout -b feature/my-feature
git commit -m "feat: my changes"
git push origin feature/my-feature

# If already pushed (ask team lead for help)
```

### Forgot to Create Branch

```bash
# If not committed yet
git stash
git checkout -b feature/my-feature
git stash pop
git add .
git commit -m "feat: my changes"

# If already committed but not pushed
git branch feature/my-feature
git reset --hard origin/main
git checkout feature/my-feature
```

---

## Getting Help

- **Questions about code**: Comment on the PR or issue
- **Questions about workflow**: Ask in team chat
- **Bugs in existing code**: Create a GitHub issue
- **Urgent issues**: Contact team lead

---

## Resources

- [Express.js Docs](https://expressjs.com/)
- [Firebase Docs](https://firebase.google.com/docs)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Flow Guide](https://guides.github.com/introduction/flow/)

---

**Thank you for contributing! 🚀**
