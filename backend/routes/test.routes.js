/**
 * Test Routes (DEVELOPMENT ONLY)
 * 
 * These routes help you test the API without needing a frontend.
 * ⚠️ REMOVE THIS FILE IN PRODUCTION!
 */

const express = require('express');
const router = express.Router();
const { auth } = require('../firebase');
const { generateTestIdToken } = require('../utils/tokenGenerator');

/**
 * POST /api/v1/test/create-user
 * 
 * Creates a test user in Firebase Auth for testing purposes.
 * Development only!
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

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name || 'Test User',
      emailVerified: true
    });

    // Generate a custom token
    const customToken = await auth.createCustomToken(userRecord.uid);

    return res.status(201).json({
      success: true,
      message: 'Test user created successfully',
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName
      },
      customToken,
      instructions: {
        step1: 'Copy the customToken from the response',
        step2: 'Use POST /api/v1/test/exchange-token to get an ID token',
        step3: 'Use the ID token in Authorization header: Bearer <id-token>'
      }
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
 * 
 * Gets a token for an existing user (simplified for testing).
 * Development only!
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

    // Get user by email
    const userRecord = await auth.getUserByEmail(email);

    // Generate a custom token
    const customToken = await auth.createCustomToken(userRecord.uid);

    return res.status(200).json({
      success: true,
      message: 'Token generated successfully',
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName
      },
      customToken,
      instructions: {
        step1: 'Copy the customToken from the response',
        step2: 'Use POST /api/v1/test/exchange-token to get an ID token',
        step3: 'Use the ID token in Authorization header: Bearer <id-token>'
      }
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
 * 
 * Gets a test ID token for a user (for testing authenticated endpoints).
 * Development only!
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

    // Get or create user
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        return res.status(404).json({
          success: false,
          error: 'UserNotFound',
          message: `User with email ${email} not found. Create them first with /api/v1/test/create-user`,
          hint: 'Use POST /api/v1/test/create-user to create a test user first'
        });
      }
      throw error;
    }

    // Generate a test ID token for development
    const idToken = generateTestIdToken(userRecord.uid, userRecord.email);

    return res.status(200).json({
      success: true,
      message: '✅ Test ID token generated! Use this for authenticated endpoints',
      user: {
        uid: userRecord.uid,
        email: userRecord.email
      },
      idToken: idToken,
      instructions: {
        step1: 'Copy the idToken value (the long string)',
        step2: 'In Postman, go to any authenticated endpoint (e.g., POST /api/v1/auth/verify)',
        step3: 'Add Header: Authorization = Bearer YOUR_ID_TOKEN_HERE',
        step4: 'The token expires in 1 hour'
      }
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
 * POST /api/v1/test/exchange-custom-token
 * 
 * Exchanges a custom token for an ID token using Firebase REST API.
 * Development only!
 */
router.post('/exchange-custom-token', async (req, res) => {
  try {
    const { customToken } = req.body;

    if (!customToken) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'customToken is required'
      });
    }

    // For testing, we'll use a simpler approach: 
    // We'll create an ID token directly using the Admin SDK
    const decodedToken = await auth.verifyCustomToken(customToken);
    const idToken = generateTestIdToken(decodedToken.uid, 'test@acm.com');

    return res.status(200).json({
      success: true,
      message: 'Token exchanged successfully',
      uid: decodedToken.uid,
      idToken: idToken,
      instructions: {
        next: 'Use this idToken in the Authorization header: Bearer <idToken>',
        example: 'Authorization: Bearer ' + idToken.substring(0, 20) + '...'
      }
    });

  } catch (error) {
    console.error('Exchange token error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: error.message
    });
  }
});

/**
 * POST /api/v1/test/generate-id-token
 * 
 * Generates a custom token and returns instructions.
 * For actual testing, you'll use the custom token directly with the backend.
 * Development only!
 */
router.post('/generate-id-token', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Email is required'
      });
    }

    // Get or create user
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
    } catch (error) {
      // User doesn't exist, create one
      userRecord = await auth.createUser({
        email,
        password: 'TestPassword123!',
        emailVerified: true,
        displayName: 'Test User'
      });
    }

    // Generate custom token
    const customToken = await auth.createCustomToken(userRecord.uid);

    return res.status(200).json({
      success: true,
      message: '✅ Token generated! For testing, use this workaround:',
      user: {
        uid: userRecord.uid,
        email: userRecord.email
      },
      testingInstructions: {
        message: 'Since we control the backend, you can temporarily disable auth for testing, OR use Firebase Auth emulator, OR use the custom token with a client SDK.',
        easyOption: 'I recommend creating a temporary test endpoint that skips auth verification. See response below.'
      },
      customToken
    });

  } catch (error) {
    console.error('Generate token error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: error.message
    });
  }
});

/**
 * POST /api/v1/test/create-project-noauth
 * 
 * Creates a project without requiring authentication.
 * TESTING ONLY - simulates authenticated request.
 */
router.post('/create-project-noauth', async (req, res) => {
  try {
    const { db } = require('../firebase');
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

    // Get or create user
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(userEmail);
    } catch (error) {
      // Create user if doesn't exist
      userRecord = await auth.createUser({
        email: userEmail,
        password: 'TestPassword123!',
        emailVerified: true,
        displayName: 'Test User'
      });
    }

    // Also ensure user exists in Firestore
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

    // Create project
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
      message: '✅ Project created successfully (TEST MODE)',
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
 * 
 * Lists all projects without authentication.
 * TESTING ONLY
 */
router.get('/list-projects', async (req, res) => {
  try {
    const { db } = require('../firebase');
    
    const snapshot = await db.collection('projects')
      .where('isDeleted', '==', false)
      .limit(50)
      .get();

    const projects = [];
    snapshot.forEach(doc => {
      projects.push({
        id: doc.id,
        ...doc.data()
      });
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
 * 
 * Lists all users without authentication.
 * TESTING ONLY
 */
router.get('/list-users', async (req, res) => {
  try {
    const { db } = require('../firebase');
    
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
