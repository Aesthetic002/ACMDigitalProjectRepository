/**
 * Firebase Admin SDK Configuration
 *
 * Initializes Firebase Admin SDK for backend authentication and Firestore access.
 * Service account credentials should be stored securely and loaded from environment variables.
 */

const admin = require("firebase-admin");
const path = require("path");

// Initialize Firebase Admin SDK
let firebaseInitialized = false;

const initializeFirebase = () => {
  if (!firebaseInitialized) {
    try {
      // Try to load service account from file
      const serviceAccountPath = path.join(__dirname, "serviceAccountKey.json");
      const serviceAccount = require(serviceAccountPath);

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: `${serviceAccount.project_id}.appspot.com`,
      });

      console.log("✅ Firebase Admin SDK initialized successfully");
      console.log(`📁 Project ID: ${serviceAccount.project_id}`);

      firebaseInitialized = true;
    } catch (error) {
      console.error("❌ Firebase initialization error:", error.message);
      console.error(
        "📝 Make sure serviceAccountKey.json exists in the backend directory",
      );
      console.error(
        "🔗 Download it from: Firebase Console > Project Settings > Service Accounts",
      );
      throw error;
    }
  }
};

// Initialize Firebase on module load
initializeFirebase();

// Export Firebase Admin services
const db = admin.firestore();
const auth = admin.auth();
const bucket = admin.storage().bucket();

module.exports = {
  admin,
  db,
  auth,
  bucket,
};
