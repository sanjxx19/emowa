import React, { useState, useEffect, useCallback } from "react";
import { Trash2, AlertTriangle, RefreshCw, Filter } from "lucide-react";
import { api } from "../../services/api";
import {
    formatDate,
    getSentimentIcon,
    getSentimentColor,
} from "../../utils/formatting";
import { SentimentFilter } from "../posts/SentimentFilter";

export const AdminPostManagement = ({ showFlaggedOnly = false }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(null);
    const [sentimentFilter, setSentimentFilter] = useState(null);
    const [viewMode, setViewMode] = useState(
        showFlaggedOnly ? "flagged" : "all",
    );

    const fetchPosts = useCallback(async () => {
        try {
            setLoading(true);
            let data;
            if (viewMode === "flagged") {
                data = await api.getFlaggedPosts(0, 100);
            } else {
                data = await api.getPosts(0, 100, sentimentFilter);
            }
            setPosts(data);
        } catch (err) {
            console.error("Failed to fetch posts:", err);
        } finally {
            setLoading(false);
        }
    }, [sentimentFilter, viewMode]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handleUnflag = async (postId) => {
        try {
            await api.unflagPost(postId);
            setPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post.post_id === postId
                        ? { ...post, is_flagged: false, flagged_at: null }
                        : post,
                ),
            );
        } catch (err) {
            console.error("Failed to unflag post:", err);
            alert("Failed to unflag post. Please try again.");
        }
    };

    const handleAdminDelete = async (postId) => {
        if (
            !window.confirm(
                "Are you sure you want to permanently remove this post? This action cannot be undone.",
            )
        ) {
            return;
        }

        setDeleting(postId);
        try {
            await api.adminDeletePost(postId);
            setPosts((prevPosts) =>
                prevPosts.filter((post) => post.post_id !== postId),
            );
        } catch (err) {
            console.error("Failed to delete post:", err);
            alert("Failed to delete post. Please try again.");
        } finally {
            setDeleting(null);
        }
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
                <div className="animate-pulse space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="h-24 bg-gray-200 dark:bg-gray-700 rounded"
                        ></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
            <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {viewMode === "flagged"
                                ? "Flagged Posts"
                                : "All Posts"}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {viewMode === "flagged"
                                ? "Posts flagged for review by AI"
                                : "Review and remove inappropriate content"}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode("all")}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                    viewMode === "all"
                                        ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                                        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                                }`}
                            >
                                All Posts
                            </button>
                            <button
                                onClick={() => setViewMode("flagged")}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                                    viewMode === "flagged"
                                        ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                                        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                                }`}
                            >
                                <AlertTriangle className="w-3 h-3" />
                                Flagged
                            </button>
                        </div>
                        <button
                            onClick={fetchPosts}
                            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                        </button>
                    </div>
                </div>

                {viewMode === "all" && (
                    <SentimentFilter
                        currentFilter={sentimentFilter}
                        onFilterChange={setSentimentFilter}
                    />
                )}
            </div>

            {posts.length > 0 ? (
                <div className="space-y-3">
                    {posts.map((post) => (
                        <div
                            key={post.post_id}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                                            {post.title}
                                        </h4>
                                        {post.sentiment_label && (
                                            <span
                                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getSentimentColor(post.sentiment_label)}`}
                                            >
                                                {getSentimentIcon(
                                                    post.sentiment_label,
                                                )}
                                                {post.sentiment_label}
                                            </span>
                                        )}
                                        {post.is_sarcastic && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-700">
                                                Sarcastic
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 line-clamp-2">
                                        {post.content}
                                    </p>
                                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                        <span>By: {post.user_name}</span>
                                        <span>•</span>
                                        <span>
                                            {formatDate(post.created_at)}
                                        </span>
                                        <span>•</span>
                                        <span>ID: {post.post_id}</span>
                                    </div>
                                </div>

                                {post.is_flagged && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleUnflag(post.post_id);
                                        }}
                                        disabled={deleting === post.post_id}
                                        className="flex items-center gap-2 px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
                                    >
                                        <Shield className="w-4 h-4" />
                                        <span className="text-sm">Unflag</span>
                                    </button>
                                )}

                                <button
                                    onClick={() =>
                                        handleAdminDelete(post.post_id)
                                    }
                                    disabled={deleting === post.post_id}
                                    className="flex items-center gap-2 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
                                >
                                    {deleting === post.post_id ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                            <span className="text-sm">
                                                Deleting...
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4" />
                                            <span className="text-sm">
                                                Remove
                                            </span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8">
                    <AlertTriangle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                        {viewMode === "flagged"
                            ? "No flagged posts"
                            : "No posts found"}
                    </p>
                </div>
            )}
        </div>
    );
};
