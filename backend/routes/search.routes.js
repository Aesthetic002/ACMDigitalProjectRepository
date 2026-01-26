/**
 * Search Routes
 *
 * Handles full-text and keyword search across projects and users.
 * Phase 1: Firestore-based search (no external services)
 */

const express = require("express");
const router = express.Router();
const { db } = require("../firebase");

/**
 * GET /api/v1/search
 *
 * Searches projects and/or users by query string.
 *
 * Query Parameters:
 *   - q: Search query (required, min 1 char)
 *   - type: 'projects' | 'users' | 'all' (default: 'all')
 *   - limit: Max results (default: 20, max: 100)
 *
 * Response:
 *   200: { success: true, results: [...], type: "projects|users|all", count: number }
 *   400: { success: false, error: 'ValidationError', message: '...' }
 */
router.get("/", async (req, res) => {
  try {
    const { q, type = "all", limit = 20 } = req.query;

    // Validate query
    if (!q || q.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "ValidationError",
        message: 'Query parameter "q" is required and must not be empty',
      });
    }

    const query = q.trim().toLowerCase();

    // Validate type
    const validTypes = ["projects", "users", "all"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: "ValidationError",
        message: `Type must be one of: ${validTypes.join(", ")}`,
      });
    }

    // Validate limit
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        error: "ValidationError",
        message: "Limit must be between 1 and 100",
      });
    }

    const results = [];

    // Search projects
    if (type === "projects" || type === "all") {
      try {
        const projectsSnapshot = await db
          .collection("projects")
          .where("isDeleted", "==", false)
          .get();

        projectsSnapshot.forEach((doc) => {
          const project = doc.data();
          const searchableText =
            `${project.title} ${project.description} ${(project.techStack || []).join(" ")}`.toLowerCase();

          // Simple substring search
          if (searchableText.includes(query)) {
            results.push({
              id: doc.id,
              type: "project",
              title: project.title,
              description: project.description,
              techStack: project.techStack,
              ownerId: project.ownerId,
              status: project.status,
              createdAt: project.createdAt,
            });
          }
        });
      } catch (error) {
        console.error("Project search error:", error.message);
      }
    }

    // Search users
    if (type === "users" || type === "all") {
      try {
        const usersSnapshot = await db.collection("users").get();

        usersSnapshot.forEach((doc) => {
          const user = doc.data();
          const searchableText =
            `${user.name || ""} ${user.email || ""}`.toLowerCase();

          // Simple substring search
          if (searchableText.includes(query)) {
            results.push({
              id: doc.id,
              type: "user",
              name: user.name,
              email: user.email,
              role: user.role,
              createdAt: user.createdAt,
            });
          }
        });
      } catch (error) {
        console.error("User search error:", error.message);
      }
    }

    // Sort results by relevance (exact match first, then prefix match, then anywhere)
    results.sort((a, b) => {
      const aText = (a.title || a.name || "").toLowerCase();
      const bText = (b.title || b.name || "").toLowerCase();

      // Exact match
      if (aText === query && bText !== query) return -1;
      if (bText === query && aText !== query) return 1;

      // Starts with
      if (aText.startsWith(query) && !bText.startsWith(query)) return -1;
      if (bText.startsWith(query) && !aText.startsWith(query)) return 1;

      return 0;
    });

    // Limit results
    const limitedResults = results.slice(0, limitNum);

    return res.status(200).json({
      success: true,
      results: limitedResults,
      type,
      count: limitedResults.length,
      totalMatches: results.length,
    });
  } catch (error) {
    console.error("Search error:", error.message);

    return res.status(500).json({
      success: false,
      error: "InternalServerError",
      message: "Failed to search",
    });
  }
});

module.exports = router;
