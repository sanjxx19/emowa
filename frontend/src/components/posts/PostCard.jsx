import React, { useState, useEffect } from "react";
import {
  Heart,
  MessageCircle,
  Zap,
  Share2,
  User as UserIcon,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import {
  formatDate,
  getSentimentIcon,
  getSentimentColor,
} from "../../utils/formatting";

export const PostCard = ({ post, onPostDeleted }) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchLikeStatus();
    fetchCurrentUser();
  }, [post.post_id]);

  const fetchCurrentUser = async () => {
    try {
      const user = await api.getCurrentUser();
      setCurrentUser(user);
    } catch (err) {
      console.error("Failed to fetch current user:", err);
    }
  };

  const fetchLikeStatus = async () => {
    try {
      const likeData = await api.getPostLikes(post.post_id);
      setLikeCount(likeData.total_likes || 0);
      setIsLiked(likeData.user_has_liked || false);
    } catch (err) {
      console.error("Failed to fetch like status:", err);
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    try {
      if (isLiked) {
        await api.unlikePost(post.post_id);
        setIsLiked(false);
        setLikeCount((prev) => Math.max(0, prev - 1));
      } else {
        await api.likePost(post.post_id);
        setIsLiked(true);
        setLikeCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Failed to toggle like:", err);
    }
  };

  const handleShare = (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/post/${post.post_id}`;
    navigator.clipboard.writeText(url).then(() => {
      setShowShareTooltip(true);
      setTimeout(() => setShowShareTooltip(false), 2000);
    });
  };

  const handleCardClick = () => {
    navigate(`/post/${post.post_id}`);
  };

  const handleUserClick = (e) => {
    e.stopPropagation();
    navigate(`/user/${post.user_id}`);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();

    if (
      !window.confirm(
        "Are you sure you want to delete this post? This action cannot be undone.",
      )
    ) {
      return;
    }

    setDeleting(true);
    try {
      await api.deletePost(post.post_id);
      if (onPostDeleted) {
        onPostDeleted(post.post_id);
      }
    } catch (err) {
      console.error("Failed to delete post:", err);
      alert("Failed to delete post. Please try again.");
    } finally {
      setDeleting(false);
      setShowMenu(false);
    }
  };

  const isOwner = currentUser?.user_id === post.user_id;

  return (
    <div
      onClick={handleCardClick}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-4 hover:shadow-xl transition-all cursor-pointer relative"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {post.title}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleUserClick}
              className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              <UserIcon className="w-3 h-3" />
              {post.user_name}
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              • {formatDate(post.created_at)}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2">
          {/* Sentiment/Sarcasm Tags */}
          {(post.sentiment_label || post.is_sarcastic) && (
            <div className="flex flex-wrap gap-1">
              {post.sentiment_label && (
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getSentimentColor(post.sentiment_label)}`}
                >
                  {getSentimentIcon(post.sentiment_label)}
                  {post.sentiment_label}
                </span>
              )}

              {post.is_sarcastic && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-700">
                  <Zap className="w-3 h-3" />
                  Sarcastic
                </span>
              )}
            </div>
          )}

          {/* Menu Button - Only show if user owns the post */}
          {isOwner && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 z-10">
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="w-full flex items-center gap-2 px-4 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    {deleting ? "Deleting..." : "Delete Post"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
        {post.content}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-1 transition-colors ${
              isLiked
                ? "text-red-500"
                : "text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
            <span className="text-sm font-medium">{likeCount}</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/post/${post.post_id}`);
            }}
            className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">Comment</span>
          </button>
          <div className="relative">
            <button
              onClick={handleShare}
              className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm">Share</span>
            </button>
            {showShareTooltip && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg whitespace-nowrap">
                Link copied!
              </div>
            )}
          </div>
        </div>

        {post.sentiment_confidence && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Confidence: {Math.round(post.sentiment_confidence * 100)}%
          </div>
        )}
      </div>
    </div>
  );
};
