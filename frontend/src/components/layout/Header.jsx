import React from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, LogOut } from "lucide-react";
import { DarkModeToggle } from "./DarkModeToggle";
import { api } from "../../services/api";

export const Header = ({ isAuthenticated, user }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        api.setToken(null);
        window.location.href = "/";
    };

    return (
        <header className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo/Brand */}
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-2 group"
                    >
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
                            <MessageCircle className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                            EMOWA
                        </span>
                    </button>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-4">
                        <DarkModeToggle />

                        {isAuthenticated && user ? (
                            <div className="flex items-center gap-3">
                                {/* Logout Button */}
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    title="Logout"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="hidden md:inline">
                                        Logout
                                    </span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => navigate("/login")}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => navigate("/signup")}
                                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                                >
                                    Sign Up
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};
