import React, { useState, useEffect } from "react";
import {
    Shield,
    Users,
    FileText,
    TrendingUp,
    AlertTriangle,
} from "lucide-react";
import { api } from "../../services/api";
import { AnalyticsDashboard } from "../analytics/AnalyticsDashboard";
import { AdminPostManagement } from "./AdminPostManagement";

export const AdminDashboard = () => {
    const [stats, setStats] = useState({
        total_users: 0,
        total_posts: 0,
        total_comments: 0,
        posts_needing_review: 0,
    });
    const [recentUsers, setRecentUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            const statsResponse = await api.getAdminStats();
            setStats(statsResponse);

            const usersResponse = await api.getRecentUsers(5);
            setRecentUsers(usersResponse);
        } catch (err) {
            console.error("Failed to fetch admin data:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-pulse">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div
                                key={i}
                                className="h-24 bg-gray-200 dark:bg-gray-700 rounded"
                            ></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Admin Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 text-white">
                    <Shield className="w-8 h-8" />
                    <div>
                        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
                        <p className="text-purple-100">
                            Platform Management & Analytics
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Grid - Now 4 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                        <Users className="w-8 h-8 text-blue-500" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Total
                        </span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        {stats.total_users}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Users
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                        <FileText className="w-8 h-8 text-green-500" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Total
                        </span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        {stats.total_posts}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Posts
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="w-8 h-8 text-purple-500" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Total
                        </span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        {stats.total_comments}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Comments
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                        <AlertTriangle className="w-8 h-8 text-orange-500" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Flagged
                        </span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        {stats.posts_needing_review}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Need Review
                    </div>
                </div>
            </div>

            {/* Recent Users */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Recent Users
                </h3>
                <div className="space-y-3">
                    {recentUsers.map((user) => (
                        <div
                            key={user.user_id}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900 dark:text-white">
                                        {user.user_name}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {user.user_email}
                                    </div>
                                </div>
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(user.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Analytics Section */}
            <AnalyticsDashboard />

            <AdminPostManagement showFlaggedOnly={true} />
        </div>
    );
};;
