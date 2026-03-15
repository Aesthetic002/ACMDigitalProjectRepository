/**
 * Authentication Routes
 * 
 * Handles authentication-related endpoints:
 * - POST /api/v1/auth/verify - Verify Firebase token and return user info
 */

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../shared/middleware/auth');
const { db } = require('../../shared/firebase');

/**
 * POST /api/v1/auth/verify
 * 
 * Verifies the Firebase authentication token and returns user information.
 * Also ensures the user exists in the Firestore users collection.
 * 
 * Headers:
 *   Authorization: Bearer <firebase-id-token>
 * 
 * Response:
 *   200: { success: true, user: {...} }
 *   401: { success: false, error: 'Unauthorized', message: '...' }
 */
router.post('/verify', verifyToken, async (req, res) => {
  try {
    const { uid, email, name, picture } = req.user;

    // Check if user exists in Firestore
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    let userData;

    if (!userDoc.exists) {
      // User doesn't exist in database, create a new user document
      userData = {
        uid,
        uid,
        email,
        name: name || '',
        photoURL: picture || '',
        role: 'member', // Default role
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await userRef.set(userData);

      return res.status(201).json({
        success: true,
        message: 'User authenticated and created',
        user: userData
      });
    } else {
      // User exists, return existing data
      userData = userDoc.data();


      // Update user data if it's missing (e.g. name/photo)
      const needsUpdate = (!userData.name && name) || (!userData.photoURL && picture);

      if (needsUpdate) {
        if (!userData.name && name) userData.name = name;
        if (!userData.photoURL && picture) userData.photoURL = picture;
        userData.updatedAt = new Date().toISOString();

        await userRef.update(userData);
      }

      return res.status(200).json({
        success: true,
        message: 'User authenticated',
        user: userData
      });
    }

  } catch (error) {
    console.error('Auth verification error:', error.message);

    return res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: 'Failed to verify authentication'
    });
  }
});

module.exports = router;
