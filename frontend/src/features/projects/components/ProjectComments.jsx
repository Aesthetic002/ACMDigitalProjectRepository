import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, ThumbsUp, MoreHorizontal, Edit2, Trash2, Send, ListFilter } from "lucide-react";
import { commentsAPI } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function ProjectComments({ projectId }) {
    const { user, isAuthenticated } = useAuthStore();
    const queryClient = useQueryClient();
    const [sortBy, setSortBy] = useState("ml-top");
    const [commentText, setCommentText] = useState("");
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editText, setEditText] = useState("");

    const { data, isLoading } = useQuery({
        queryKey: ['comments', projectId, sortBy],
        queryFn: async () => {
            const response = await commentsAPI.getSorted(projectId, { sortBy });
            return response.data;
        },
    });

    const comments = data?.comments || [];

    const createMutation = useMutation({
        mutationFn: (text) => commentsAPI.create({ projectId, text }),
        onSuccess: () => {
            queryClient.invalidateQueries(['comments', projectId]);
            setCommentText("");
            toast.success("Comment posted!");
        },
        onError: (err) => toast.error(err.response?.data?.error || "Failed to post comment"),
    });

    const likeMutation = useMutation({
        mutationFn: (commentId) => commentsAPI.like(commentId),
        onSuccess: () => queryClient.invalidateQueries(['comments', projectId]),
    });

    const deleteMutation = useMutation({
        mutationFn: (commentId) => {
            if (user?.role === 'admin') return commentsAPI.adminDelete(commentId);
            return commentsAPI.delete(commentId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['comments', projectId]);
            toast.success("Comment deleted");
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, text }) => commentsAPI.update(id, { text }),
        onSuccess: () => {
            queryClient.invalidateQueries(['comments', projectId]);
            setEditingCommentId(null);
            toast.success("Comment updated");
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        createMutation.mutate(commentText);
    };

    const handleEditSubmit = (commentId) => {
        if (!editText.trim()) return;
        updateMutation.mutate({ id: commentId, text: editText });
    };

    return (
        <section className="mt-12 w-full max-w-4xl mx-auto bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                    <MessageSquare className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-bold text-foreground">
                        Discussions <span className="text-muted-foreground text-lg font-medium ml-2">({data?.count || 0})</span>
                    </h2>
                </div>
                <div className="flex items-center gap-2">
                    <ListFilter className="h-4 w-4 text-muted-foreground" />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-transparent text-sm text-foreground focus:outline-none focus:ring-0 cursor-pointer p-1 font-medium"
                    >
                        <option value="ml-top">Top Relevant</option>
                        <option value="recent">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="likes">Most Liked</option>
                    </select>
                </div>
            </div>

            {/* Post Comment Input */}
            {isAuthenticated ? (
                <form onSubmit={handleSubmit} className="mb-10 flex gap-4 items-start">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/20">
                        {user.avatar ? <img src={user.avatar} className="h-full w-full object-cover" /> : <span className="text-primary font-bold">{user.name?.charAt(0) || user.email?.charAt(0)}</span>}
                    </div>
                    <div className="flex-1 relative">
                        <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Add to the discussion..."
                            className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none min-h-[90px]"
                        />
                        <div className="absolute bottom-3 right-3">
                            <Button 
                                type="submit" 
                                size="sm" 
                                disabled={!commentText.trim() || createMutation.isPending}
                                className="rounded-lg px-4 gap-2 shadow-acm-glow"
                            >
                                {createMutation.isPending ? "Posting..." : <><Send className="h-3 w-3" /> Post</>}
                            </Button>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="mb-10 text-center p-6 rounded-xl bg-muted/50 border border-dashed border-border">
                    <p className="text-muted-foreground mb-4">You must be logged in to join the discussion.</p>
                </div>
            )}

            {/* Comments Feed */}
            <div className="space-y-6">
                {isLoading ? (
                    <div className="flex justify-center p-8"><div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" /></div>
                ) : comments.length === 0 ? (
                    <div className="text-center p-12 py-16">
                        <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground">No discussions yet</h3>
                        <p className="text-muted-foreground text-sm">Be the first to share your thoughts on this project!</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4 group">
                            <Link to={`/members/${comment.userId}`} className="shrink-0">
                                <div className="h-10 w-10 rounded-full bg-secondary/50 flex items-center justify-center overflow-hidden border border-border mt-1 transition-transform hover:scale-105">
                                    {comment.authorAvatar ? (
                                        <img src={comment.authorAvatar} alt={comment.authorName} className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-foreground font-bold">{comment.authorName.charAt(0)}</span>
                                    )}
                                </div>
                            </Link>

                            <div className="flex-1">
                                <div className="bg-muted/30 border border-border rounded-2xl rounded-tl-none p-4 pb-3 hover:border-border/80 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Link to={`/members/${comment.userId}`} className="font-semibold text-sm hover:underline hover:text-primary">
                                                {comment.authorName}
                                            </Link>
                                            <span className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
                                                {comment.edited && " (edited)"}
                                            </span>
                                            {comment.mlScore && sortBy === 'ml-top' && (
                                                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full" title={`ML Relevancy Factor: ${comment.mlScore.toFixed(3)}`}>Recommended</span>
                                            )}
                                        </div>

                                        {(user?.uid === comment.userId || user?.role === 'admin') && (
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {user?.uid === comment.userId && (
                                                    <button 
                                                        onClick={() => {
                                                            setEditingCommentId(comment.id);
                                                            setEditText(comment.text);
                                                        }}
                                                        className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                                                    >
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => deleteMutation.mutate(comment.id)}
                                                    className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {editingCommentId === comment.id ? (
                                        <div className="mt-2 text-sm text-foreground space-y-2">
                                            <textarea
                                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary outline-none transition-all resize-none min-h-[70px]"
                                                value={editText}
                                                onChange={(e) => setEditText(e.target.value)}
                                                autoFocus
                                            />
                                            <div className="flex items-center justify-end gap-2">
                                                <Button size="sm" variant="ghost" className="h-7 text-xs px-2" onClick={() => setEditingCommentId(null)}>Cancel</Button>
                                                <Button size="sm" className="h-7 text-xs px-3 shadow-acm-glow" onClick={() => handleEditSubmit(comment.id)} disabled={updateMutation.isPending}>Save</Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{comment.text}</p>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 mt-2 px-1">
                                    <button 
                                        onClick={() => {
                                            if (!isAuthenticated) return toast.error("Please login to like comments");
                                            likeMutation.mutate(comment.id);
                                        }}
                                        className={`flex items-center gap-1.5 text-xs font-medium transition-colors p-1 -ml-1 rounded-md ${
                                            (comment.likedBy || []).includes(user?.uid) 
                                                ? 'text-primary bg-primary/10' 
                                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                        }`}
                                    >
                                        <ThumbsUp className={`h-3.5 w-3.5 ${((comment.likedBy || []).includes(user?.uid)) ? "fill-current" : ""}`} />
                                        <span>{comment.likes > 0 ? comment.likes : 'Like'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}
