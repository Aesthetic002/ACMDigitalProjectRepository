/**
 * Firebase Admin SDK Configuration for Microservices
 *
 * Shared Firebase configuration for all gRPC microservices.
 * This file should be in backend/services/ and imported by each service.
 */

const admin = require("firebase-admin");
const path = require("path");

// Initialize Firebase Admin SDK
let firebaseInitialized = false;

const initializeFirebase = () => {
  if (!firebaseInitialized) {
    try {
      // Try to load service account from file (for local development)
      // In production, this might use environment variables
      const serviceAccountPath = path.join(__dirname, "..", "serviceAccountKey.json");
      const serviceAccount = require(serviceAccountPath);

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: `${serviceAccount.project_id}.appspot.com`,
      });

      console.log("✅ Firebase Admin SDK initialized successfully");
      console.log(`📁 Project ID: ${serviceAccount.project_id}`);

      firebaseInitialized = true;
    } catch (error) {
      // If file not found, try environment variables (for Docker/production)
      if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
        try {
          admin.initializeApp({
            credential: admin.credential.cert({
              projectId: process.env.FIREBASE_PROJECT_ID,
              privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
              clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            }),
            storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
          });

          console.log("✅ Firebase Admin SDK initialized from environment variables");
          console.log(`📁 Project ID: ${process.env.FIREBASE_PROJECT_ID}`);

          firebaseInitialized = true;
        } catch (envError) {
          console.error("❌ Firebase initialization from env failed:", envError.message);
          throw envError;
        }
      } else {
        console.error("❌ Firebase initialization error:", error.message);
        console.error(
          "📝 Make sure serviceAccountKey.json exists in the backend directory",
        );
        console.error(
          "   Or set FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL environment variables",
        );
        console.error(
          "🔗 Download from: Firebase Console > Project Settings > Service Accounts",
        );
        throw error;
      }
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
