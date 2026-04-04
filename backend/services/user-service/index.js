/**
 * User Service - gRPC Microservice
 * Handles:
 * - User CRUD operations
 * - User profile management
 * - User role management
 */

const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");
require("dotenv").config();

const { admin, db, auth } = require("../firebase");

// Load user proto
const userProtoPath = path.join(__dirname, "../proto/user.proto");
const userPackageDef = protoLoader.loadSync(userProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const userProto = grpc.loadPackageDefinition(userPackageDef);

/**
 * GetUser - Get a user by ID
 */
async function getUser(call, callback) {
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
      return callback({
        code: grpc.status.NOT_FOUND,
        message: "User not found",
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
      created_at: userData.createdAt || 0,
      updated_at: userData.updatedAt || 0,
      projects: userData.projects || [],
    });
  } catch (error) {
    console.error("GetUser error:", error);
    callback({
      code: grpc.status.INTERNAL,
      message: error.message,
    });
  }
}

/**
 * ListUsers - List users with filters
 */
async function listUsers(call, callback) {
  try {
    const { limit = 50, offset = 0, role, exclude_ids } = call.request;

    let query = db.collection("users");

    // Filter by role if provided
    if (role) {
      query = query.where("role", "==", role);
    }

    const snapshot = await query.limit(limit).offset(offset).get();

    const users = [];
    snapshot.forEach((doc) => {
      const userData = doc.data();

      // Exclude specific users if requested
      if (exclude_ids && exclude_ids.includes(userData.uid)) {
        return;
      }

      users.push({
        uid: userData.uid,
        email: userData.email,
        name: userData.name,
        role: userData.role || "viewer",
        avatar: userData.avatar || "",
        email_verified: userData.emailVerified || false,
        created_at: userData.createdAt || 0,
        updated_at: userData.updatedAt || 0,
        projects: userData.projects || [],
      });
    });

    // Get total count
    const totalSnapshot = await db.collection("users").get();
    const total = totalSnapshot.size;

    callback(null, {
      users,
      total,
    });
  } catch (error) {
    console.error("ListUsers error:", error);
    callback({
      code: grpc.status.INTERNAL,
      message: error.message,
    });
  }
}

/**
 * CreateUser - Create a new user
 */
async function createUser(call, callback) {
  try {
    const { email, name, password, role, avatar } = call.request;

    if (!email || !password) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: "Email and password are required",
      });
    }

    // Create Firebase Auth user
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name || email,
      photoURL: avatar || "",
    });

    // Create Firestore user profile
    const newUserData = {
      uid: userRecord.uid,
      email: userRecord.email,
      name: name || email,
      avatar: avatar || "",
      role: role || "viewer",
      emailVerified: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      projects: [],
    };

    await db.collection("users").doc(userRecord.uid).set(newUserData);

    callback(null, {
      uid: newUserData.uid,
      email: newUserData.email,
      name: newUserData.name,
      role: newUserData.role,
      avatar: newUserData.avatar,
      email_verified: newUserData.emailVerified,
      created_at: newUserData.createdAt,
      updated_at: newUserData.updatedAt,
      projects: newUserData.projects,
    });
  } catch (error) {
    console.error("CreateUser error:", error);
    callback({
      code: grpc.status.INTERNAL,
      message: error.message,
    });
  }
}

/**
 * UpdateUser - Update existing user
 */
async function updateUser(call, callback) {
  try {
    const { user_id, name, avatar, role } = call.request;

    if (!user_id) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: "User ID is required",
      });
    }

    const userDoc = await db.collection("users").doc(user_id).get();

    if (!userDoc.exists) {
      return callback({
        code: grpc.status.NOT_FOUND,
        message: "User not found",
      });
    }

    const updateData = {
      updatedAt: Date.now(),
    };

    if (name) updateData.name = name;
    if (avatar) updateData.avatar = avatar;
    if (role) updateData.role = role;

    await db.collection("users").doc(user_id).update(updateData);

    const updatedDoc = await db.collection("users").doc(user_id).get();
    const userData = updatedDoc.data();

    callback(null, {
      uid: userData.uid,
      email: userData.email,
      name: userData.name,
      role: userData.role || "viewer",
      avatar: userData.avatar || "",
      email_verified: userData.emailVerified || false,
      created_at: userData.createdAt || 0,
      updated_at: userData.updatedAt || 0,
      projects: userData.projects || [],
    });
  } catch (error) {
    console.error("UpdateUser error:", error);
    callback({
      code: grpc.status.INTERNAL,
      message: error.message,
    });
  }
}

/**
 * DeleteUser - Delete a user
 */
async function deleteUser(call, callback) {
  try {
    const { user_id } = call.request;

    if (!user_id) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: "User ID is required",
      });
    }

    // Delete from Firebase Auth
    try {
      await auth.deleteUser(user_id);
    } catch (authError) {
      console.warn(`Could not delete user from Firebase Auth: ${authError}`);
    }

    // Delete from Firestore
    await db.collection("users").doc(user_id).delete();

    callback(null, {
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("DeleteUser error:", error);
    callback({
      code: grpc.status.INTERNAL,
      message: error.message,
    });
  }
}

/**
 * GetUsersByRole - Get users with specific role
 */
async function getUsersByRole(call, callback) {
  try {
    const { role, limit = 50, offset = 0 } = call.request;

    if (!role) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: "Role is required",
      });
    }

    const snapshot = await db
      .collection("users")
      .where("role", "==", role)
      .limit(limit)
      .offset(offset)
      .get();

    const users = [];
    snapshot.forEach((doc) => {
      const userData = doc.data();
      users.push({
        uid: userData.uid,
        email: userData.email,
        name: userData.name,
        role: userData.role || "viewer",
        avatar: userData.avatar || "",
        email_verified: userData.emailVerified || false,
        created_at: userData.createdAt || 0,
        updated_at: userData.updatedAt || 0,
        projects: userData.projects || [],
      });
    });

    const totalSnapshot = await db
      .collection("users")
      .where("role", "==", role)
      .get();

    callback(null, {
      users,
      total: totalSnapshot.size,
    });
  } catch (error) {
    console.error("GetUsersByRole error:", error);
    callback({
      code: grpc.status.INTERNAL,
      message: error.message,
    });
  }
}

/**
 * Create and start gRPC server
 */
function startUserService() {
  const server = new grpc.Server();

  server.addService(userProto.acm.user.UserService.service, {
    getUser,
    listUsers,
    createUser,
    updateUser,
    deleteUser,
    getUsersByRole,
  });

  const PORT = process.env.USER_SERVICE_PORT || 50052;

  server.bindAsync(
    `0.0.0.0:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error("❌ Failed to start User Service:", err);
        process.exit(1);
      }

      console.log(`\n👥 User Service started`);
      console.log(`📡 Listening on port ${port}`);
      console.log(`⏰ Started at ${new Date().toISOString()}\n`);
    }
  );
}

// Start service
startUserService();

console.log("🚀 User Service initializing...");
