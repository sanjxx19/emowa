import React, { useState, useEffect, useMemo } from "react"; // Added useMemo
// Added SortAsc, SortDesc, ThumbsUp icons
import {
    Send,
    Heart,
    Reply,
    Trash2,
    Edit2,
    X,
    Check,
    SortAsc,
    SortDesc,
    ThumbsUp,
} from "lucide-react";
import { api } from "../../services/api";
import { formatDate } from "../../utils/formatting";

export const CommentSection = ({ postId }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState("");
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyContent, setReplyContent] = useState("");
    const [editingComment, setEditingComment] = useState(null);
    const [editContent, setEditContent] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [sortOrder, setSortOrder] = useState("newest"); // 'newest', 'oldest', 'likes'

    useEffect(() => {
        fetchComments();
        fetchCurrentUser();
    }, [postId]); // Keep fetching comments only when postId changes initially

    const fetchCurrentUser = async () => {
        // ... (fetchCurrentUser logic remains the same)
        try {
            const user = await api.getCurrentUser();
            setCurrentUser(user);
        } catch (err) {
            console.error("Failed to fetch current user:", err);
        }
    };

    const fetchComments = async () => {
        // ... (fetchComments logic remains the same)
        try {
            setLoading(true); // Ensure loading is set
            const data = await api.getComments(postId);
            // Ensure like_count exists, defaulting to 0 if null/undefined
            const commentsWithDefaults = data.map((c) => ({
                ...c,
                like_count: c.like_count || 0,
            }));
            setComments(commentsWithDefaults);
        } catch (err) {
            console.error("Failed to fetch comments:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || submitting) return;

        setSubmitting(true);
        try {
            await api.createComment(postId, newComment);
            setNewComment("");
            await fetchComments();
        } catch (err) {
            console.error("Failed to create comment:", err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleReply = async (commentId) => {
        if (!replyContent.trim() || submitting) return;

        setSubmitting(true);
        try {
            await api.createComment(postId, replyContent, commentId);
            setReplyContent("");
            setReplyingTo(null);
            await fetchComments();
        } catch (err) {
            console.error("Failed to create reply:", err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditComment = async (commentId) => {
        if (!editContent.trim() || submitting) return;

        setSubmitting(true);
        try {
            await api.updateComment(postId, commentId, editContent);
            setEditingComment(null);
            setEditContent("");
            await fetchComments();
        } catch (err) {
            console.error("Failed to update comment:", err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Are you sure you want to delete this comment?"))
            return;

        try {
            await api.deleteComment(postId, commentId);
            await fetchComments();
        } catch (err) {
            console.error("Failed to delete comment:", err);
        }
    };

    const handleLikeComment = async (commentId) => {
        try {
            const comment = comments.find((c) => c.comment_id === commentId);
            if (!api.token) {
                alert("Please log in to like comments");
                // Optional: redirect to login
                return;
            }
            if (comment?.user_has_liked) {
                await api.unlikeComment(postId, commentId);
            } else {
                await api.likeComment(postId, commentId);
            }
            // Refetch comments to get updated like counts and statuses
            await fetchComments();
        } catch (err) {
            console.error("Failed to toggle comment like:", err);
        }
    };

    const startEdit = (comment) => {
        setEditingComment(comment.comment_id);
        setEditContent(comment.content);
    };

    const cancelEdit = () => {
        setEditingComment(null);
        setEditContent("");
    };

    const handleUserClick = (userId) => {
        navigate(`/user/${userId}`);
    };

    const sortedComments = useMemo(() => {
        const sorted = [...comments]; // Create a shallow copy to sort
        switch (sortOrder) {
            case "oldest":
                sorted.sort(
                    (a, b) => new Date(a.created_at) - new Date(b.created_at),
                );
                break;
            case "likes":
                // Sort by likes descending, then newest first as a tie-breaker
                sorted.sort((a, b) => {
                    if (b.like_count !== a.like_count) {
                        return b.like_count - a.like_count;
                    }
                    return new Date(b.created_at) - new Date(a.created_at);
                });
                break;
            case "newest": // Fallthrough default
            default:
                sorted.sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at),
                );
                break;
        }
        return sorted;
    }, [comments, sortOrder]); // Re-sort only when comments or sortOrder changes

    // Organize comments into parent and children using the *sorted* list
    const organizedComments = useMemo(() => {
        const commentMap = {};
        const rootComments = [];

        // First pass: create a map of all comments using the sorted list
        sortedComments.forEach((comment) => {
            commentMap[comment.comment_id] = { ...comment, replies: [] };
        });

        // Second pass: organize into tree structure
        // Iterate through the *original* sorted list to maintain order
        sortedComments.forEach((comment) => {
            if (
                comment.parent_comment_id &&
                commentMap[comment.parent_comment_id]
            ) {
                // Check if reply already added (can happen if parent appears after child in sorted list)
                if (
                    !commentMap[comment.parent_comment_id].replies.find(
                        (r) => r.comment_id === comment.comment_id,
                    )
                ) {
                    commentMap[comment.parent_comment_id].replies.push(
                        commentMap[comment.comment_id],
                    );
                }
            } else {
                // Check if root comment already added (handles potential duplicates if logic gets complex)
                if (
                    !rootComments.find(
                        (r) => r.comment_id === comment.comment_id,
                    )
                ) {
                    rootComments.push(commentMap[comment.comment_id]);
                }
            }
        });

        // Optional: Sort replies within each parent comment according to the global sort order
        // This ensures replies maintain consistency, although chronological often makes sense for replies.
        // If you want replies sorted like top-level comments:
        // Object.values(commentMap).forEach(parentComment => {
        //     parentComment.replies.sort((a, b) => {
        //          switch (sortOrder) {
        //              case 'oldest': return new Date(a.created_at) - new Date(b.created_at);
        //              case 'likes': return (b.like_count || 0) - (a.like_count || 0) || (new Date(b.created_at) - new Date(a.created_at));
        //              default: return new Date(b.created_at) - new Date(a.created_at);
        //          }
        //     });
        // });

        return rootComments;
    }, [sortedComments, sortOrder]); // Re-organize when sortedComments changes

    const renderComment = (comment, isReply = false) => {
        const isOwner = currentUser?.user_id === comment.user_id;
        const isEditing = editingComment === comment.comment_id;

        return (
            <div
                key={comment.comment_id}
                className={`${isReply ? "ml-12 mt-3" : "mb-4"} bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 transition-colors`}
            >
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleUserClick(comment.user_id)}
                            className="flex items-center hover:opacity-80 transition-opacity"
                        >
                            <div>
                                <div className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    {comment.user_name ||
                                        `User ${comment.user_id}`}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatDate(comment.created_at)}
                                    {comment.updated_at !==
                                        comment.created_at && (
                                        <span className="ml-1">(edited)</span>
                                    )}
                                </div>
                            </div>
                        </button>
                    </div>

                    {isOwner && !isEditing && (
                        <div className="flex gap-1">
                            <button
                                onClick={() => startEdit(comment)}
                                className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() =>
                                    handleDeleteComment(comment.comment_id)
                                }
                                className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {isEditing ? (
                    <div className="space-y-2">
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                            rows={2}
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() =>
                                    handleEditComment(comment.comment_id)
                                }
                                disabled={submitting}
                                className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm transition-colors"
                            >
                                <Check className="w-3 h-3" />
                                Save
                            </button>
                            <button
                                onClick={cancelEdit}
                                className="flex items-center gap-1 px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 text-sm transition-colors"
                            >
                                <X className="w-3 h-3" />
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <p className="text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-wrap">
                            {comment.content}
                        </p>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() =>
                                    handleLikeComment(comment.comment_id)
                                }
                                className={`flex items-center gap-1 text-sm transition-colors ${
                                    comment.user_has_liked
                                        ? "text-red-500"
                                        : "text-gray-500 dark:text-gray-400 hover:text-red-500"
                                }`}
                            >
                                <Heart
                                    className={`w-4 h-4 ${comment.user_has_liked ? "fill-current" : ""}`}
                                />
                                <span>{comment.like_count || 0}</span>
                            </button>

                            {!isReply && (
                                <button
                                    onClick={() => {
                                        setReplyingTo(comment.comment_id);
                                        setReplyContent("");
                                    }}
                                    className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors"
                                >
                                    <Reply className="w-4 h-4" />
                                    Reply
                                </button>
                            )}
                        </div>

                        {replyingTo === comment.comment_id && (
                            <div className="mt-3 ml-6">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={replyContent}
                                        onChange={(e) =>
                                            setReplyContent(e.target.value)
                                        }
                                        placeholder="Write a reply..."
                                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                        onKeyPress={(e) => {
                                            if (
                                                e.key === "Enter" &&
                                                !e.shiftKey
                                            ) {
                                                e.preventDefault();
                                                handleReply(comment.comment_id);
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={() =>
                                            handleReply(comment.comment_id)
                                        }
                                        disabled={
                                            submitting || !replyContent.trim()
                                        }
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setReplyingTo(null);
                                            setReplyContent("");
                                        }}
                                        className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Render replies */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-3 space-y-3">
                        {comment.replies.map((reply) =>
                            renderComment(reply, true),
                        )}
                    </div>
                )}
            </div>
        );
    };

    const SortButton = ({ order, label, icon }) => (
        <button
            onClick={() => setSortOrder(order)}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors border ${
                sortOrder === order
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border-gray-200 dark:border-gray-600"
            }`}
        >
            {icon}
            {label}
        </button>
    );

    return (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Comments ({comments.length})
                </h3>
                {/* Sort Controls */}
                <div className="flex flex-wrap gap-2">
                    <SortButton
                        order="newest"
                        label="Newest"
                        icon={<SortDesc className="w-4 h-4" />}
                    />
                    <SortButton
                        order="oldest"
                        label="Oldest"
                        icon={<SortAsc className="w-4 h-4" />}
                    />
                    <SortButton
                        order="likes"
                        label="Top"
                        icon={<ThumbsUp className="w-4 h-4" />}
                    />
                </div>
            </div>

            {/* New Comment Form (only show if logged in) */}
            {api.token && (
                <form onSubmit={handleSubmitComment} className="mb-6">
                    {/* ... form content ... */}
                </form>
            )}

            {/* Comments List */}
            {loading ? (
                <div className="space-y-4">
                    {" "}
                    {/* ... loading skeleton ... */}{" "}
                </div>
            ) : comments.length > 0 ? (
                // Use organizedComments which is derived from sortedComments
                <div className="space-y-4">
                    {organizedComments.map((comment) => renderComment(comment))}
                </div>
            ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    No comments yet. Be the first to comment!
                </p>
            )}
        </div>
    );
};
