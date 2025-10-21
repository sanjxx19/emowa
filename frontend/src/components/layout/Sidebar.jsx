import React from "react";
import { User, MessageCircle, BarChart3, Shield } from "lucide-react";
import { api } from "../../services/api";

export const Sidebar = ({ currentView, onViewChange, user }) => {
    const menuItems = [
        { id: "feed", label: "Feed", icon: MessageCircle, adminOnly: false },
        { id: "profile", label: "Profile", icon: User, adminOnly: false },
    ];

    // Add admin menu item if user is admin
    if (user?.is_admin) {
        menuItems.push({
            id: "admin",
            label: "Admin Panel",
            icon: Shield,
            adminOnly: true,
        });
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    EMOWA
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Welcome, {user?.user_name}
                    {user?.is_admin && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                            Admin
                        </span>
                    )}
                </p>
            </div>

            <nav className="space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onViewChange(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                                currentView === item.id
                                    ? item.adminOnly
                                        ? "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300"
                                        : "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => {
                        api.setToken(null);
                        window.location.reload();
                    }}
                    className="w-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg text-left transition-colors"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};
