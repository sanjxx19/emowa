import React from "react";
import { User, MessageCircle, Shield } from "lucide-react";

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
                <div className="flex items-center gap-3 mb-2">
                    {/* Profile Picture */}
                    {user?.profile_pic_url ? (
                        <img
                            src={user.profile_pic_url}
                            alt={user.user_name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
                        />
                    ) : (
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center border-2 border-blue-500">
                            <span className="text-white text-lg font-bold">
                                {user?.user_name?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}

                    <div className="flex-1">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            Welcome back,
                        </p>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                            {user?.user_name}
                        </h2>
                    </div>
                </div>

                {user?.is_admin && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                        Admin
                    </span>
                )}
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
        </div>
    );
};
