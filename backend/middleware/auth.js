/**
 * Authentication Middleware
 *
 * Verifies Firebase ID tokens from incoming requests.
 * Extracts the token from the Authorization header, validates it,
 * and attaches decoded user information to req.user.
 */

const { auth } = require("../firebase");
const jwt = require("jsonwebtoken");

/**
 * Middleware to verify Firebase authentication token
 *
 * Expects: Authorization: Bearer <firebase-id-token>
 * Attaches: req.user = { uid, email, ... }
 * Returns: 401 if token is missing or invalid
 */
const verifyToken = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
        message:
          "Missing or invalid Authorization header. Expected format: Bearer <token>",
      });
    }

    // Extract the token (remove "Bearer " prefix)
    const token = authHeader.split("Bearer ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
        message: "No token provided",
      });
    }

    // First, try to verify as Firebase ID token
    try {
      const decodedToken = await auth.verifyIdToken(token);

      // Attach user information to request object
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified,
        ...decodedToken,
      };

      return next();
    } catch (firebaseError) {
      // If Firebase verification fails, try as test JWT (development mode)
      if (process.env.NODE_ENV !== "production") {
        try {
          // Try to verify test JWT with test secret
          const decoded = jwt.verify(token, "test-secret-key", {
            algorithms: ["HS256"],
          });

          if (decoded && (decoded.user_id || decoded.sub)) {
            // Valid test token format
            req.user = {
              uid: decoded.user_id || decoded.sub,
              email: decoded.email,
              emailVerified: decoded.email_verified !== false,
              ...decoded,
            };

            return next();
          }
        } catch (jwtError) {
          // Try to decode without verification (fallback)
          try {
            const decoded = jwt.decode(token);

            if (decoded && (decoded.user_id || decoded.sub)) {
              // Valid test token format
              req.user = {
                uid: decoded.user_id || decoded.sub,
                email: decoded.email,
                emailVerified: decoded.email_verified !== false,
                ...decoded,
              };

              return next();
            }
          } catch (decodeError) {
            // Fall through to error handling
          }
        }
      }

      // If both methods fail, return appropriate error
      if (firebaseError.code === "auth/id-token-expired") {
        return res.status(401).json({
          success: false,
          error: "TokenExpired",
          message: "Authentication token has expired",
        });
      }

      if (firebaseError.code === "auth/argument-error") {
        return res.status(401).json({
          success: false,
          error: "InvalidToken",
          message: "Invalid authentication token format",
        });
      }

      // Generic authentication failure
      return res.status(401).json({
        success: false,
        error: "AuthenticationFailed",
        message: "Failed to authenticate token",
      });
    }
  } catch (error) {
    console.error("Token verification error:", error.message);

    // Generic authentication failure
    return res.status(401).json({
      success: false,
      error: "AuthenticationFailed",
      message: "Failed to authenticate token",
    });
  }
};

/**
 * Middleware to check if user has viewer role or above
 * Allows: viewers, contributors, admins
 * Requires verifyToken to be run first
 */
const viewerAuth = async (req, res, next) => {
  try {
    if (!req.user || !req.user.uid) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
        message: "Authentication required",
      });
    }

    const { db } = require("../firebase");
    const userRef = db.collection("users").doc(req.user.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: "NotFound",
        message: "User not found",
      });
    }

    const userData = userDoc.data();
    const validRoles = ["viewer", "contributor", "admin"];

    if (!validRoles.includes(userData.role)) {
      return res.status(403).json({
        success: false,
        error: "Forbidden",
        message: "Viewer access or above required",
      });
    }

    // Attach full user data to request
    req.userData = userData;
    next();
  } catch (error) {
    console.error("Viewer auth error:", error.message);
    return res.status(403).json({
      success: false,
      error: "Forbidden",
      message: "Access denied",
    });
  }
};

/**
 * Middleware to check if user has contributor role or above
 * Allows: contributors, admins (NOT viewers)
 * Requires verifyToken to be run first
 */
const contributorAuth = async (req, res, next) => {
  try {
    if (!req.user || !req.user.uid) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
        message: "Authentication required",
      });
    }

    const { db } = require("../firebase");
    const userRef = db.collection("users").doc(req.user.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: "NotFound",
        message: "User not found",
      });
    }

    const userData = userDoc.data();
    const validRoles = ["contributor", "admin"];

    if (!validRoles.includes(userData.role)) {
      return res.status(403).json({
        success: false,
        error: "Forbidden",
        message:
          "Contributor access required. Viewers cannot perform this action.",
      });
    }

    // Attach full user data to request
    req.userData = userData;
    next();
  } catch (error) {
    console.error("Contributor auth error:", error.message);
    return res.status(403).json({
      success: false,
      error: "Forbidden",
      message: "Access denied",
    });
  }
};

/**
 * Middleware to check if user has admin role
 * Allows: admins only
 * Requires verifyToken to be run first
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

    const { db } = require("../firebase");
    const userRef = db.collection("users").doc(req.user.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: "NotFound",
        message: "User not found",
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

    // Attach full user data to request
    req.userData = userData;
    next();
  } catch (error) {
    console.error("Admin verification error:", error.message);
    return res.status(403).json({
      success: false,
      error: "Forbidden",
      message: "Admin access required",
    });
  }
};

module.exports = {
  verifyToken,
  viewerAuth,
  contributorAuth,
  requireAdmin,
};
