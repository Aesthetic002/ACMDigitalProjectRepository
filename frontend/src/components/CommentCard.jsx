/**
 * CommentCard Component
 *
 * Displays an individual comment with like, edit, delete functionality
 */

import React, { useState } from "react";
import { Heart, Edit2, Trash2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { useAuthStore } from "@/store/authStore";

export function CommentCard({
  comment,
  onLike,
  onEdit,
  onDelete,
  onAdminDelete,
}) {
  const { user } = useAuthStore();
  const [isLiked, setIsLiked] = useState(false);

  const isOwner = user?.uid === comment.userId;
  const isAdmin = user?.role === "admin";
  const canModify = isOwner || isAdmin;

  const handleLike = async () => {
    if (!user) {
      return;
    }
    setIsLiked(!isLiked);
    await onLike(comment.id);
  };

  const formatDate = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return "recently";
    }
  };

  return (
    <div className="flex gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      {/* Avatar */}
      <div className="flex-shrink-0">
        {comment.authorAvatar ? (
          <img
            src={comment.authorAvatar}
            alt={comment.authorName}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {comment.authorName?.charAt(0)?.toUpperCase() || "?"}
            </span>
          </div>
        )}
      </div>

      {/* Comment Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h4 className="font-medium text-sm">{comment.authorName}</h4>
            <p className="text-xs text-muted-foreground">
              {formatDate(comment.timestamp)}
              {comment.edited && <span className="ml-1 italic">(edited)</span>}
            </p>
          </div>

          {/* Actions Menu */}
          {canModify && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isOwner && (
                  <DropdownMenuItem onClick={() => onEdit(comment)}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                {isOwner && (
                  <DropdownMenuItem
                    onClick={() => onDelete(comment.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
                {isAdmin && !isOwner && (
                  <DropdownMenuItem
                    onClick={() => onAdminDelete(comment.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Admin Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Comment Text */}
        <p className="text-sm text-foreground whitespace-pre-wrap break-words">
          {comment.text}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-4 mt-3">
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 gap-1 ${isLiked || comment.liked ? "text-red-500" : ""}`}
            onClick={handleLike}
            disabled={!user}
          >
            <Heart
              className={`h-4 w-4 ${isLiked || comment.liked ? "fill-current" : ""}`}
            />
            <span className="text-xs">{comment.likes || 0}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CommentCard;
