/**
 * Comments Routes
 *
 * Handles comment-related endpoints:
 * - POST /api/v1/comments - Create a new comment
 * - GET /api/v1/comments/project/:projectId - Get all comments for a project
 * - GET /api/v1/comments/project/:projectId/sorted - Get comments with sorting
 * - PUT /api/v1/comments/:commentId/like - Like/unlike a comment
 * - PUT /api/v1/comments/:commentId - Edit own comment
 * - DELETE /api/v1/comments/:commentId - Delete own comment
 * - DELETE /api/v1/comments/:commentId/admin - Admin delete any comment
 */

const express = require("express");
const router = express.Router();
const { verifyToken, viewerAuth, requireAdmin } = require("../middleware/auth");
const { db } = require("../firebase");

/**
 * POST /api/v1/comments
 *
 * Creates a new comment on a project
 * Requires: Viewer role or above
 *
 * Headers:
 *   Authorization: Bearer <firebase-id-token>
 *
 * Body:
 *   {
 *     projectId: string,
 *     text: string (1-5000 characters)
 *   }
 *
 * Response:
 *   201: { success: true, comment: {...} }
 *   400: { success: false, error: 'ValidationError', message: '...' }
 */
router.post("/", verifyToken, viewerAuth, async (req, res) => {
  try {
    const { projectId, text } = req.body;
    const { uid } = req.user;
    const userData = req.userData;

    // Validate input
    if (!projectId || !text) {
      return res.status(400).json({
        success: false,
        error: "ValidationError",
        message: "projectId and text are required",
      });
    }

    // Validate text length
    if (text.length < 1 || text.length > 5000) {
      return res.status(400).json({
        success: false,
        error: "ValidationError",
        message: "Comment text must be between 1 and 5000 characters",
      });
    }

    // Check if user can comment
    if (!userData.canComment) {
      return res.status(403).json({
        success: false,
        error: "Forbidden",
        message: "You do not have permission to comment",
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

    // Create comment
    const commentRef = db.collection("comments").doc();
    const commentData = {
      id: commentRef.id,
      projectId,
      userId: uid,
      authorName: userData.name || "Anonymous",
      authorAvatar: userData.photoURL || "",
      text: text.trim(),
      likes: 0,
      likedBy: [],
      timestamp: new Date().toISOString(),
      edited: false,
      editedAt: null,
    };

    await commentRef.set(commentData);

    // Update project comment count
    const projectData = projectDoc.data();
    const currentCommentCount = projectData.commentCount || 0;
    await projectRef.update({
      commentCount: currentCommentCount + 1,
      updatedAt: new Date().toISOString(),
    });

    return res.status(201).json({
      success: true,
      message: "Comment created successfully",
      comment: commentData,
    });
  } catch (error) {
    console.error("Create comment error:", error.message);

    return res.status(500).json({
      success: false,
      error: "InternalServerError",
      message: "Failed to create comment",
    });
  }
});

/**
 * GET /api/v1/comments/project/:projectId
 *
 * Gets all comments for a specific project
 * Public endpoint - no authentication required
 *
 * Response:
 *   200: { success: true, comments: [...], count: number }
 *   404: { success: false, error: 'NotFound', message: '...' }
 */
router.get("/project/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;

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

    // Get all comments for project
    const commentsSnapshot = await db
      .collection("comments")
      .where("projectId", "==", projectId)
      .orderBy("timestamp", "desc")
      .get();

    const comments = [];
    commentsSnapshot.forEach((doc) => {
      comments.push(doc.data());
    });

    return res.status(200).json({
      success: true,
      comments,
      count: comments.length,
    });
  } catch (error) {
    console.error("Get comments error:", error.message);

    return res.status(500).json({
      success: false,
      error: "InternalServerError",
      message: "Failed to get comments",
    });
  }
});

/**
 * GET /api/v1/comments/project/:projectId/sorted
 *
 * Gets comments for a project with sorting
 * Public endpoint - no authentication required
 *
 * Query Parameters:
 *   - sortBy: 'likes' | 'recent' | 'oldest' | 'ml-top' (default: recent)
 *   - limit: number (default: 50, max: 200)
 *
 * Response:
 *   200: { success: true, comments: [...], count: number, sortBy: string }
 *   400: { success: false, error: 'ValidationError', message: '...' }
 */
router.get("/project/:projectId/sorted", async (req, res) => {
  try {
    const { projectId } = req.params;
    const { sortBy = "recent", limit = 50 } = req.query;

    // Validate sortBy
    const validSorts = ["likes", "recent", "oldest", "ml-top"];
    if (!validSorts.includes(sortBy)) {
      return res.status(400).json({
        success: false,
        error: "ValidationError",
        message: "Invalid sortBy. Must be: likes, recent, oldest, or ml-top",
      });
    }

    // Validate limit
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 200) {
      return res.status(400).json({
        success: false,
        error: "ValidationError",
        message: "Limit must be between 1 and 200",
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

    // Get all comments for project
    let commentsQuery = db
      .collection("comments")
      .where("projectId", "==", projectId);

    // Apply initial sorting based on sortBy
    if (sortBy === "recent") {
      commentsQuery = commentsQuery.orderBy("timestamp", "desc");
    } else if (sortBy === "oldest") {
      commentsQuery = commentsQuery.orderBy("timestamp", "asc");
    } else if (sortBy === "likes") {
      commentsQuery = commentsQuery
        .orderBy("likes", "desc")
        .orderBy("timestamp", "desc");
    }

    const commentsSnapshot = await commentsQuery.limit(limitNum).get();

    let comments = [];
    commentsSnapshot.forEach((doc) => {
      comments.push(doc.data());
    });

    // ML-based top sorting (weighted scoring)
    if (sortBy === "ml-top") {
      comments = await calculateMLScores(comments);
    }

    return res.status(200).json({
      success: true,
      comments,
      count: comments.length,
      sortBy,
    });
  } catch (error) {
    console.error("Get sorted comments error:", error.message);

    return res.status(500).json({
      success: false,
      error: "InternalServerError",
      message: "Failed to get sorted comments",
    });
  }
});

/**
 * ML Scoring Algorithm for Comments
 * Calculates a composite score based on:
 * - Likes (40% weight)
 * - Recency (30% weight)
 * - Author reputation (20% weight)
 * - Comment length relevance (10% weight)
 */
async function calculateMLScores(comments) {
  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;

  // Calculate author reputation (average likes per comment)
  const authorStats = {};
  for (const comment of comments) {
    if (!authorStats[comment.userId]) {
      authorStats[comment.userId] = { totalLikes: 0, commentCount: 0 };
    }
    authorStats[comment.userId].totalLikes += comment.likes;
    authorStats[comment.userId].commentCount += 1;
  }

  // Calculate scores
  const scoredComments = comments.map((comment) => {
    // Likes score (normalized)
    const maxLikes = Math.max(...comments.map((c) => c.likes), 1);
    const likesScore = (comment.likes / maxLikes) * 0.4;

    // Recency score (decay over time)
    const commentAge = now - new Date(comment.timestamp).getTime();
    const daysSince = commentAge / DAY_MS;
    const recencyScore = Math.max(0, 1 - daysSince / 180) * 0.3; // 180 day decay

    // Author reputation score
    const authorRep = authorStats[comment.userId];
    const avgLikes = authorRep.totalLikes / authorRep.commentCount;
    const maxAvgLikes = Math.max(
      ...Object.values(authorStats).map((s) => s.totalLikes / s.commentCount),
      1,
    );
    const reputationScore = (avgLikes / maxAvgLikes) * 0.2;

    // Relevance score (based on length - prefer 50-500 chars)
    const textLength = comment.text.length;
    let relevanceScore = 0;
    if (textLength >= 50 && textLength <= 500) {
      relevanceScore = 0.1;
    } else if (textLength > 20 && textLength < 1000) {
      relevanceScore = 0.05;
    }

    const mlScore =
      likesScore + recencyScore + reputationScore + relevanceScore;

    return {
      ...comment,
      mlScore,
    };
  });

  // Sort by ML score
  scoredComments.sort((a, b) => b.mlScore - a.mlScore);

  return scoredComments;
}

/**
 * PUT /api/v1/comments/:commentId/like
 *
 * Likes or unlikes a comment
 * Requires: Viewer role or above
 *
 * Headers:
 *   Authorization: Bearer <firebase-id-token>
 *
 * Response:
 *   200: { success: true, liked: boolean, likes: number }
 *   404: { success: false, error: 'NotFound', message: '...' }
 */
router.put("/:commentId/like", verifyToken, viewerAuth, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { uid } = req.user;

    const commentRef = db.collection("comments").doc(commentId);
    const commentDoc = await commentRef.get();

    if (!commentDoc.exists) {
      return res.status(404).json({
        success: false,
        error: "NotFound",
        message: "Comment not found",
      });
    }

    const commentData = commentDoc.data();
    const likedBy = commentData.likedBy || [];
    const alreadyLiked = likedBy.includes(uid);

    let updatedLikedBy;
    let updatedLikes;

    if (alreadyLiked) {
      // Unlike
      updatedLikedBy = likedBy.filter((userId) => userId !== uid);
      updatedLikes = Math.max(0, commentData.likes - 1);
    } else {
      // Like
      updatedLikedBy = [...likedBy, uid];
      updatedLikes = commentData.likes + 1;
    }

    await commentRef.update({
      likes: updatedLikes,
      likedBy: updatedLikedBy,
    });

    return res.status(200).json({
      success: true,
      message: alreadyLiked ? "Comment unliked" : "Comment liked",
      liked: !alreadyLiked,
      likes: updatedLikes,
    });
  } catch (error) {
    console.error("Like comment error:", error.message);

    return res.status(500).json({
      success: false,
      error: "InternalServerError",
      message: "Failed to like comment",
    });
  }
});

/**
 * PUT /api/v1/comments/:commentId
 *
 * Edits own comment
 * Requires: Viewer role or above (must be comment owner)
 *
 * Headers:
 *   Authorization: Bearer <firebase-id-token>
 *
 * Body:
 *   { text: string (1-5000 characters) }
 *
 * Response:
 *   200: { success: true, comment: {...} }
 *   403: { success: false, error: 'Forbidden', message: '...' }
 *   404: { success: false, error: 'NotFound', message: '...' }
 */
router.put("/:commentId", verifyToken, viewerAuth, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;
    const { uid } = req.user;

    // Validate text
    if (!text || text.length < 1 || text.length > 5000) {
      return res.status(400).json({
        success: false,
        error: "ValidationError",
        message: "Comment text must be between 1 and 5000 characters",
      });
    }

    const commentRef = db.collection("comments").doc(commentId);
    const commentDoc = await commentRef.get();

    if (!commentDoc.exists) {
      return res.status(404).json({
        success: false,
        error: "NotFound",
        message: "Comment not found",
      });
    }

    const commentData = commentDoc.data();

    // Check ownership
    if (commentData.userId !== uid) {
      return res.status(403).json({
        success: false,
        error: "Forbidden",
        message: "You can only edit your own comments",
      });
    }

    const updatedData = {
      text: text.trim(),
      edited: true,
      editedAt: new Date().toISOString(),
    };

    await commentRef.update(updatedData);

    const updatedComment = { ...commentData, ...updatedData };

    return res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      comment: updatedComment,
    });
  } catch (error) {
    console.error("Edit comment error:", error.message);

    return res.status(500).json({
      success: false,
      error: "InternalServerError",
      message: "Failed to edit comment",
    });
  }
});

/**
 * DELETE /api/v1/comments/:commentId
 *
 * Deletes own comment
 * Requires: Viewer role or above (must be comment owner)
 *
 * Headers:
 *   Authorization: Bearer <firebase-id-token>
 *
 * Response:
 *   200: { success: true, message: '...' }
 *   403: { success: false, error: 'Forbidden', message: '...' }
 *   404: { success: false, error: 'NotFound', message: '...' }
 */
router.delete("/:commentId", verifyToken, viewerAuth, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { uid } = req.user;

    const commentRef = db.collection("comments").doc(commentId);
    const commentDoc = await commentRef.get();

    if (!commentDoc.exists) {
      return res.status(404).json({
        success: false,
        error: "NotFound",
        message: "Comment not found",
      });
    }

    const commentData = commentDoc.data();

    // Check ownership
    if (commentData.userId !== uid) {
      return res.status(403).json({
        success: false,
        error: "Forbidden",
        message: "You can only delete your own comments",
      });
    }

    await commentRef.delete();

    // Update project comment count
    const projectRef = db.collection("projects").doc(commentData.projectId);
    const projectDoc = await projectRef.get();

    if (projectDoc.exists) {
      const projectData = projectDoc.data();
      const currentCommentCount = projectData.commentCount || 0;
      await projectRef.update({
        commentCount: Math.max(0, currentCommentCount - 1),
        updatedAt: new Date().toISOString(),
      });
    }

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Delete comment error:", error.message);

    return res.status(500).json({
      success: false,
      error: "InternalServerError",
      message: "Failed to delete comment",
    });
  }
});

/**
 * DELETE /api/v1/comments/:commentId/admin
 *
 * Admin deletes any comment
 * Requires: Admin role
 *
 * Headers:
 *   Authorization: Bearer <firebase-id-token>
 *
 * Response:
 *   200: { success: true, message: '...' }
 *   404: { success: false, error: 'NotFound', message: '...' }
 */
router.delete(
  "/:commentId/admin",
  verifyToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { commentId } = req.params;

      const commentRef = db.collection("comments").doc(commentId);
      const commentDoc = await commentRef.get();

      if (!commentDoc.exists) {
        return res.status(404).json({
          success: false,
          error: "NotFound",
          message: "Comment not found",
        });
      }

      const commentData = commentDoc.data();

      await commentRef.delete();

      // Update project comment count
      const projectRef = db.collection("projects").doc(commentData.projectId);
      const projectDoc = await projectRef.get();

      if (projectDoc.exists) {
        const projectData = projectDoc.data();
        const currentCommentCount = projectData.commentCount || 0;
        await projectRef.update({
          commentCount: Math.max(0, currentCommentCount - 1),
          updatedAt: new Date().toISOString(),
        });
      }

      return res.status(200).json({
        success: true,
        message: "Comment deleted by admin",
      });
    } catch (error) {
      console.error("Admin delete comment error:", error.message);

      return res.status(500).json({
        success: false,
        error: "InternalServerError",
        message: "Failed to delete comment",
      });
    }
  },
);

module.exports = router;
