/**
 * Authentication Routes
 *
 * Handles authentication-related endpoints:
 * - POST /api/v1/auth/verify - Verify Firebase token and return user info
 */

const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { db } = require("../firebase");

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
router.post("/verify", verifyToken, async (req, res) => {
  try {
    const { uid, email, name, picture } = req.user;

    // Check if user exists in Firestore
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();

    let userData;

    if (!userDoc.exists) {
      // User doesn't exist in database, create a new user document
      // Default role is 'contributor' unless specified otherwise
      const requestedRole = req.body?.role || "contributor";
      const validRoles = ["viewer", "contributor", "admin"];
      const userRole = validRoles.includes(requestedRole)
        ? requestedRole
        : "contributor";

      userData = {
        uid,
        email,
        name: name || "",
        photoURL: picture || "",
        role: userRole,
        viewerOnly: userRole === "viewer",
        canComment: true, // All users can comment
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await userRef.set(userData);

      return res.status(201).json({
        success: true,
        message: "User authenticated and created",
        user: userData,
      });
    } else {
      // User exists, return existing data
      userData = userDoc.data();

      // Update user data if it's missing (e.g. name/photo)
      const needsUpdate =
        (!userData.name && name) || (!userData.photoURL && picture);

      if (needsUpdate) {
        if (!userData.name && name) userData.name = name;
        if (!userData.photoURL && picture) userData.photoURL = picture;
        userData.updatedAt = new Date().toISOString();

        await userRef.update(userData);
      }

      return res.status(200).json({
        success: true,
        message: "User authenticated",
        user: userData,
      });
    }
  } catch (error) {
    console.error("Auth verification error:", error.message);

    return res.status(500).json({
      success: false,
      error: "InternalServerError",
      message: "Failed to verify authentication",
    });
  }
});

/**
 * POST /api/v1/auth/register-viewer
 *
 * Registers a new viewer-only account (lightweight registration)
 *
 * Headers:
 *   Authorization: Bearer <firebase-id-token>
 *
 * Body:
 *   { role: "viewer" } (optional - defaults to viewer)
 *
 * Response:
 *   201: { success: true, user: {...} }
 *   400: { success: false, error: 'ValidationError', message: '...' }
 */
router.post("/register-viewer", verifyToken, async (req, res) => {
  try {
    const { uid, email, name, picture } = req.user;

    // Check if user already exists
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      return res.status(400).json({
        success: false,
        error: "UserAlreadyExists",
        message: "User already registered",
      });
    }

    // Create viewer account
    const userData = {
      uid,
      email,
      name: name || "",
      photoURL: picture || "",
      role: "viewer",
      viewerOnly: true,
      canComment: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await userRef.set(userData);

    return res.status(201).json({
      success: true,
      message: "Viewer account created successfully",
      user: userData,
    });
  } catch (error) {
    console.error("Viewer registration error:", error.message);

    return res.status(500).json({
      success: false,
      error: "InternalServerError",
      message: "Failed to register viewer account",
    });
  }
});

/**
 * PUT /api/v1/auth/upgrade-role
 *
 * Upgrades a viewer account to contributor or other role
 *
 * Headers:
 *   Authorization: Bearer <firebase-id-token>
 *
 * Body:
 *   { newRole: "contributor" | "admin" }
 *
 * Response:
 *   200: { success: true, user: {...} }
 *   400: { success: false, error: 'ValidationError', message: '...' }
 *   403: { success: false, error: 'Forbidden', message: '...' }
 */
router.put("/upgrade-role", verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const { newRole } = req.body;

    if (!newRole) {
      return res.status(400).json({
        success: false,
        error: "ValidationError",
        message: "newRole is required",
      });
    }

    const validRoles = ["viewer", "contributor", "admin"];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({
        success: false,
        error: "ValidationError",
        message: "Invalid role. Must be: viewer, contributor, or admin",
      });
    }

    // Get current user
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: "NotFound",
        message: "User not found",
      });
    }

    const userData = userDoc.data();

    // Check if upgrading to admin (requires admin permission)
    if (newRole === "admin" && userData.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Forbidden",
        message: "Only admins can grant admin role",
      });
    }

    // Update role
    const updatedData = {
      role: newRole,
      viewerOnly: newRole === "viewer",
      updatedAt: new Date().toISOString(),
    };

    await userRef.update(updatedData);

    const updatedUser = { ...userData, ...updatedData };

    return res.status(200).json({
      success: true,
      message: `Role upgraded to ${newRole}`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Role upgrade error:", error.message);

    return res.status(500).json({
      success: false,
      error: "InternalServerError",
      message: "Failed to upgrade role",
    });
  }
});

/**
 * GET /api/v1/auth/me
 *
 * Returns current authenticated user information
 *
 * Headers:
 *   Authorization: Bearer <firebase-id-token>
 *
 * Response:
 *   200: { success: true, user: {...} }
 *   404: { success: false, error: 'NotFound', message: '...' }
 */
router.get("/me", verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;

    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: "NotFound",
        message: "User not found",
      });
    }

    const userData = userDoc.data();

    return res.status(200).json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error("Get user error:", error.message);

    return res.status(500).json({
      success: false,
      error: "InternalServerError",
      message: "Failed to get user information",
    });
  }
});

module.exports = router;
