/**
 * Token Generator Utility
 * 
 * Generates Firebase-compatible JWT tokens for testing.
 * Development only!
 */

const jwt = require('jsonwebtoken');

/**
 * Generate a fake ID token that matches Firebase ID token format
 * This is ONLY for testing/development
 */
function generateTestIdToken(uid, email) {
  // Create a payload similar to what Firebase generates
  const payload = {
    iss: 'https://securetoken.google.com/acmdigitalprojectrepository',
    aud: 'acmdigitalprojectrepository',
    auth_time: Math.floor(Date.now() / 1000),
    user_id: uid,
    sub: uid,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
    email: email,
    email_verified: true,
    firebase: {
      identities: {
        email: [email]
      },
      sign_in_provider: 'custom'
    }
  };

  // Sign with a test key (this won't be verified against actual Firebase key)
  // In production, the auth middleware will verify against Firebase's public keys
  const token = jwt.sign(payload, 'test-secret-key', { algorithm: 'HS256' });
  
  return token;
}

module.exports = {
  generateTestIdToken
};
