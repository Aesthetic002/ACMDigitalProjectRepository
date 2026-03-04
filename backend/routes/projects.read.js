/**
 * Project READ & Discovery Routes
 *
 * Handles project read operations:
 * - GET /api/v1/projects - List all projects with pagination and filtering
 * - GET /api/v1/projects/:projectId - Get a specific project
 */

const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { db } = require("../firebase");
const storageService = require("../services/storage.service");

/**
 * GET /api/v1/projects
 *
 * Lists all projects with pagination and filtering.
 * No authentication required for public read, but optional for analytics.
 *
 * Query Parameters:
 *   - limit: Number of results per page (default: 20, max: 100)
 *   - pageToken: Pagination token from previous response
 *   - status: Filter by status ('pending', 'approved', 'rejected')
 *   - techStack: Filter by technology (e.g., 'React', 'Node.js')
 *   - ownerId: Filter by project owner
 *
 * Response:
 *   200: { success: true, projects: [...], nextPageToken?: "...", count: number }
 *   400: { success: false, error: 'ValidationError', message: '...' }
 */
router.get("/", async (req, res) => {
  try {
    const { limit = 20, pageToken, status, techStack, ownerId } = req.query;

    // Validate limit
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        error: "ValidationError",
        message: "Limit must be between 1 and 100",
      });
    }

    // Validate status filter if provided
    if (status) {
      const validStatuses = ["pending", "approved", "rejected"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: "ValidationError",
          message: `Status must be one of: ${validStatuses.join(", ")}`,
        });
      }
    }

    // Build base query - ordered by createdAt DESC
    let query = db.collection("projects").orderBy("createdAt", "desc");

    // Check if we have pagination token and apply it
    if (pageToken) {
      const decodedToken = Buffer.from(pageToken, "base64").toString("utf-8");
      const lastDocId = decodedToken;

      // Get the last document to start after
      const lastDocSnap = await db.collection("projects").doc(lastDocId).get();

      if (lastDocSnap.exists) {
        query = query.startAfter(lastDocSnap);
      }
    }

    // Execute query with extra limit to detect if more results exist
    let snapshot = await query.limit(limitNum + 1).get();

    // Extract projects with filters applied in memory
    const projects = [];
    let hasMore = false;
    let lastDocId = null;

    snapshot.forEach((doc, index) => {
      const projectData = doc.data();

      // Skip deleted projects
      if (projectData.isDeleted) {
        return;
      }

      // Filter by status if provided
      if (status && projectData.status !== status) {
        return;
      }

      // Filter by ownerId if provided
      if (ownerId && projectData.ownerId !== ownerId) {
        return;
      }

      // Filter by techStack if provided
      if (techStack && !projectData.techStack.includes(techStack)) {
        return;
      }

      // Only add if within limit
      if (projects.length < limitNum) {
        projects.push({
          id: doc.id,
          ...projectData,
        });
        lastDocId = doc.id;
      } else {
        hasMore = true;
      }
    });

    // Generate next page token if more results exist
    let nextPageToken = null;
    if (hasMore && lastDocId) {
      nextPageToken = Buffer.from(lastDocId).toString("base64");
    }

    return res.status(200).json({
      success: true,
      projects,
      count: projects.length,
      ...(nextPageToken && { nextPageToken }),
    });
  } catch (error) {
    console.error("List projects error:", error.message);

    return res.status(500).json({
      success: false,
      error: "InternalServerError",
      message: "Failed to retrieve projects",
    });
  }
});

/**
 * GET /api/v1/projects/:projectId
 *
 * Retrieves a specific project by ID.
 * No authentication required for public read.
 * Returns 404 if project is deleted or not found.
 *
 * Response:
 *   200: { success: true, project: {...} }
 *   404: { success: false, error: 'NotFound', message: 'Project not found' }
 */
router.get("/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;

    // Fetch project from Firestore
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

    // Check if project is soft-deleted
    if (projectData.isDeleted) {
      return res.status(404).json({
        success: false,
        error: "NotFound",
        message: "Project not found",
      });
    }

    // Get project assets if available
    let assets = [];
    try {
      const assetsSnapshot = await projectRef.collection("assets").get();
      assets = await Promise.all(assetsSnapshot.docs.map(async (doc) => {
        const data = doc.data();
        let url = '';
        try {
          url = await storageService.generateSignedDownloadUrl(data.storagePath);
        } catch (e) {
          console.error(`Failed to generate signed URL for asset ${doc.id}:`, e.message);
        }
        return {
          id: doc.id,
          ...data,
          url
        };
      }));
    } catch (error) {
      // Assets collection may not exist yet, which is fine
      console.log("Assets not available for project:", projectId);
    }

    return res.status(200).json({
      success: true,
      project: {
        id: projectId,
        ...projectData,
        assets: assets.length > 0 ? assets : undefined,
      },
    });
  } catch (error) {
    console.error("Get project error:", error.message);

    return res.status(500).json({
      success: false,
      error: "InternalServerError",
      message: "Failed to retrieve project",
    });
  }
});

module.exports = router;
