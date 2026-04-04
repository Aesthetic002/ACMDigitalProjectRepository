/**
 * Auth Service - gRPC Microservice
 * Handles:
 * - Token validation
 * - User verification
 * - Admin role checking
 */

const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");
require("dotenv").config();

const { admin, db, auth } = require("../firebase");

// Helper to convert Firestore timestamps to milliseconds
function toTimestamp(value) {
  if (!value) return 0;
  if (typeof value === 'number') return value;
  if (value.toMillis) return value.toMillis();
  if (value._seconds) return value._seconds * 1000;
  return 0;
}

// Load auth proto - go up two levels from services/auth-service to backend/proto
const authProtoPath = path.join(__dirname, "../../proto/auth.proto");
const authPackageDef = protoLoader.loadSync(authProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const authProto = grpc.loadPackageDefinition(authPackageDef);

/**
 * ValidateToken - Quick token validation without full user data
 */
async function validateToken(call, callback) {
  try {
    const { token } = call.request;

    if (!token) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: "Token is required",
      });
    }

    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(token);
    } catch (firebaseError) {
      // Fall back to test JWT in development
      if (process.env.NODE_ENV !== "production") {
        try {
          const jwt = require("jsonwebtoken");
          decodedToken = jwt.verify(token, "test-secret-key");
        } catch (testError) {
          return callback({
            code: grpc.status.UNAUTHENTICATED,
            message: "Invalid token",
          });
        }
      } else {
        return callback({
          code: grpc.status.UNAUTHENTICATED,
          message: "Invalid token",
        });
      }
    }

    // Get user role from Firestore
    let userDoc = await db.collection("users").doc(decodedToken.uid).get();
    const role = userDoc.exists ? userDoc.data().role || "viewer" : "viewer";

    callback(null, {
      user_id: decodedToken.uid,
      email: decodedToken.email,
      role: role,
      email_verified: decodedToken.email_verified || false,
    });
  } catch (error) {
    console.error("ValidateToken error:", error);
    callback({
      code: grpc.status.INTERNAL,
      message: error.message,
    });
  }
}

/**
 * VerifyIdToken - Full verification with user profile
 */
async function verifyIdToken(call, callback) {
  try {
    const { token } = call.request;

    if (!token) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: "Token is required",
      });
    }

    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(token);
    } catch (firebaseError) {
      if (process.env.NODE_ENV !== "production") {
        try {
          const jwt = require("jsonwebtoken");
          decodedToken = jwt.verify(token, "test-secret-key");
        } catch (testError) {
          return callback({
            code: grpc.status.UNAUTHENTICATED,
            message: "Invalid token",
          });
        }
      } else {
        return callback({
          code: grpc.status.UNAUTHENTICATED,
          message: "Invalid token",
        });
      }
    }

    // Get or create user profile
    let userDoc = await db.collection("users").doc(decodedToken.uid).get();

    if (!userDoc.exists) {
      // Create new user profile
      const newUserData = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || "Anonymous",
        avatar: decodedToken.picture || "",
        role: "viewer",
        emailVerified: decodedToken.email_verified || false,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      };
      await db.collection("users").doc(decodedToken.uid).set(newUserData);
      userDoc = await db.collection("users").doc(decodedToken.uid).get();
    } else {
      // Update last access time
      await db.collection("users").doc(decodedToken.uid).update({
        updatedAt: new Date().getTime(),
      });
    }

    const userData = userDoc.data();

    callback(null, {
      uid: userData.uid,
      email: userData.email,
      name: userData.name,
      role: userData.role || "viewer",
      avatar: userData.avatar || "",
      email_verified: userData.emailVerified || false,
      created_at: toTimestamp(userData.createdAt) || Date.now(),
      updated_at: toTimestamp(userData.updatedAt) || Date.now(),
    });
  } catch (error) {
    console.error("VerifyIdToken error:", error);
    callback({
      code: grpc.status.INTERNAL,
      message: error.message,
    });
  }
}

/**
 * CheckAdmin - Check if user has admin role
 */
async function checkAdmin(call, callback) {
  try {
    const { user_id } = call.request;

    if (!user_id) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: "User ID is required",
      });
    }

    const userDoc = await db.collection("users").doc(user_id).get();

    if (!userDoc.exists) {
      return callback(null, {
        is_admin: false,
        role: "viewer",
      });
    }

    const role = userDoc.data().role || "viewer";
    const isAdmin = role === "admin";

    callback(null, {
      is_admin: isAdmin,
      role: role,
    });
  } catch (error) {
    console.error("CheckAdmin error:", error);
    callback({
      code: grpc.status.INTERNAL,
      message: error.message,
    });
  }
}

/**
 * Create and start gRPC server
 */
function startAuthService() {
  const server = new grpc.Server();

  server.addService(authProto.acm.auth.AuthService.service, {
    validateToken,
    verifyIdToken,
    checkAdmin,
  });

  const PORT = process.env.AUTH_SERVICE_PORT || 50051;

  server.bindAsync(
    `0.0.0.0:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error("❌ Failed to start Auth Service:", err);
        process.exit(1);
      }

      console.log(`\n🔐 Auth Service started`);
      console.log(`📡 Listening on port ${port}`);
      console.log(`⏰ Started at ${new Date().toISOString()}\n`);
    }
  );
}

// Start service
startAuthService();

console.log("🚀 Auth Service initializing...");
