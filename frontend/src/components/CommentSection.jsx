/**
 * CommentSection Component
 *
 * Main comment section container with form, sorting, and list
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CommentForm } from "./CommentForm";
import { CommentSortBar } from "./CommentSortBar";
import { CommentList } from "./CommentList";
import { useCommentStore } from "@/store/commentStore";
import { useAuthStore } from "@/store/authStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, LogIn } from "lucide-react";
import { toast } from "sonner";

export function CommentSection({ projectId }) {
  const navigate = useNavigate();
  const { user, isAuthenticated, guestRole, requiresLogin, canComment: userCanComment } = useAuthStore();
  const {
    comments,
    commentCount,
    sortBy,
    isLoading,
    fetchComments,
    addComment,
    updateComment,
    deleteComment,
    adminDeleteComment,
    likeComment,
    setSortBy,
  } = useCommentStore();

  const [editingComment, setEditingComment] = useState(null);

  // Fetch comments on mount and when sorting changes
  useEffect(() => {
    if (projectId) {
      fetchComments(projectId, sortBy);
    }
  }, [projectId, sortBy, fetchComments]);

  const handleAddComment = async (text) => {
    // Check if guest user without role
    if (!isAuthenticated && !guestRole) {
      toast.error("Please select a role to comment");
      return;
    }

    // Prompt login for guest users
    if (!isAuthenticated) {
      toast.error("Please sign in to post comments", {
        action: {
          label: "Sign In",
          onClick: () => navigate("/login")
        }
      });
      return;
    }

    const result = await addComment(projectId, text);
    if (result.success) {
      // Comment added successfully
    }
  };

  const handleEditComment = async (text) => {
    if (!editingComment) return;

    const result = await updateComment(editingComment.id, text);
    if (result.success) {
      setEditingComment(null);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      await deleteComment(commentId);
    }
  };

  const handleAdminDeleteComment = async (commentId) => {
    if (window.confirm("Admin: Delete this comment?")) {
      await adminDeleteComment(commentId);
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to like comments");
      return;
    }
    await likeComment(commentId);
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy, projectId);
  };

  const handleEditClick = (comment) => {
    setEditingComment(comment);
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
  };

  return (
    <Card className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h3 className="text-xl font-semibold">Comments</h3>
        {!isAuthenticated && guestRole && (
          <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Browsing as {guestRole === 'viewer' ? 'Viewer' : 'Contributor'}
          </span>
        )}
      </div>

      {/* Comment Form */}
      {isAuthenticated ? (
        <div className="space-y-4">
          {editingComment ? (
            <div className="border-l-4 border-primary pl-4">
              <p className="text-sm text-muted-foreground mb-2">
                Editing comment
              </p>
              <CommentForm
                onSubmit={handleEditComment}
                onCancel={handleCancelEdit}
                initialValue={editingComment.text}
                isEdit={true}
                isLoading={isLoading}
              />
            </div>
          ) : (
            <CommentForm onSubmit={handleAddComment} isLoading={isLoading} />
          )}
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed rounded-lg bg-slate-900/30">
          <LogIn className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground mb-1 font-semibold">
            Sign in to join the discussion
          </p>
          <p className="text-xs text-muted-foreground/60 mb-4">
            {guestRole === 'viewer' ? 'Viewers' : 'Contributors'} can comment on projects
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate("/login")}
            className="gap-2"
          >
            <LogIn className="h-4 w-4" />
            Sign In to Comment
          </Button>
        </div>
      )}

      {/* Sort Bar */}
      <CommentSortBar
        sortBy={sortBy}
        onSortChange={handleSortChange}
        commentCount={commentCount}
      />

      {/* Comments List */}
      <CommentList
        comments={comments}
        isLoading={isLoading}
        onLike={handleLikeComment}
        onEdit={handleEditClick}
        onDelete={handleDeleteComment}
        onAdminDelete={handleAdminDeleteComment}
      />
    </Card>
  );
}

export default CommentSection;
