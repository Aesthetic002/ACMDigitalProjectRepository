/**
 * CommentSortBar Component
 *
 * Sort buttons for comment list
 */

import React from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, Clock, Sparkles, ArrowUpDown } from "lucide-react";

export function CommentSortBar({ sortBy, onSortChange, commentCount }) {
  const sortOptions = [
    { value: "recent", label: "Recent", icon: Clock },
    { value: "likes", label: "Popular", icon: ThumbsUp },
    { value: "oldest", label: "Oldest", icon: ArrowUpDown },
    { value: "ml-top", label: "Top", icon: Sparkles },
  ];

  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{commentCount} Comments</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground hidden sm:inline">
          Sort by:
        </span>
        <div className="flex gap-1">
          {sortOptions.map((option) => {
            const Icon = option.icon;
            const isActive = sortBy === option.value;

            return (
              <Button
                key={option.value}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => onSortChange(option.value)}
                className={`gap-1.5 ${isActive ? "" : "text-muted-foreground"}`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{option.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default CommentSortBar;
