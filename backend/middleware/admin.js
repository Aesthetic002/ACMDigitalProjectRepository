/**
 * Admin Authorization Middleware
 *
 * Verifies that authenticated user has admin role.
 * Must be used after verifyToken middleware.
 */

const { db } = require("../firebase");

/**
 * Middleware to check if user has admin role
 *
 * Requires: verifyToken to be run first (req.user must be set)
 * Returns: 403 if user is not admin
 */
const requireAdmin = async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.uid) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
        message: "Authentication required",
      });
    }

    // Get user from Firestore
    const userDoc = await db.collection("users").doc(req.user.uid).get();

    // Check if user exists and has admin role
    if (!userDoc.exists) {
      return res.status(403).json({
        success: false,
        error: "Forbidden",
        message: "User not found in database",
      });
    }

    const userData = userDoc.data();

    if (userData.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Forbidden",
        message: "Admin access required",
      });
    }

    // Attach user data to request
    req.user.role = userData.role;
    req.user.name = userData.name;

    next();
  } catch (error) {
    console.error("Admin verification error:", error.message);

    return res.status(500).json({
      success: false,
      error: "InternalServerError",
      message: "Failed to verify admin access",
    });
  }
};

module.exports = { requireAdmin };
