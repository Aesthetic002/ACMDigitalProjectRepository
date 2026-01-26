/**
 * Admin & Moderation Routes
 *
 * Handles admin operations:
 * - POST /api/v1/admin/projects/:projectId/review - Review/approve/reject projects
 * - POST /api/v1/admin/projects/:projectId/feature - Feature/unfeature projects
 * - GET /api/v1/admin/analytics - Get platform analytics
 */

const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/admin");
const { db } = require("../firebase");

/**
 * POST /api/v1/admin/projects/:projectId/review
 *
 * Review a project (approve, reject, or reset status).
 * Admin only.
 *
 * Body:
 *   - action: 'approve' | 'reject' | 'pending' (required)
 *   - notes: string (optional) - Review notes
 *
 * Response:
 *   200: { success: true, project: {...} }
 *   400: { success: false, error: 'ValidationError', message: '...' }
 *   403: { success: false, error: 'Forbidden', message: '...' }
 *   404: { success: false, error: 'NotFound', message: '...' }
 */
router.post(
  "/projects/:projectId/review",
  verifyToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { projectId } = req.params;
      const { action, notes } = req.body;
      const authenticatedUid = req.user.uid;

      // Validate action
      const validActions = ["approve", "reject", "pending"];
      if (!action || !validActions.includes(action)) {
        return res.status(400).json({
          success: false,
          error: "ValidationError",
          message: `Action must be one of: ${validActions.join(", ")}`,
        });
      }

      // Check if project exists
      const projectRef = db.collection("projects").doc(projectId);
      const projectDoc = await projectRef.get();

      if (!projectDoc.exists) {
        return res.status(404).json({
          success: false,
          error: "NotFound",
          message: "Project not found",
        });
      }

      const projectData = projectDoc.data();

      if (projectData.isDeleted) {
        return res.status(404).json({
          success: false,
          error: "NotFound",
          message: "Project not found",
        });
      }

      // Update project with review information
      const reviewStatus =
        action === "pending"
          ? "pending"
          : action === "approve"
            ? "approved"
            : "rejected";

      const updateData = {
        status: reviewStatus,
        updatedAt: new Date().toISOString(),
        moderation: {
          status: reviewStatus,
          reviewedBy: authenticatedUid,
          reviewedAt: new Date().toISOString(),
          ...(notes && { notes: notes.trim() }),
        },
      };

      await projectRef.update(updateData);

      // Fetch and return updated project
      const updatedDoc = await projectRef.get();
      const updatedProjectData = updatedDoc.data();

      return res.status(200).json({
        success: true,
        message: `Project ${reviewStatus} successfully`,
        project: {
          id: projectId,
          ...updatedProjectData,
        },
      });
    } catch (error) {
      console.error("Review project error:", error.message);

      return res.status(500).json({
        success: false,
        error: "InternalServerError",
        message: "Failed to review project",
      });
    }
  },
);

/**
 * POST /api/v1/admin/projects/:projectId/feature
 *
 * Feature or unfeature a project (highlight on platform).
 * Admin only.
 *
 * Body:
 *   - featured: boolean (required) - true to feature, false to unfeature
 *
 * Response:
 *   200: { success: true, project: {...} }
 *   400: { success: false, error: 'ValidationError', message: '...' }
 *   403: { success: false, error: 'Forbidden', message: '...' }
 *   404: { success: false, error: 'NotFound', message: '...' }
 */
router.post(
  "/projects/:projectId/feature",
  verifyToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { projectId } = req.params;
      const { featured } = req.body;
      const authenticatedUid = req.user.uid;

      // Validate featured parameter
      if (typeof featured !== "boolean") {
        return res.status(400).json({
          success: false,
          error: "ValidationError",
          message: "Featured must be a boolean (true or false)",
        });
      }

      // Check if project exists
      const projectRef = db.collection("projects").doc(projectId);
      const projectDoc = await projectRef.get();

      if (!projectDoc.exists) {
        return res.status(404).json({
          success: false,
          error: "NotFound",
          message: "Project not found",
        });
      }

      const projectData = projectDoc.data();

      if (projectData.isDeleted) {
        return res.status(404).json({
          success: false,
          error: "NotFound",
          message: "Project not found",
        });
      }

      // Update project with feature status
      const updateData = {
        isFeatured: featured,
        updatedAt: new Date().toISOString(),
      };

      if (featured) {
        updateData.featuredAt = new Date().toISOString();
        updateData.featuredBy = authenticatedUid;
      } else {
        // Remove featured fields if unfeaturing
        // Note: Firestore doesn't support delete field in update, so we set to null or omit
        updateData.featuredAt = null;
        updateData.featuredBy = null;
      }

      await projectRef.update(updateData);

      // Fetch and return updated project
      const updatedDoc = await projectRef.get();
      const updatedProjectData = updatedDoc.data();

      return res.status(200).json({
        success: true,
        message: featured
          ? "Project featured successfully"
          : "Project unfeatured successfully",
        project: {
          id: projectId,
          ...updatedProjectData,
        },
      });
    } catch (error) {
      console.error("Feature project error:", error.message);

      return res.status(500).json({
        success: false,
        error: "InternalServerError",
        message: "Failed to update project feature status",
      });
    }
  },
);

/**
 * GET /api/v1/admin/analytics
 *
 * Get platform analytics and statistics.
 * Admin only.
 *
 * Response:
 *   200: {
 *     success: true,
 *     analytics: {
 *       totalProjects: number,
 *       totalUsers: number,
 *       totalAdmins: number,
 *       projectsByStatus: { pending, approved, rejected },
 *       recentProjects: [...],
 *       topTechStack: [...],
 *       timestamp: ISO timestamp
 *     }
 *   }
 */
router.get("/analytics", verifyToken, requireAdmin, async (req, res) => {
  try {
    const analytics = {};

    // Count total projects (non-deleted)
    const projectsSnapshot = await db
      .collection("projects")
      .where("isDeleted", "==", false)
      .get();

    analytics.totalProjects = projectsSnapshot.size;

    // Count projects by status
    const projectsByStatus = {
      pending: 0,
      approved: 0,
      rejected: 0,
    };

    const techStackCounts = {};
    const recentProjects = [];

    projectsSnapshot.forEach((doc) => {
      const project = doc.data();

      // Count by status
      const status = project.status || "pending";
      if (status in projectsByStatus) {
        projectsByStatus[status]++;
      }

      // Count tech stack usage
      if (project.techStack && Array.isArray(project.techStack)) {
        project.techStack.forEach((tech) => {
          techStackCounts[tech] = (techStackCounts[tech] || 0) + 1;
        });
      }

      // Collect recent projects
      recentProjects.push({
        id: doc.id,
        title: project.title,
        status: status,
        createdAt: project.createdAt,
        ownerId: project.ownerId,
      });
    });

    analytics.projectsByStatus = projectsByStatus;

    // Sort and limit recent projects
    recentProjects.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
    analytics.recentProjects = recentProjects.slice(0, 10);

    // Get top tech stack
    analytics.topTechStack = Object.entries(techStackCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tech, count]) => ({ tech, count }));

    // Count total users
    const usersSnapshot = await db.collection("users").get();
    analytics.totalUsers = usersSnapshot.size;

    // Count admins
    let adminCount = 0;
    usersSnapshot.forEach((doc) => {
      if (doc.data().role === "admin") {
        adminCount++;
      }
    });
    analytics.totalAdmins = adminCount;

    // Count total tags
    const tagsSnapshot = await db.collection("tags").get();
    analytics.totalTags = tagsSnapshot.size;

    // Get featured projects
    const featuredSnapshot = await db
      .collection("projects")
      .where("isDeleted", "==", false)
      .where("isFeatured", "==", true)
      .get();
    analytics.totalFeaturedProjects = featuredSnapshot.size;

    // Get approved projects
    analytics.approvedProjects = projectsByStatus.approved || 0;

    analytics.timestamp = new Date().toISOString();

    return res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error("Analytics error:", error.message);

    return res.status(500).json({
      success: false,
      error: "InternalServerError",
      message: "Failed to retrieve analytics",
    });
  }
});

module.exports = router;
