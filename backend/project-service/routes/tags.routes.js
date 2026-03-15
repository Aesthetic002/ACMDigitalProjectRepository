/**
 * Tags & Taxonomy Routes
 *
 * Handles project tags and taxonomy management:
 * - GET /api/v1/tags - List all tags
 * - POST /api/v1/tags - Create new tag (admin only)
 */

const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../shared/middleware/auth");
const { requireAdmin } = require("../../shared/middleware/admin");
const { db } = require("../../shared/firebase");

/**
 * GET /api/v1/tags
 *
 * Lists all tags with usage counts.
 * No authentication required - public endpoint.
 *
 * Query Parameters:
 *   - limit: Max results (default: 100)
 *
 * Response:
 *   200: { success: true, tags: [...], count: number }
 */
router.get("/", async (req, res) => {
  try {
    const { limit = 100 } = req.query;

    // Validate limit
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 1000) {
      return res.status(400).json({
        success: false,
        error: "ValidationError",
        message: "Limit must be between 1 and 1000",
      });
    }

    // Fetch all tags
    const tagsSnapshot = await db
      .collection("tags")
      .orderBy("count", "desc")
      .limit(limitNum)
      .get();

    const tags = [];
    tagsSnapshot.forEach((doc) => {
      tags.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return res.status(200).json({
      success: true,
      tags,
      count: tags.length,
    });
  } catch (error) {
    console.error("List tags error:", error.message);

    return res.status(500).json({
      success: false,
      error: "InternalServerError",
      message: "Failed to retrieve tags",
    });
  }
});

/**
 * POST /api/v1/tags
 *
 * Creates a new tag.
 * Authentication required - admin only.
 *
 * Body:
 *   - name: string (required) - Tag name (e.g., "React")
 *   - slug: string (required) - URL-friendly slug (e.g., "react")
 *
 * Response:
 *   201: { success: true, tag: {...} }
 *   400: { success: false, error: 'ValidationError', message: '...' }
 *   403: { success: false, error: 'Forbidden', message: '...' }
 *   409: { success: false, error: 'Conflict', message: 'Tag already exists' }
 */
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name, slug } = req.body;
    const authenticatedUid = req.user.uid;

    // Check if user is admin
    const userDoc = await db.collection("users").doc(authenticatedUid).get();

    if (!userDoc.exists || userDoc.data().role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Forbidden",
        message: "Admin access required",
      });
    }

    // Validation
    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "ValidationError",
        message: "Tag name is required",
      });
    }

    if (!slug || slug.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "ValidationError",
        message: "Tag slug is required",
      });
    }

    // Validate slug format (alphanumeric and hyphens only)
    const slugRegex = /^[a-z0-9\-]+$/;
    if (!slugRegex.test(slug.trim())) {
      return res.status(400).json({
        success: false,
        error: "ValidationError",
        message:
          "Slug must contain only lowercase letters, numbers, and hyphens",
      });
    }

    const normalizedSlug = slug.toLowerCase().trim();
    const normalizedName = name.trim();

    // Check if tag already exists (by slug)
    const existingTag = await db
      .collection("tags")
      .where("slug", "==", normalizedSlug)
      .get();

    if (!existingTag.empty) {
      return res.status(409).json({
        success: false,
        error: "Conflict",
        message: "A tag with this slug already exists",
      });
    }

    // Create tag
    const tagData = {
      name: normalizedName,
      slug: normalizedSlug,
      count: 0, // Will be incremented when projects use this tag
      createdAt: new Date().toISOString(),
      createdBy: authenticatedUid,
    };

    const tagRef = await db.collection("tags").add(tagData);

    return res.status(201).json({
      success: true,
      message: "Tag created successfully",
      tag: {
        id: tagRef.id,
        ...tagData,
      },
    });
  } catch (error) {
    console.error("Create tag error:", error.message);

    return res.status(500).json({
      success: false,
      error: "InternalServerError",
      message: "Failed to create tag",
    });
  }
});

/**
 * DELETE /api/v1/tags/:tagId
 *
 * Deletes a tag (admin only).
 * Note: This doesn't remove the tag from projects, just deletes the tag record.
 *
 * Response:
 *   200: { success: true, message: '...' }
 *   403: { success: false, error: 'Forbidden', message: '...' }
 *   404: { success: false, error: 'NotFound', message: 'Tag not found' }
 */
router.delete("/:tagId", verifyToken, async (req, res) => {
  try {
    const { tagId } = req.params;
    const authenticatedUid = req.user.uid;

    // Check if user is admin
    const userDoc = await db.collection("users").doc(authenticatedUid).get();

    if (!userDoc.exists || userDoc.data().role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Forbidden",
        message: "Admin access required",
      });
    }

    // Check if tag exists
    const tagRef = db.collection("tags").doc(tagId);
    const tagDoc = await tagRef.get();

    if (!tagDoc.exists) {
      return res.status(404).json({
        success: false,
        error: "NotFound",
        message: "Tag not found",
      });
    }

    // Delete tag
    await tagRef.delete();

    return res.status(200).json({
      success: true,
      message: "Tag deleted successfully",
    });
  } catch (error) {
    console.error("Delete tag error:", error.message);

    return res.status(500).json({
      success: false,
      error: "InternalServerError",
      message: "Failed to delete tag",
    });
  }
});

module.exports = router;
