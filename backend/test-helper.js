/**
 * Test Helper Script
 * 
 * This script helps you create a test user and get a Firebase ID token
 * for testing your API with Postman.
 */

const { auth } = require('./shared/firebase');

async function createTestToken() {
  try {
    console.log('🔧 Creating test user and generating token...\n');

    // Create a test user (or use existing)
    const testEmail = 'test@acm.com';
    const testUid = 'test-user-123';

    let user;
    try {
      // Try to get existing user
      user = await auth.getUserByEmail(testEmail);
      console.log(`✅ Found existing test user: ${testEmail}`);
    } catch (error) {
      // User doesn't exist, create new one
      user = await auth.createUser({
        uid: testUid,
        email: testEmail,
        emailVerified: true,
        password: 'TestPassword123!',
        displayName: 'Test User'
      });
      console.log(`✅ Created new test user: ${testEmail}`);
    }

    // Generate a custom token
    const customToken = await auth.createCustomToken(user.uid);
    
    console.log('\n📋 Test User Details:');
    console.log('─────────────────────────────────────');
    console.log(`Email: ${testEmail}`);
    console.log(`Password: TestPassword123!`);
    console.log(`UID: ${user.uid}`);
    console.log('\n🔑 Custom Token (use this for testing):');
    console.log('─────────────────────────────────────');
    console.log(customToken);
    console.log('\n⚠️  IMPORTANT: This is a CUSTOM TOKEN');
    console.log('You need to exchange it for an ID TOKEN using Firebase Auth API.');
    console.log('\nOr, use this simpler approach:');
    console.log('Since we control the backend, we can create a test endpoint...\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTestToken();
