/**
 * Role Authorization Middleware
 *
 * Supports three roles: viewer, contributor, admin
 * - viewer: Can only view projects (default)
 * - contributor: Can create/edit own projects + view
 * - admin: Full access
 */

const { db } = require("../firebase");

// Valid roles in hierarchy order (lowest to highest)
const VALID_ROLES = ["viewer", "contributor", "admin"];

// Role hierarchy check
const hasRole = (userRole, requiredRole) => {
  const userRoleIndex = VALID_ROLES.indexOf(userRole);
  const requiredRoleIndex = VALID_ROLES.indexOf(requiredRole);
  return userRoleIndex >= requiredRoleIndex;
};

/**
 * Middleware to check if user has admin role
 */
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.uid) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
        message: "Authentication required",
      });
    }

    const userDoc = await db.collection("users").doc(req.user.uid).get();

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

/**
 * Middleware to check if user is at least a contributor (can create projects)
 */
const requireContributor = async (req, res, next) => {
  try {
    if (!req.user || !req.user.uid) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
        message: "Authentication required",
      });
    }

    const userDoc = await db.collection("users").doc(req.user.uid).get();

    if (!userDoc.exists) {
      return res.status(403).json({
        success: false,
        error: "Forbidden",
        message: "User not found in database",
      });
    }

    const userData = userDoc.data();

    // Check if user is contributor or admin
    if (!hasRole(userData.role, "contributor")) {
      return res.status(403).json({
        success: false,
        error: "Forbidden",
        message: "Contributor access required. Contact an admin to upgrade your role.",
      });
    }

    req.user.role = userData.role;
    req.user.name = userData.name;

    next();
  } catch (error) {
    console.error("Contributor verification error:", error.message);

    return res.status(500).json({
      success: false,
      error: "InternalServerError",
      message: "Failed to verify contributor access",
    });
  }
};

module.exports = { requireAdmin, requireContributor, VALID_ROLES, hasRole };
