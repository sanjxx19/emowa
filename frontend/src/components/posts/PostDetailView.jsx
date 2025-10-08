import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, MessageCircle, Share2, Send, Zap, Clock } from "lucide-react";
import { api } from "../../services/api";
import { formatDate, getSentimentIcon, getSentimentColor } from "../../utils/formatting";
import { CommentSection } from "../comments/CommentSection";

export const PostDetailView = () => {
    const { postId } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [showShareTooltip, setShowShareTooltip] = useState(false);

    useEffect(() => {
        fetchPost();
        fetchLikeStatus();
    }, [postId]);

    const fetchPost = async () => {
        try {
            setLoading(true);
            const data = await api.getPost(postId);
            setPost(data);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch post:", err);
            setError("Failed to load post. It may not exist or you don't have permission.");
        } finally {
            setLoading(false);
        }
    };

    const fetchLikeStatus = async () => {
        try {
            // Only fetch like status if user is authenticated
            if (api.token) {
                const likeData = await api.getPostLikes(postId);
                setLikeCount(likeData.total_likes || 0);
                setIsLiked(likeData.user_has_liked || false);
            }
        } catch (err) {
            console.error("Failed to fetch like status:", err);
        }
    };

    const handleLike = async () => {
        // Check if user is authenticated
        if (!api.token) {
            alert("Please log in to like posts");
            navigate("/login");
            return;
        }

        try {
            if (isLiked) {
                await api.unlikePost(postId);
                setIsLiked(false);
                setLikeCount(prev => Math.max(0, prev - 1));
            } else {
                await api.likePost(postId);
                setIsLiked(true);
                setLikeCount(prev => prev + 1);
            }
        } catch (err) {
            console.error("Failed to toggle like:", err);
        }
    };

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            setShowShareTooltip(true);
            setTimeout(() => setShowShareTooltip(false), 2000);
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-pulse">
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
                        <div className="space-y-3">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
                        <div className="text-red-500 dark:text-red-400 text-xl mb-4">⚠️</div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Post Not Found
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            {error || "The post you're looking for doesn't exist."}
                        </p>
                        <button
                            onClick={() => navigate("/")}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Feed
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Back Button */}
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>

                    {!api.token && (
                        <button
                            onClick={() => navigate("/login")}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Login to Interact
                        </button>
                    )}
                </div>

                {/* Post Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-colors">
                    <div className="p-6">
                        {/* Post Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    {post.title}
                                </h1>
                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                    <span>User {post.user_id}</span>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {formatDate(post.created_at)}
                                    </div>
                                </div>
                            </div>

                            {/* Sentiment & Sarcasm Tags */}
                            {(post.sentiment_label || post.is_sarcastic) && (
                                <div className="flex flex-wrap gap-2">
                                    {post.sentiment_label && (
                                        <span
                                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getSentimentColor(post.sentiment_label)}`}
                                        >
                                            {getSentimentIcon(post.sentiment_label)}
                                            {post.sentiment_label}
                                        </span>
                                    )}

                                    {post.is_sarcastic && (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-700">
                                            <Zap className="w-3 h-3" />
                                            Sarcastic
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Post Content */}
                        <div className="prose dark:prose-invert max-w-none mb-6">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                {post.content}
                            </p>
                        </div>

                        {/* Sentiment Confidence */}
                        {post.sentiment_confidence && (
                            <div className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                                AI Confidence: {Math.round(post.sentiment_confidence * 100)}%
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleLike}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                                        isLiked
                                            ? "text-red-500 bg-red-50 dark:bg-red-900/20"
                                            : "text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    }`}
                                >
                                    <Heart
                                        className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`}
                                    />
                                    <span className="font-medium">{likeCount}</span>
                                </button>

                                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                    <MessageCircle className="w-5 h-5" />
                                    <span className="font-medium">Comments</span>
                                </div>
                            </div>

                            <div className="relative">
                                <button
                                    onClick={handleShare}
                                    className="flex items-center gap-2 px-3 py-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                >
                                    <Share2 className="w-5 h-5" />
                                    <span className="font-medium">Share</span>
                                </button>

                                {showShareTooltip && (
                                    <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg whitespace-nowrap">
                                        Link copied!
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Comments Section */}
                <CommentSection postId={postId} />
            </div>
        </div>
    );
};
