/**
 * Comment Store
 *
 * Manages comment state using Zustand
 */

import { create } from "zustand";
import { commentService } from "@/services/commentService";
import { toast } from "sonner";

export const useCommentStore = create((set, get) => ({
  // State
  comments: [],
  sortBy: "recent",
  isLoading: false,
  error: null,
  commentCount: 0,

  /**
   * Fetch comments for a project
   * @param {string} projectId - Project ID
   * @param {string} sortBy - Sort type
   */
  fetchComments: async (projectId, sortBy = "recent") => {
    set({ isLoading: true, error: null });
    try {
      const response = await commentService.getProjectCommentsSorted(
        projectId,
        sortBy,
      );
      set({
        comments: response.comments || [],
        commentCount: response.count || 0,
        sortBy,
        isLoading: false,
      });
    } catch (error) {
      console.error("Fetch comments error:", error);
      set({
        error: error.message || "Failed to fetch comments",
        isLoading: false,
      });
      toast.error("Failed to load comments");
    }
  },

  /**
   * Set sort type and refetch
   * @param {string} sortBy - Sort type
   * @param {string} projectId - Project ID
   */
  setSortBy: async (sortBy, projectId) => {
    if (projectId) {
      await get().fetchComments(projectId, sortBy);
    } else {
      set({ sortBy });
    }
  },

  /**
   * Add a new comment
   * @param {string} projectId - Project ID
   * @param {string} text - Comment text
   */
  addComment: async (projectId, text) => {
    set({ isLoading: true, error: null });
    try {
      const response = await commentService.createComment(projectId, text);

      if (response.success) {
        const newComment = response.comment;

        // Add comment to the beginning of the list
        set((state) => ({
          comments: [newComment, ...state.comments],
          commentCount: state.commentCount + 1,
          isLoading: false,
        }));

        toast.success("Comment posted successfully!");
        return { success: true, comment: newComment };
      }
    } catch (error) {
      console.error("Add comment error:", error);
      set({
        error: error.message || "Failed to add comment",
        isLoading: false,
      });
      toast.error(error.message || "Failed to post comment");
      return { success: false };
    }
  },

  /**
   * Update a comment
   * @param {string} commentId - Comment ID
   * @param {string} text - New comment text
   */
  updateComment: async (commentId, text) => {
    set({ isLoading: true, error: null });
    try {
      const response = await commentService.updateComment(commentId, text);

      if (response.success) {
        const updatedComment = response.comment;

        // Update comment in the list
        set((state) => ({
          comments: state.comments.map((c) =>
            c.id === commentId ? updatedComment : c,
          ),
          isLoading: false,
        }));

        toast.success("Comment updated successfully!");
        return { success: true };
      }
    } catch (error) {
      console.error("Update comment error:", error);
      set({
        error: error.message || "Failed to update comment",
        isLoading: false,
      });
      toast.error(error.message || "Failed to update comment");
      return { success: false };
    }
  },

  /**
   * Delete a comment
   * @param {string} commentId - Comment ID
   */
  deleteComment: async (commentId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await commentService.deleteComment(commentId);

      if (response.success) {
        // Remove comment from the list
        set((state) => ({
          comments: state.comments.filter((c) => c.id !== commentId),
          commentCount: Math.max(0, state.commentCount - 1),
          isLoading: false,
        }));

        toast.success("Comment deleted successfully!");
        return { success: true };
      }
    } catch (error) {
      console.error("Delete comment error:", error);
      set({
        error: error.message || "Failed to delete comment",
        isLoading: false,
      });
      toast.error(error.message || "Failed to delete comment");
      return { success: false };
    }
  },

  /**
   * Admin delete a comment
   * @param {string} commentId - Comment ID
   */
  adminDeleteComment: async (commentId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await commentService.adminDeleteComment(commentId);

      if (response.success) {
        // Remove comment from the list
        set((state) => ({
          comments: state.comments.filter((c) => c.id !== commentId),
          commentCount: Math.max(0, state.commentCount - 1),
          isLoading: false,
        }));

        toast.success("Comment deleted by admin");
        return { success: true };
      }
    } catch (error) {
      console.error("Admin delete comment error:", error);
      set({
        error: error.message || "Failed to delete comment",
        isLoading: false,
      });
      toast.error(error.message || "Failed to delete comment");
      return { success: false };
    }
  },

  /**
   * Like/unlike a comment
   * @param {string} commentId - Comment ID
   */
  likeComment: async (commentId) => {
    try {
      const response = await commentService.likeComment(commentId);

      if (response.success) {
        // Update comment in the list
        set((state) => ({
          comments: state.comments.map((c) =>
            c.id === commentId
              ? { ...c, likes: response.likes, liked: response.liked }
              : c,
          ),
        }));

        return { success: true, liked: response.liked };
      }
    } catch (error) {
      console.error("Like comment error:", error);
      toast.error(error.message || "Failed to like comment");
      return { success: false };
    }
  },

  /**
   * Clear comments
   */
  clearComments: () => {
    set({
      comments: [],
      commentCount: 0,
      sortBy: "recent",
      error: null,
    });
  },

  /**
   * Reset store
   */
  reset: () => {
    set({
      comments: [],
      sortBy: "recent",
      isLoading: false,
      error: null,
      commentCount: 0,
    });
  },
}));

export default useCommentStore;
