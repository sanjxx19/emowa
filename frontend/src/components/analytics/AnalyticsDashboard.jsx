import React, { useState, useEffect } from "react";
import { TrendingUp } from "lucide-react";
import { api } from "../../services/api";
import { getSentimentIcon } from "../../utils/formatting";

export const AnalyticsDashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const data = await api.getSentimentAnalytics();
                setAnalytics(data);
            } catch (err) {
                console.error("Failed to fetch analytics:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-8 bg-gray-200 rounded"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!analytics) return null;

    const totalSentiments =
        analytics.sentiment_distribution?.reduce(
            (sum, item) => sum + item.count,
            0,
        ) || 0;

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Platform Analytics
            </h3>

            <div className="space-y-6">
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Sentiment Distribution
                    </h4>
                    <div className="space-y-2">
                        {analytics.sentiment_distribution?.map((item) => {
                            const percentage =
                                totalSentiments > 0
                                    ? (item.count / totalSentiments) * 100
                                    : 0;
                            return (
                                <div
                                    key={item.sentiment}
                                    className="flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-2">
                                        {getSentimentIcon(item.sentiment)}
                                        <span className="text-sm font-medium capitalize">
                                            {item.sentiment}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-20 bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${
                                                    item.sentiment ===
                                                    "positive"
                                                        ? "bg-green-500"
                                                        : item.sentiment ===
                                                            "negative"
                                                          ? "bg-red-500"
                                                          : "bg-gray-500"
                                                }`}
                                                style={{
                                                    width: `${percentage}%`,
                                                }}
                                            ></div>
                                        </div>
                                        <span className="text-sm text-gray-600 w-12 text-right">
                                            {item.count}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Sarcasm Statistics
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                            <div className="text-2xl font-bold text-gray-900">
                                {analytics.sarcasm_stats?.total_analyzed || 0}
                            </div>
                            <div className="text-sm text-gray-600">
                                Total Analyzed
                            </div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-3">
                            <div className="text-2xl font-bold text-purple-600">
                                {analytics.sarcasm_stats?.sarcasm_percentage ||
                                    0}
                                %
                            </div>
                            <div className="text-sm text-gray-600">
                                Sarcastic
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
