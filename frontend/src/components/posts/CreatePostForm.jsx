import React, { useState, useEffect, useCallback } from "react";
import { Send, Eye, EyeOff, AlertTriangle, BarChart3, Zap } from "lucide-react";
import { api } from "../../services/api";
import { getSentimentIcon, getSentimentColor } from "../../utils/formatting";

export const CreatePostForm = ({ onPostCreated }) => {
    const [formData, setFormData] = useState({ title: "", content: "" });
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [showAnalysis, setShowAnalysis] = useState(false);

    const analyzeContent = useCallback(async () => {
        if (!formData.content.trim()) return;

        try {
            const result = await api.analyzeText(formData.content);
            setAnalysis(result);
        } catch (err) {
            console.error("Analysis failed:", err);
        }
    }, [formData.content]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (formData.content.length > 10) {
                analyzeContent();
            }
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [formData.content, analyzeContent]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.createPost(formData.title, formData.content);
            setFormData({ title: "", content: "" });
            setAnalysis(null);
            onPostCreated();
        } catch (err) {
            console.error("Failed to create post:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Create New Post
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <input
                        type="text"
                        placeholder="Post title..."
                        value={formData.title}
                        onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div className="relative">
                    <textarea
                        placeholder="What's on your mind?"
                        value={formData.content}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                content: e.target.value,
                            })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                        required
                    />

                    {analysis && (
                        <div className="absolute top-2 right-2">
                            <button
                                type="button"
                                onClick={() => setShowAnalysis(!showAnalysis)}
                                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                {showAnalysis ? (
                                    <EyeOff className="w-4 h-4" />
                                ) : (
                                    <Eye className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {analysis && showAnalysis && (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <h4 className="font-medium text-gray-900 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4" />
                            AI Analysis Preview
                        </h4>

                        <div className="flex flex-wrap gap-2">
                            <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getSentimentColor(analysis.sentiment?.sentiment_label)}`}
                            >
                                {getSentimentIcon(
                                    analysis.sentiment?.sentiment_label,
                                )}
                                {analysis.sentiment?.sentiment_label} (
                                {Math.round(
                                    analysis.sentiment?.confidence * 100,
                                )}
                                %)
                            </span>

                            {analysis.sarcasm?.is_sarcastic && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                                    <Zap className="w-3 h-3" />
                                    Sarcastic (
                                    {Math.round(
                                        analysis.sarcasm.confidence * 100,
                                    )}
                                    %)
                                </span>
                            )}

                            {analysis.needs_review && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                                    <AlertTriangle className="w-3 h-3" />
                                    Needs Review
                                </span>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={
                            loading ||
                            !formData.title.trim() ||
                            !formData.content.trim()
                        }
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Posting...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                Post
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};
