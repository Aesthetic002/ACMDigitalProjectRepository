# 🚀 QUICK START - Testing with Postman

Follow these **5 simple steps** to test your API!

---

## ✅ Step 1: Check Server is Running

**In Postman:**
- Method: `GET`
- URL: `http://localhost:3000/health`
- Click **Send**

**Expected Response:**
```json
{
  "success": true,
  "message": "ACM Project Archive Platform - Backend API is running"
}
```

✅ If you see this, your server is working!

---

## ✅ Step 2: Create Your First Test User

**In Postman:**
- Method: `POST`
- URL: `http://localhost:3000/api/v1/test/create-user`
- Click **Body** tab → Select **raw** → Select **JSON**
- Paste this:

```json
{
  "email": "alice@acm.com",
  "password": "SecurePass123!",
  "name": "Alice Johnson"
}
```

- Click **Send**

**Expected Response:**
```json
{
  "success": true,
  "message": "Test user created successfully",
  "user": {
    "uid": "...",
    "email": "alice@acm.com"
  }
}
```

✅ Your first user is created!

---

## ✅ Step 3: Create Your First Project

**In Postman:**
- Method: `POST`
- URL: `http://localhost:3000/api/v1/test/create-project-noauth`
- Click **Body** tab → Select **raw** → Select **JSON**
- Paste this:

```json
{
  "title": "Smart Library System",
  "description": "An automated library management system with RFID integration",
  "techStack": ["React", "Node.js", "MongoDB", "RFID"],
  "userEmail": "alice@acm.com"
}
```

- Click **Send**

**Expected Response:**
```json
{
  "success": true,
  "message": "✅ Project created successfully (TEST MODE)",
  "project": {
    "id": "...",
    "title": "Smart Library System",
    "ownerId": "...",
    "status": "pending"
  }
}
```

✅ Your first project is created!

---

## ✅ Step 4: View All Projects

**In Postman:**
- Method: `GET`
- URL: `http://localhost:3000/api/v1/test/list-projects`
- Click **Send**

**Expected Response:**
```json
{
  "success": true,
  "count": 1,
  "projects": [
    {
      "id": "...",
      "title": "Smart Library System",
      "description": "...",
      "techStack": ["React", "Node.js", "MongoDB", "RFID"],
      "ownerId": "...",
      "status": "pending"
    }
  ]
}
```

✅ You can see all your projects!

---

## ✅ Step 5: View All Users

**In Postman:**
- Method: `GET`
- URL: `http://localhost:3000/api/v1/test/list-users`
- Click **Send**

**Expected Response:**
```json
{
  "success": true,
  "count": 1,
  "users": [
    {
      "uid": "...",
      "email": "alice@acm.com",
      "name": "Alice Johnson",
      "role": "member"
    }
  ]
}
```

✅ You can see all your users!

---

## 🎉 Congratulations!

You've successfully tested your ACM Project Archive API! 

### What You've Accomplished:
- ✅ Verified server is running
- ✅ Created a test user
- ✅ Created a project
- ✅ Retrieved projects list
- ✅ Retrieved users list

---

## 🔥 Try More Things!

### Create More Users
Use the same Step 2, but change the email:
```json
{
  "email": "bob@acm.com",
  "password": "SecurePass123!",
  "name": "Bob Smith"
}
```

### Create More Projects
Use the same Step 3, but change the project details:
```json
{
  "title": "AI Chatbot",
  "description": "Customer service chatbot using natural language processing",
  "techStack": ["Python", "TensorFlow", "Flask"],
  "userEmail": "bob@acm.com"
}
```

---

## 💾 Save Your Postman Requests

1. Click the **Save** button after creating each request
2. Create a collection called "ACM Project Archive - Tests"
3. Save all requests there for easy access later

---

## 📊 Postman Collection Structure

Organize your saved requests like this:

```
📁 ACM Project Archive - Tests
  ├─ 🟢 Health Check
  ├─ 👤 Create Test User
  ├─ 📝 Create Project (No Auth)
  ├─ 📋 List All Projects
  └─ 👥 List All Users
```

---

## ⚠️ Important Notes

**These test endpoints are for DEVELOPMENT ONLY!**

- The `/api/v1/test/*` endpoints bypass authentication
- They should be REMOVED before deploying to production
- They're here to help you test without a frontend

When you build your frontend, you'll use the real authenticated endpoints:
- `POST /api/v1/auth/verify`
- `POST /api/v1/projects`
- `GET /api/v1/users`
- etc.

---

## 🆘 Troubleshooting

### "Cannot GET/POST ..."
→ Check the URL is correct and server is running

### "ECONNREFUSED"
→ Run `npm run dev` in the backend folder

### "Firebase error"
→ Make sure `serviceAccountKey.json` exists in backend folder

---

**Need help? Check the terminal where your server is running for error messages!**
