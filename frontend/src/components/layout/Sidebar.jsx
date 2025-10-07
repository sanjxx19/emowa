import React from "react";
import { User, MessageCircle, BarChart3 } from "lucide-react";
import { api } from "../../services/api";

export const Sidebar = ({ currentView, onViewChange, user }) => {
    const menuItems = [
        { id: "feed", label: "Feed", icon: MessageCircle },
        { id: "analytics", label: "Analytics", icon: BarChart3 },
        { id: "profile", label: "Profile", icon: User },
    ];

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">EMOWA</h2>
                <p className="text-sm text-gray-600">
                    Welcome, {user?.user_name}
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
                                    ? "bg-blue-100 text-blue-700"
                                    : "text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            <div className="mt-8 pt-6 border-t">
                <button
                    onClick={() => {
                        api.setToken(null);
                        window.location.reload();
                    }}
                    className="w-full text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg text-left transition-colors"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};
