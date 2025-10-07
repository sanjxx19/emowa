import React, { useState, useEffect, useCallback } from "react";
import { MessageCircle } from "lucide-react";
import { api } from "../../services/api";
import { CreatePostForm } from "../posts/CreatePostForm";
import { PostCard } from "../posts/PostCard";
import { SentimentFilter } from "../posts/SentimentFilter";
import { AnalyticsDashboard } from "../analytics/AnalyticsDashboard";
import { ProfilePage } from "../profile/ProfilePage";

export const MainContent = ({ view, onPostCreated }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sentimentFilter, setSentimentFilter] = useState(null);

    const fetchPosts = useCallback(async () => {
        try {
            const data = await api.getPosts(0, 20, sentimentFilter);
            setPosts(data);
        } catch (err) {
            console.error("Failed to fetch posts:", err);
        } finally {
            setLoading(false);
        }
    }, [sentimentFilter]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handlePostCreated = () => {
        fetchPosts();
        onPostCreated();
    };

    if (view === "analytics") {
        return <AnalyticsDashboard />;
    }

    if (view === "profile") {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Profile Settings
                </h3>
                <ProfilePage />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <CreatePostForm onPostCreated={handlePostCreated} />
            <SentimentFilter
                currentFilter={sentimentFilter}
                onFilterChange={setSentimentFilter}
            />

            <div>
                {loading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-pulse"
                            >
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                                <div className="space-y-2">
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : posts.length > 0 ? (
                    posts.map((post) => (
                        <PostCard key={post.post_id} post={post} />
                    ))
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center transition-colors">
                        <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No posts yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Be the first to share something!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
