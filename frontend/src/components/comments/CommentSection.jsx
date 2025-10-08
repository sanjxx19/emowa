import React, { useState, useEffect } from "react";
import { Send, Heart, Reply, Trash2, Edit2, X, Check } from "lucide-react";
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

    useEffect(() => {
        fetchComments();
        fetchCurrentUser();
    }, [postId]);

    const fetchCurrentUser = async () => {
        try {
            const user = await api.getCurrentUser();
            setCurrentUser(user);
        } catch (err) {
            console.error("Failed to fetch current user:", err);
        }
    };

    const fetchComments = async () => {
        try {
            const data = await api.getComments(postId);
            setComments(data);
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
        if (!window.confirm("Are you sure you want to delete this comment?")) return;

        try {
            await api.deleteComment(postId, commentId);
            await fetchComments();
        } catch (err) {
            console.error("Failed to delete comment:", err);
        }
    };

    const handleLikeComment = async (commentId) => {
        try {
            const comment = comments.find(c => c.comment_id === commentId);
            if (comment?.user_has_liked) {
                await api.unlikeComment(postId, commentId);
            } else {
                await api.likeComment(postId, commentId);
            }
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

    const renderComment = (comment, isReply = false) => {
        const isOwner = currentUser?.user_id === comment.user_id;
        const isEditing = editingComment === comment.comment_id;

        return (
            <div
                key={comment.comment_id}
                className={`${isReply ? "ml-12 mt-3" : "mb-4"} bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 transition-colors`}
            >
                <div className="flex items-start justify-between mb-2">
                    <div>
                        <span className="font-medium text-gray-900 dark:text-white">
                            User {comment.user_id}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                            {formatDate(comment.created_at)}
                        </span>
                        {comment.updated_at !== comment.created_at && (
                            <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">
                                (edited)
                            </span>
                        )}
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
                                onClick={() => handleDeleteComment(comment.comment_id)}
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
                                onClick={() => handleEditComment(comment.comment_id)}
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
                                onClick={() => handleLikeComment(comment.comment_id)}
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
                                        onChange={(e) => setReplyContent(e.target.value)}
                                        placeholder="Write a reply..."
                                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                        onKeyPress={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault();
                                                handleReply(comment.comment_id);
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={() => handleReply(comment.comment_id)}
                                        disabled={submitting || !replyContent.trim()}
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
                        {comment.replies.map((reply) => renderComment(reply, true))}
                    </div>
                )}
            </div>
        );
    };

    // Organize comments into parent and children
    const organizeComments = () => {
        const commentMap = {};
        const rootComments = [];

        // First pass: create a map of all comments
        comments.forEach(comment => {
            commentMap[comment.comment_id] = { ...comment, replies: [] };
        });

        // Second pass: organize into tree structure
        comments.forEach(comment => {
            if (comment.parent_comment_id && commentMap[comment.parent_comment_id]) {
                commentMap[comment.parent_comment_id].replies.push(commentMap[comment.comment_id]);
            } else {
                rootComments.push(commentMap[comment.comment_id]);
            }
        });

        return rootComments;
    };

    return (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Comments ({comments.length})
            </h3>

            {/* New Comment Form */}
            <form onSubmit={handleSubmitComment} className="mb-6">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                    <button
                        type="submit"
                        disabled={submitting || !newComment.trim()}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                        <Send className="w-4 h-4" />
                        Post
                    </button>
                </div>
            </form>

            {/* Comments List */}
            {loading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 animate-pulse"
                        >
                            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                        </div>
                    ))}
                </div>
            ) : comments.length > 0 ? (
                <div className="space-y-4">
                    {organizeComments().map((comment) => renderComment(comment))}
                </div>
            ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    No comments yet. Be the first to comment!
                </p>
            )}
        </div>
    );
};
