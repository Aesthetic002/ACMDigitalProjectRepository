/**
 * CommentForm Component
 *
 * Form for creating or editing comments
 */

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";

export function CommentForm({
  onSubmit,
  onCancel,
  initialValue = "",
  isEdit = false,
  isLoading = false,
}) {
  const [text, setText] = useState(initialValue);
  const [charCount, setCharCount] = useState(0);
  const maxLength = 5000;

  useEffect(() => {
    setText(initialValue);
    setCharCount(initialValue.length);
  }, [initialValue]);

  const handleChange = (e) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setText(value);
      setCharCount(value.length);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim().length === 0) {
      return;
    }
    onSubmit(text.trim());
    if (!isEdit) {
      setText("");
      setCharCount(0);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      setText(initialValue);
      setCharCount(initialValue.length);
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <Textarea
          value={text}
          onChange={handleChange}
          placeholder="Share your thoughts..."
          className="min-h-[100px] resize-none"
          disabled={isLoading}
        />
        <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
          {charCount}/{maxLength}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {isEdit ? "Edit your comment" : "Be respectful and constructive"}
        </p>
        <div className="flex gap-2">
          {isEdit && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={text.trim().length === 0 || isLoading}
          >
            {isLoading
              ? "Posting..."
              : isEdit
                ? "Save Changes"
                : "Post Comment"}
          </Button>
        </div>
      </div>
    </form>
  );
}

export default CommentForm;
