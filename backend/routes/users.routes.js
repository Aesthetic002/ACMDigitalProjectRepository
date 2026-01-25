/**
 * User Management Routes
 * 
 * Handles user-related endpoints (all protected by authentication):
 * - GET /api/v1/users/:userId - Get a specific user
 * - PUT /api/v1/users/:userId - Update a specific user
 * - GET /api/v1/users - Get all users (with optional filtering)
 */

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { db } = require('../firebase');

/**
 * GET /api/v1/users/:userId
 * 
 * Retrieves information about a specific user.
 * Authentication required.
 * 
 * Response:
 *   200: { success: true, user: {...} }
 *   404: { success: false, error: 'NotFound', message: 'User not found' }
 */
router.get('/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch user from Firestore
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'NotFound',
        message: 'User not found'
      });
    }

    const userData = userDoc.data();

    return res.status(200).json({
      success: true,
      user: userData
    });

  } catch (error) {
    console.error('Get user error:', error.message);
    
    return res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: 'Failed to retrieve user'
    });
  }
});

/**
 * PUT /api/v1/users/:userId
 * 
 * Updates information for a specific user.
 * Users can only update their own profile (unless admin).
 * Authentication required.
 * 
 * Body: { name?, role?, ... } (any updatable fields)
 * 
 * Response:
 *   200: { success: true, user: {...} }
 *   403: { success: false, error: 'Forbidden', message: '...' }
 *   404: { success: false, error: 'NotFound', message: 'User not found' }
 */
router.put('/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const authenticatedUid = req.user.uid;

    // Check if user exists
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'NotFound',
        message: 'User not found'
      });
    }

    // Authorization: Users can only update their own profile
    // (In a real app, you might allow admins to update any user)
    if (userId !== authenticatedUid) {
      const currentUserData = userDoc.data();
      
      // Allow if the authenticated user is an admin
      const authenticatedUserRef = db.collection('users').doc(authenticatedUid);
      const authenticatedUserDoc = await authenticatedUserRef.get();
      
      if (!authenticatedUserDoc.exists || authenticatedUserDoc.data().role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'You can only update your own profile'
        });
      }
    }

    // Extract updatable fields from request body
    const { name, role, ...otherFields } = req.body;

    // Build update object (only include provided fields)
    const updateData = {
      updatedAt: new Date().toISOString()
    };

    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;
    
    // Allow other profile fields
    Object.keys(otherFields).forEach(key => {
      // Prevent updating protected fields
      if (!['uid', 'email', 'createdAt'].includes(key)) {
        updateData[key] = otherFields[key];
      }
    });

    // Update user in Firestore
    await userRef.update(updateData);

    // Fetch and return updated user data
    const updatedDoc = await userRef.get();
    const updatedUserData = updatedDoc.data();

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: updatedUserData
    });

  } catch (error) {
    console.error('Update user error:', error.message);
    
    return res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: 'Failed to update user'
    });
  }
});

/**
 * GET /api/v1/users
 * 
 * Retrieves a list of all users.
 * Authentication required.
 * 
 * Query parameters:
 *   - role: Filter by role (optional)
 *   - limit: Maximum number of results (optional, default: 100)
 * 
 * Response:
 *   200: { success: true, users: [...], count: number }
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const { role, limit = 100 } = req.query;

    // Build query
    let query = db.collection('users');

    // Apply role filter if provided
    if (role) {
      query = query.where('role', '==', role);
    }

    // Apply limit
    query = query.limit(parseInt(limit));

    // Execute query
    const snapshot = await query.get();

    // Extract user data
    const users = [];
    snapshot.forEach(doc => {
      users.push(doc.data());
    });

    return res.status(200).json({
      success: true,
      users,
      count: users.length
    });

  } catch (error) {
    console.error('Get users error:', error.message);
    
    return res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: 'Failed to retrieve users'
    });
  }
});

module.exports = router;
