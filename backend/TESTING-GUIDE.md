# 🧪 BEGINNER'S TESTING GUIDE - Postman

This guide will walk you through testing your ACM Project Archive API step-by-step using Postman.

## 📋 Prerequisites

✅ Backend server is running (you should see "Server running on port 3000")  
✅ Postman is installed  
✅ Firebase service account key is in place  

---

## 🎯 Step-by-Step Testing

### **Step 1: Test Health Endpoint** (No authentication needed)

This confirms your server is running.

1. Open Postman
2. Create a new request (click "New" → "HTTP Request")
3. Set these values:
   - **Method**: `GET`
   - **URL**: `http://localhost:3000/health`
4. Click **Send**
5. ✅ You should see:
   ```json
   {
     "success": true,
     "message": "ACM Project Archive Platform - Backend API is running",
     "timestamp": "2026-01-16T..."
   }
   ```

---

### **Step 2: Create a Test User**

Since you don't have a frontend yet, we'll create a test user using a special endpoint.

1. Create a new request in Postman
2. Set these values:
   - **Method**: `POST`
   - **URL**: `http://localhost:3000/api/v1/test/create-user`
3. Click on the **Body** tab
4. Select **raw** and choose **JSON** from the dropdown
5. Enter this JSON:
   ```json
   {
     "email": "john@acm.com",
     "password": "SecurePass123!",
     "name": "John Doe"
   }
   ```
6. Click **Send**
7. ✅ You should get a response with user details and a `customToken`

**IMPORTANT**: Copy the `customToken` value from the response. You'll need it in the next step!

---

### **Step 3: Get an ID Token**

The custom token needs to be exchanged for an ID token that you can use for authentication.

1. Create a new request in Postman
2. Set these values:
   - **Method**: `POST`
   - **URL**: `http://localhost:3000/api/v1/test/generate-id-token`
3. Click on the **Body** tab
4. Select **raw** and choose **JSON**
5. Enter this JSON:
   ```json
   {
     "email": "john@acm.com"
   }
   ```
6. Click **Send**
7. ✅ Copy the `customToken` from the response

**NOTE**: For simplicity, we'll use the custom token directly. In production, you'd exchange it for an ID token through Firebase Auth REST API.

---

### **Step 4: Test Authentication Endpoint**

Now let's verify your authentication is working.

1. Create a new request in Postman
2. Set these values:
   - **Method**: `POST`
   - **URL**: `http://localhost:3000/api/v1/auth/verify`
3. Click on the **Headers** tab
4. Add a new header:
   - **Key**: `Authorization`
   - **Value**: `Bearer YOUR_CUSTOM_TOKEN_HERE` (replace with the token from Step 3)
5. Click **Send**

❌ **EXPECTED**: This will fail because we're using a custom token instead of an ID token.

**WORKAROUND**: Let me create a simpler test endpoint for you...

---

### **Step 5: Use the Simplified Test Flow**

Since getting a proper Firebase ID token requires a client app, I'll create a bypass for testing.

1. Create a new request in Postman
2. Set these values:
   - **Method**: `POST`
   - **URL**: `http://localhost:3000/api/v1/test/create-user`
3. Body (JSON):
   ```json
   {
     "email": "test@acm.com",
     "password": "Test123!",
     "name": "Test User"
   }
   ```
4. Click **Send**
5. Note the `uid` from the response

---

## 🔧 EASIER APPROACH: Skip Auth for Testing

Let me create a temporary test mode that doesn't require Firebase tokens. This will make testing much simpler!

### **Option A: Create Projects Without Auth (Test Mode)**

1. **Method**: `POST`
2. **URL**: `http://localhost:3000/api/v1/test/create-project-noauth`
3. **Body** (JSON):
   ```json
   {
     "title": "My First Project",
     "description": "Testing project creation",
     "techStack": ["React", "Node.js"],
     "userEmail": "test@acm.com"
   }
   ```

---

## 📚 Next Steps

Once you're comfortable with these basic tests, you can:

1. ✅ Test creating multiple users
2. ✅ Test creating projects
3. ✅ Test updating projects
4. ✅ Test the soft-delete feature

---

## 🆘 Common Issues

### Issue: "Cannot POST /api/v1/test/..."
**Solution**: Make sure your server is running. Check the terminal for "Server running on port 3000"

### Issue: "ECONNREFUSED"
**Solution**: The server isn't running. Run `npm run dev` in the backend folder.

### Issue: "Firebase error"
**Solution**: Make sure `serviceAccountKey.json` is in the backend folder.

---

## 💡 Pro Tip

Save your Postman requests in a Collection so you don't have to recreate them each time!

1. Click "Save" after creating a request
2. Create a new collection called "ACM Project Archive"
3. Save all your requests there

---

**Let me know when you're ready, and I'll create the simplified no-auth test endpoints!**
