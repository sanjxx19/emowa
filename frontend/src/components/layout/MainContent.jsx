import React, { useState, useEffect, useCallback } from "react";
import { MessageCircle } from "lucide-react";
import { api } from "../../services/api";
import { CreatePostForm } from "../posts/CreatePostForm";
import { PostCard } from "../posts/PostCard";
import { SentimentFilter } from "../posts/SentimentFilter";
import { AnalyticsDashboard } from "../analytics/AnalyticsDashboard";

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
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Profile Settings
                </h3>
                <p className="text-gray-600">
                    Profile management features coming soon...
                </p>
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
                                className="bg-white rounded-xl shadow-lg p-6 animate-pulse"
                            >
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/4 mb-4"></div>
                                <div className="space-y-2">
                                    <div className="h-3 bg-gray-200 rounded"></div>
                                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : posts.length > 0 ? (
                    posts.map((post) => (
                        <PostCard key={post.post_id} post={post} />
                    ))
                ) : (
                    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                        <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No posts yet
                        </h3>
                        <p className="text-gray-600">
                            Be the first to share something!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
