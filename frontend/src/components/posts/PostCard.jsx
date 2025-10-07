import React from "react";
import { Heart, MessageCircle, Zap } from "lucide-react";
import { formatDate, getSentimentIcon, getSentimentColor } from '../../utils/formatting';

export const PostCard = ({ post }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-4 hover:shadow-xl transition-all">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {post.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            User {post.user_id} • {formatDate(post.created_at)}
          </p>
        </div>

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
      </div>

      <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">{post.content}</p>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
            <Heart className="w-4 h-4" />
            <span className="text-sm">Like</span>
          </button>
          <button className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">Comment</span>
          </button>
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
