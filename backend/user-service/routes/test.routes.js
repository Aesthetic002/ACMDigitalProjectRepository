/**
 * Test Routes (DEVELOPMENT ONLY)
 *
 * These routes help you test the API without needing a frontend.
 * Only loaded when NODE_ENV !== 'production'
 */

const express = require('express');
const router = express.Router();
const { auth, db } = require('../../shared/firebase');
const { generateTestIdToken } = require('../../shared/utils/tokenGenerator');

/**
 * POST /api/v1/test/create-user
 */
router.post('/create-user', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Email and password are required'
      });
    }

    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name || 'Test User',
      emailVerified: true
    });

    const customToken = await auth.createCustomToken(userRecord.uid);

    return res.status(201).json({
      success: true,
      message: 'Test user created successfully',
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName
      },
      customToken
    });

  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({
        success: false,
        error: 'EmailExists',
        message: 'User with this email already exists. Try POST /api/v1/test/get-token instead.'
      });
    }

    console.error('Create user error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: error.message
    });
  }
});

/**
 * POST /api/v1/test/get-token
 */
router.post('/get-token', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Email is required'
      });
    }

    const userRecord = await auth.getUserByEmail(email);
    const customToken = await auth.createCustomToken(userRecord.uid);

    return res.status(200).json({
      success: true,
      message: 'Token generated successfully',
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName
      },
      customToken
    });

  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({
        success: false,
        error: 'UserNotFound',
        message: 'No user found with this email. Use POST /api/v1/test/create-user to create one.'
      });
    }

    console.error('Get token error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: error.message
    });
  }
});

/**
 * POST /api/v1/test/get-id-token
 */
router.post('/get-id-token', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Email is required'
      });
    }

    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        return res.status(404).json({
          success: false,
          error: 'UserNotFound',
          message: `User with email ${email} not found. Create them first with /api/v1/test/create-user`
        });
      }
      throw error;
    }

    const idToken = generateTestIdToken(userRecord.uid, userRecord.email);

    return res.status(200).json({
      success: true,
      message: 'Test ID token generated! Use this for authenticated endpoints',
      user: {
        uid: userRecord.uid,
        email: userRecord.email
      },
      idToken
    });

  } catch (error) {
    console.error('Get ID token error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: error.message
    });
  }
});

/**
 * POST /api/v1/test/create-project-noauth
 */
router.post('/create-project-noauth', async (req, res) => {
  try {
    const { title, description, techStack, contributors, userEmail } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Title and description are required'
      });
    }

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'userEmail is required for test mode'
      });
    }

    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(userEmail);
    } catch (error) {
      userRecord = await auth.createUser({
        email: userEmail,
        password: 'TestPassword123!',
        emailVerified: true,
        displayName: 'Test User'
      });
    }

    const userRef = db.collection('users').doc(userRecord.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      await userRef.set({
        uid: userRecord.uid,
        email: userRecord.email,
        role: 'member',
        name: userRecord.displayName || 'Test User',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    const projectData = {
      title: title.trim(),
      description: description.trim(),
      techStack: techStack || [],
      contributors: contributors || [userRecord.uid],
      ownerId: userRecord.uid,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false
    };

    const projectRef = await db.collection('projects').add(projectData);

    return res.status(201).json({
      success: true,
      message: 'Project created successfully (TEST MODE)',
      project: {
        id: projectRef.id,
        ...projectData
      }
    });

  } catch (error) {
    console.error('Test create project error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: error.message
    });
  }
});

/**
 * GET /api/v1/test/list-projects
 */
router.get('/list-projects', async (req, res) => {
  try {
    const snapshot = await db.collection('projects')
      .where('isDeleted', '==', false)
      .limit(50)
      .get();

    const projects = [];
    snapshot.forEach(doc => {
      projects.push({ id: doc.id, ...doc.data() });
    });

    return res.status(200).json({
      success: true,
      count: projects.length,
      projects
    });

  } catch (error) {
    console.error('Test list projects error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: error.message
    });
  }
});

/**
 * GET /api/v1/test/list-users
 */
router.get('/list-users', async (req, res) => {
  try {
    const snapshot = await db.collection('users').limit(50).get();

    const users = [];
    snapshot.forEach(doc => {
      users.push(doc.data());
    });

    return res.status(200).json({
      success: true,
      count: users.length,
      users
    });

  } catch (error) {
    console.error('Test list users error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: error.message
    });
  }
});

module.exports = router;
