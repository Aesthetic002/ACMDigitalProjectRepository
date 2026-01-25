/**
 * Diagnostic Routes (DEVELOPMENT ONLY)
 * 
 * Helps troubleshoot Firebase configuration issues.
 */

const express = require('express');
const router = express.Router();
const { admin, db, auth } = require('../firebase');

/**
 * GET /api/v1/test/diagnose
 * 
 * Checks Firebase configuration and what's available.
 */
router.get('/diagnose', async (req, res) => {
  try {
    console.log('🔍 Running Firebase diagnostics...\n');

    const results = {
      timestamp: new Date().toISOString(),
      checks: {}
    };

    // Check 1: Firebase Admin SDK
    try {
      const appName = admin.app().name;
      results.checks.firebaseAdminSDK = {
        status: '✅ OK',
        message: `Firebase Admin SDK initialized (app: ${appName})`
      };
    } catch (error) {
      results.checks.firebaseAdminSDK = {
        status: '❌ FAILED',
        message: error.message
      };
    }

    // Check 2: Firestore
    try {
      await db.collection('_test').doc('_test').set({ test: true });
      await db.collection('_test').doc('_test').delete();
      results.checks.firestore = {
        status: '✅ OK',
        message: 'Firestore is working and accessible'
      };
    } catch (error) {
      results.checks.firestore = {
        status: '❌ FAILED',
        message: `Firestore error: ${error.message}`,
        hint: 'Make sure Firestore is enabled in your Firebase project'
      };
    }

    // Check 3: Firebase Auth
    try {
      const testUser = await auth.getUser('test-diagnosis-user');
      results.checks.firebaseAuth = {
        status: '✅ OK (partially)',
        message: 'Firebase Auth SDK is working'
      };
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        results.checks.firebaseAuth = {
          status: '✅ OK',
          message: 'Firebase Auth is working (user not found is expected)'
        };
      } else {
        results.checks.firebaseAuth = {
          status: '⚠️  WARNING',
          message: `Firebase Auth error: ${error.message}`,
          hint: 'Make sure Authentication is enabled in your Firebase project'
        };
      }
    }

    // Summary
    results.summary = {
      allChecks: true,
      message: 'Check each item above to see what\'s working'
    };

    // Print to console
    console.log('\n📊 Firebase Diagnostics Results:');
    console.log('=' .repeat(50));
    Object.entries(results.checks).forEach(([key, value]) => {
      console.log(`\n${value.status} ${key}`);
      console.log(`   ${value.message}`);
      if (value.hint) {
        console.log(`   💡 Hint: ${value.hint}`);
      }
    });
    console.log('\n' + '='.repeat(50) + '\n');

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
