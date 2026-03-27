/**
 * CommentList Component
 *
 * Displays list of comments with virtualization for performance
 */

import React from "react";
import { CommentCard } from "./CommentCard";
import { Loader2 } from "lucide-react";

export function CommentList({
  comments,
  isLoading,
  onLike,
  onEdit,
  onDelete,
  onAdminDelete,
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No comments yet. Be the first to share your thoughts!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentCard
          key={comment.id}
          comment={comment}
          onLike={onLike}
          onEdit={onEdit}
          onDelete={onDelete}
          onAdminDelete={onAdminDelete}
        />
      ))}
    </div>
  );
}

export default CommentList;
