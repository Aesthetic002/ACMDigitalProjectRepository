/**
 * Diagnostic Routes (DEVELOPMENT ONLY)
 *
 * Helps troubleshoot Firebase configuration issues.
 * Only loaded when NODE_ENV !== 'production'
 */

const express = require('express');
const router = express.Router();
const { admin, db, auth } = require('../../shared/firebase');

/**
 * GET /api/v1/diagnose/diagnose
 */
router.get('/diagnose', async (req, res) => {
  try {
    const results = {
      timestamp: new Date().toISOString(),
      checks: {}
    };

    // Check 1: Firebase Admin SDK
    try {
      const appName = admin.app().name;
      results.checks.firebaseAdminSDK = {
        status: 'OK',
        message: `Firebase Admin SDK initialized (app: ${appName})`
      };
    } catch (error) {
      results.checks.firebaseAdminSDK = {
        status: 'FAILED',
        message: error.message
      };
    }

    // Check 2: Firestore
    try {
      await db.collection('_test').doc('_test').set({ test: true });
      await db.collection('_test').doc('_test').delete();
      results.checks.firestore = {
        status: 'OK',
        message: 'Firestore is working and accessible'
      };
    } catch (error) {
      results.checks.firestore = {
        status: 'FAILED',
        message: `Firestore error: ${error.message}`
      };
    }

    // Check 3: Firebase Auth
    try {
      await auth.getUser('test-diagnosis-user');
      results.checks.firebaseAuth = {
        status: 'OK',
        message: 'Firebase Auth SDK is working'
      };
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        results.checks.firebaseAuth = {
          status: 'OK',
          message: 'Firebase Auth is working (user not found is expected)'
        };
      } else {
        results.checks.firebaseAuth = {
          status: 'WARNING',
          message: `Firebase Auth error: ${error.message}`
        };
      }
    }

    results.summary = {
      allChecks: Object.values(results.checks).every(c => c.status === 'OK'),
      message: 'Check each item above to see what is working'
    };

    return res.status(200).json(results);

  } catch (error) {
    console.error('Diagnostic error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'DiagnosticError',
      message: error.message
    });
  }
});

module.exports = router;
