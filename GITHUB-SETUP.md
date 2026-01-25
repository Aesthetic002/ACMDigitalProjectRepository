# How to Push to GitHub

## First Time Setup

### 1. Create GitHub Repository

Go to [GitHub](https://github.com) and create a new repository:
- Name: `ACMDigitalProjectRepository` (or your preferred name)
- Description: "Backend API for ACM Project Archive Platform"
- Visibility: Private (recommended) or Public
- **DO NOT** initialize with README (you already have one)

### 2. Initialize Git in Your Project

Open terminal in the `backend` folder:

```bash
cd D:\Skills\Development\MyProjects\ACM\ACMDigitalProjectRepository
git init
```

### 3. Configure Git (if not already done)

```bash
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### 4. Add Remote Repository

Replace `<your-username>` with your GitHub username:

```bash
git remote add origin https://github.com/<your-username>/ACMDigitalProjectRepository.git
```

Example:
```bash
git remote add origin https://github.com/hemanth/ACMDigitalProjectRepository.git
```

### 5. Stage All Files

```bash
git add .
```

This adds all files except those in `.gitignore`.

### 6. Create Initial Commit

```bash
git commit -m "feat: initial backend implementation with auth and project write APIs"
```

### 7. Push to GitHub

```bash
git branch -M main
git push -u origin main
```

You might be asked for GitHub credentials. Use:
- Username: Your GitHub username
- Password: **Personal Access Token** (not your GitHub password)

#### Creating Personal Access Token:
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token (classic)
3. Give it a name: "ACM Backend"
4. Select scopes: `repo` (all)
5. Generate and copy the token
6. Use this token as password when pushing

---

## Recommended Folder Structure (Full Project)

```
ACMDigitalProjectRepository/
├── backend/                    # Backend API (what you built)
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── utils/
│   ├── firebase.js
│   ├── app.js
│   ├── package.json
│   ├── .gitignore
│   └── README.md
│
├── frontend/                   # Frontend (to be added by frontend team)
│   ├── src/
│   ├── public/
│   └── package.json
│
├── docs/                       # Documentation
│   ├── api-spec.yaml          # OpenAPI specification
│   └── architecture.md
│
├── .github/                    # GitHub workflows and templates
│   ├── workflows/
│   │   └── ci.yml             # CI/CD pipeline
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── CODEOWNERS
│
├── .gitignore                  # Root gitignore
└── README.md                   # Project overview
```

---

## Daily Workflow

### 1. Before Starting Work

```bash
# Get latest changes
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name
```

### 2. While Working

```bash
# Check status
git status

# Stage files
git add filename.js
# or add all changes
git add .

# Commit with message
git commit -m "feat: implement search API"
```

### 3. Push Your Branch

```bash
git push origin feature/your-feature-name
```

### 4. Create Pull Request

1. Go to GitHub repository
2. Click "Pull requests" → "New pull request"
3. Select your branch
4. Fill in title and description
5. Request reviewers
6. Submit

### 5. After PR is Merged

```bash
# Switch back to main
git checkout main

# Pull merged changes
git pull origin main

# Delete local feature branch
git branch -d feature/your-feature-name
```

---

## Working with Your Team

### Adding Collaborators

1. Go to GitHub repository
2. Settings → Collaborators
3. Add team members by GitHub username
4. They can now push to the repository

### Code Review Process

1. **Create PR** with clear description
2. **Request review** from at least 1 team member
3. **Address feedback** by pushing new commits to same branch
4. **Merge** only after approval
5. **Delete branch** after merge

### Handling Conflicts

If someone else modified the same file:

```bash
# Get latest main
git checkout main
git pull origin main

# Rebase your branch
git checkout feature/your-branch
git rebase main

# Fix conflicts in files
# Then:
git add .
git rebase --continue

# Force push (your branch only!)
git push origin feature/your-branch --force
```

---

## Branch Protection Rules (Recommended)

Set these up in GitHub → Settings → Branches:

1. **Protect `main` branch**:
   - ✅ Require pull request before merging
   - ✅ Require approvals (1 minimum)
   - ✅ Dismiss stale reviews
   - ✅ Require status checks to pass (if CI is set up)
   - ✅ Require conversation resolution
   - ✅ Do not allow bypassing

2. **Why?**
   - Prevents accidental direct pushes to main
   - Ensures code review
   - Maintains code quality

---

## Common Commands

```bash
# Check current branch
git branch

# Switch branch
git checkout branch-name

# Create and switch to new branch
git checkout -b new-branch-name

# View commit history
git log --oneline

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard all local changes
git reset --hard

# View remote URL
git remote -v

# Pull latest changes
git pull origin main

# Push current branch
git push origin current-branch-name

# Delete local branch
git branch -d branch-name

# Delete remote branch
git push origin --delete branch-name
```

---

## .gitignore

Make sure your `.gitignore` includes:

```
# Dependencies
node_modules/

# Environment
.env
.env.local

# Firebase credentials (CRITICAL - NEVER COMMIT)
serviceAccountKey.json
*-firebase-adminsdk-*.json

# Logs
logs/
*.log
npm-debug.log*

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp

# Build
dist/
build/

# Test coverage
coverage/
```

---

## Security Checklist Before Pushing

- [ ] No `serviceAccountKey.json` in commits
- [ ] No `.env` files with secrets
- [ ] No API keys or passwords in code
- [ ] All sensitive data in `.gitignore`
- [ ] No large files (>50MB)

### If You Accidentally Committed Secrets:

**CRITICAL**: If you committed secrets, they're in Git history even if you delete them.

1. **Immediately rotate the secret** (regenerate Firebase key, change passwords)
2. Remove from Git history:
   ```bash
   # Remove file from all commits
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch serviceAccountKey.json" \
     --prune-empty --tag-name-filter cat -- --all
   
   # Force push
   git push origin --force --all
   ```
3. **Better**: Use tools like [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)

---

## Team Repository Setup (One Time)

### 1. Create Organization (Optional but Recommended)

For team projects:
1. GitHub → Your profile → Organizations → New organization
2. Name: "ACM-YourUniversity"
3. Add team members
4. Create repository under organization

### 2. Set Up Branch Protections

Repository → Settings → Branches → Add rule:
- Branch name pattern: `main`
- Enable protections (see above)

### 3. Add CODEOWNERS File

Create `.github/CODEOWNERS`:
```
# Backend authentication & project writes
/backend/routes/auth.routes.js       @hemanth
/backend/routes/users.routes.js      @hemanth
/backend/routes/projects.write.js    @hemanth
/backend/middleware/auth.js          @hemanth

# Backend read & discovery
/backend/routes/projects.read.js     @otherdeveloper
/backend/routes/search.routes.js     @otherdeveloper
/backend/routes/assets.routes.js     @otherdeveloper
/backend/routes/admin.routes.js      @otherdeveloper

# Frontend
/frontend/                           @frontenddev
```

### 4. Create Pull Request Template

Create `.github/PULL_REQUEST_TEMPLATE.md`:
```markdown
## Description
<!-- Describe what this PR does -->

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Checklist
- [ ] Code follows project style
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No secrets committed
- [ ] Linked to issue

## Testing
<!-- How did you test this? -->

## Screenshots (if applicable)
<!-- Add screenshots -->
```

---

## CI/CD Setup (Optional but Recommended)

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'
    
    - name: Install dependencies
      working-directory: ./backend
      run: npm ci
    
    - name: Run linter
      working-directory: ./backend
      run: npm run lint || echo "Linter not configured"
    
    - name: Run tests
      working-directory: ./backend
      run: npm test || echo "Tests not configured"
```

---

## Quick Reference

**First time push:**
```bash
git init
git add .
git commit -m "feat: initial commit"
git branch -M main
git remote add origin https://github.com/username/repo.git
git push -u origin main
```

**Daily workflow:**
```bash
git checkout -b feature/my-feature
# ... make changes ...
git add .
git commit -m "feat: add feature"
git push origin feature/my-feature
# Create PR on GitHub
```

**After PR merged:**
```bash
git checkout main
git pull origin main
git branch -d feature/my-feature
```

---

Need help? Ask in team chat or create a GitHub Issue!
