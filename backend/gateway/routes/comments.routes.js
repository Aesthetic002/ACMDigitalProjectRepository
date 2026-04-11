const express = require('express');

module.exports = function(db, verifyToken, requireAdmin) {
    const router = express.Router();

    // Middleware to pull Firestore user data into req.userData for comments metadata
    const viewerAuth = async (req, res, next) => {
        try {
            const userRef = db.collection("users").doc(req.user.uid);
            const userDoc = await userRef.get();
            if (userDoc.exists) {
                req.userData = userDoc.data();
            } else {
                req.userData = { name: req.user.email?.split('@')[0] || "Anonymous", avatar: "" };
            }
            next();
        } catch (err) {
            next(err);
        }
    };

    /**
     * POST /api/v1/comments
     * Create a comment on a project
     */
    router.post("/", verifyToken, viewerAuth, async (req, res) => {
        try {
            const { projectId, text } = req.body;
            const { uid } = req.user;
            const userData = req.userData;

            if (!projectId || !text) {
                return res.status(400).json({ success: false, error: "Project ID and Text are required." });
            }
            if (text.length < 1 || text.length > 5000) {
                return res.status(400).json({ success: false, error: "Text must be between 1 and 5000 characters." });
            }

            const projectRef = db.collection("projects").doc(projectId);
            const projectDoc = await projectRef.get();
            if (!projectDoc.exists) {
                return res.status(404).json({ success: false, error: "Project not found." });
            }

            const commentRef = db.collection("comments").doc();
            const commentData = {
                id: commentRef.id,
                projectId,
                userId: uid,
                authorName: userData.name || userData.email || "Anonymous",
                authorAvatar: userData.avatar || userData.photoURL || "",
                text: text.trim(),
                likes: 0,
                likedBy: [],
                timestamp: new Date().toISOString(),
                edited: false,
                editedAt: null,
            };

            await commentRef.set(commentData);

            const projectData = projectDoc.data();
            const currentCommentCount = projectData.commentCount || 0;
            await projectRef.update({
                commentCount: currentCommentCount + 1,
                updatedAt: Date.now(), // Projects service uses JS Date.now() integer logic
            });

            return res.status(201).json({ success: true, comment: commentData });
        } catch (error) {
            console.error("Create Comment Error:", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    });

    /**
     * GET /api/v1/comments/project/:projectId
     * Retrieve standard chronological comments layout (For fallback caching purposes)
     */
    router.get("/project/:projectId", async (req, res) => {
        try {
            const { projectId } = req.params;

            const projectRef = db.collection("projects").doc(projectId);
            const projectDoc = await projectRef.get();
            if (!projectDoc.exists) {
                return res.status(404).json({ success: false, error: "Project not found." });
            }

            const commentsSnapshot = await db
                .collection("comments")
                .where("projectId", "==", projectId)
                .orderBy("timestamp", "desc")
                .get();

            const comments = [];
            commentsSnapshot.forEach((doc) => comments.push(doc.data()));

            return res.status(200).json({ success: true, comments, count: comments.length });
        } catch (error) {
            console.error("Fetch Comments Error:", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    });

    /**
     * ML Ranking function for sorting comments natively 
     */
    async function calculateMLScores(comments) {
        const now = Date.now();
        const DAY_MS = 24 * 60 * 60 * 1000;

        const authorStats = {};
        for (const comment of comments) {
            if (!authorStats[comment.userId]) {
                authorStats[comment.userId] = { totalLikes: 0, commentCount: 0 };
            }
            authorStats[comment.userId].totalLikes += comment.likes;
            authorStats[comment.userId].commentCount += 1;
        }

        const scoredComments = comments.map((comment) => {
            const maxLikes = Math.max(...comments.map((c) => c.likes), 1);
            const likesScore = (comment.likes / maxLikes) * 0.4;

            const commentAge = now - new Date(comment.timestamp).getTime();
            const daysSince = commentAge / DAY_MS;
            const recencyScore = Math.max(0, 1 - daysSince / 180) * 0.3;

            const authorRep = authorStats[comment.userId];
            const avgLikes = authorRep.totalLikes / authorRep.commentCount;
            const maxAvgLikes = Math.max(
                ...Object.values(authorStats).map((s) => s.totalLikes / s.commentCount),
                1,
            );
            const reputationScore = (avgLikes / maxAvgLikes) * 0.2;

            const textLength = comment.text.length;
            let relevanceScore = 0;
            if (textLength >= 50 && textLength <= 500) relevanceScore = 0.1;
            else if (textLength > 20 && textLength < 1000) relevanceScore = 0.05;

            const mlScore = likesScore + recencyScore + reputationScore + relevanceScore;

            return { ...comment, mlScore };
        });

        scoredComments.sort((a, b) => b.mlScore - a.mlScore);
        return scoredComments;
    }

    /**
     * GET /api/v1/comments/project/:projectId/sorted
     * Fetch formatted and computationally sorted block
     */
    router.get("/project/:projectId/sorted", async (req, res) => {
        try {
            const { projectId } = req.params;
            const { sortBy = "recent", limit = 50 } = req.query;

            const validSorts = ["likes", "recent", "oldest", "ml-top"];
            if (!validSorts.includes(sortBy)) {
                return res.status(400).json({ success: false, message: "Invalid sortBy parameter." });
            }

            const limitNum = parseInt(limit);
            if (isNaN(limitNum) || limitNum < 1 || limitNum > 200) {
                return res.status(400).json({ success: false, message: "Invalid limit parameter." });
            }

            let commentsQuery = db.collection("comments").where("projectId", "==", projectId);

            // Because Firestore cannot combine equality and diverse orderBys natively sometimes without composite indexes,
            // we will query all comments for a specific project and sort in memory if needed. 
            // The comments collection per project is realistically small (under 10k items per project typically)
            
            const commentsSnapshot = await commentsQuery.get();
            let comments = [];
            commentsSnapshot.forEach((doc) => comments.push(doc.data()));

            // In Memory Sorting 
            if (sortBy === "recent") {
                comments.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            } else if (sortBy === "oldest") {
                comments.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            } else if (sortBy === "likes") {
                comments.sort((a, b) => b.likes !== a.likes ? b.likes - a.likes : new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            } else if (sortBy === "ml-top") {
                comments = await calculateMLScores(comments);
            }

            comments = comments.slice(0, limitNum);

            return res.status(200).json({ success: true, comments, count: comments.length, sortBy });
        } catch (error) {
            console.error("Fetch Sorted Comments Error:", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    });

    /**
     * PUT /api/v1/comments/:commentId/like
     */
    router.put("/:commentId/like", verifyToken, viewerAuth, async (req, res) => {
        try {
            const { commentId } = req.params;
            const { uid } = req.user;

            const commentRef = db.collection("comments").doc(commentId);
            const commentDoc = await commentRef.get();
            if (!commentDoc.exists) {
                return res.status(404).json({ success: false, message: "Comment not found." });
            }

            const commentData = commentDoc.data();
            const likedBy = commentData.likedBy || [];
            const alreadyLiked = likedBy.includes(uid);

            let updatedLikedBy;
            let updatedLikes;

            if (alreadyLiked) {
                updatedLikedBy = likedBy.filter((userId) => userId !== uid);
                updatedLikes = Math.max(0, commentData.likes - 1);
            } else {
                updatedLikedBy = [...likedBy, uid];
                updatedLikes = commentData.likes + 1;
            }

            await commentRef.update({ likes: updatedLikes, likedBy: updatedLikedBy });

            return res.status(200).json({
                success: true,
                liked: !alreadyLiked,
                likes: updatedLikes,
            });
        } catch (error) {
            console.error("Like Action Error:", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    });

    /**
     * PUT /api/v1/comments/:commentId
     * Edit specific comment
     */
    router.put("/:commentId", verifyToken, viewerAuth, async (req, res) => {
        try {
            const { commentId } = req.params;
            const { text } = req.body;
            const { uid } = req.user;

            if (!text || text.length < 1 || text.length > 5000) {
                return res.status(400).json({ success: false, message: "Invalid text length." });
            }

            const commentRef = db.collection("comments").doc(commentId);
            const commentDoc = await commentRef.get();
            if (!commentDoc.exists) {
                return res.status(404).json({ success: false, message: "Comment not found." });
            }

            const commentData = commentDoc.data();
            if (commentData.userId !== uid) {
                return res.status(403).json({ success: false, message: "Unauthorized edit." });
            }

            const updatedData = {
                text: text.trim(),
                edited: true,
                editedAt: new Date().toISOString(),
            };

            await commentRef.update(updatedData);

            return res.status(200).json({
                success: true,
                comment: { ...commentData, ...updatedData },
            });
        } catch (error) {
            console.error("Edit Comment Error:", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    });

    /**
     * DELETE /api/v1/comments/:commentId
     */
    router.delete("/:commentId", verifyToken, viewerAuth, async (req, res) => {
        try {
            const { commentId } = req.params;
            const { uid } = req.user;

            const commentRef = db.collection("comments").doc(commentId);
            const commentDoc = await commentRef.get();
            if (!commentDoc.exists) {
                return res.status(404).json({ success: false, message: "Comment not found." });
            }

            const commentData = commentDoc.data();
            if (commentData.userId !== uid) {
                return res.status(403).json({ success: false, message: "Unauthorized delete." });
            }

            await commentRef.delete();

            const projectRef = db.collection("projects").doc(commentData.projectId);
            const projectDoc = await projectRef.get();
            if (projectDoc.exists) {
                const projectData = projectDoc.data();
                const currentCommentCount = projectData.commentCount || 0;
                await projectRef.update({
                    commentCount: Math.max(0, currentCommentCount - 1),
                    updatedAt: Date.now(),
                });
            }

            return res.status(200).json({ success: true });
        } catch (error) {
            console.error("Delete Comment Error:", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    });

    /**
     * DELETE /api/v1/comments/:commentId/admin
     */
    router.delete("/:commentId/admin", verifyToken, requireAdmin, async (req, res) => {
        try {
            const { commentId } = req.params;

            const commentRef = db.collection("comments").doc(commentId);
            const commentDoc = await commentRef.get();
            if (!commentDoc.exists) {
                return res.status(404).json({ success: false, message: "Comment not found." });
            }

            const commentData = commentDoc.data();
            await commentRef.delete();

            const projectRef = db.collection("projects").doc(commentData.projectId);
            const projectDoc = await projectRef.get();
            if (projectDoc.exists) {
                const projectData = projectDoc.data();
                const currentCommentCount = projectData.commentCount || 0;
                await projectRef.update({
                    commentCount: Math.max(0, currentCommentCount - 1),
                    updatedAt: Date.now(),
                });
            }

            return res.status(200).json({ success: true });
        } catch (error) {
            console.error("Admin Delete Comment Error:", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    });

    return router;
};
