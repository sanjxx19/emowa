import React, { useState } from "react";
import { api } from "../../services/api";

export const LoginForm = ({ onLogin, onSwitchToRegister }) => {
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await api.login(formData.username, formData.password);
            onLogin();
        } catch (err) {
            setError("Invalid username or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">EMOWA</h1>
                <p className="text-gray-600">Sentiment-Aware Social Platform</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.username}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                username: e.target.value,
                            })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                    </label>
                    <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                password: e.target.value,
                            })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {error && (
                    <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                    {loading ? "Logging in..." : "Login"}
                </button>

                <p className="text-center text-gray-600">
                    Don't have an account?{" "}
                    <button
                        type="button"
                        onClick={onSwitchToRegister}
                        className="text-blue-600 hover:underline"
                    >
                        Sign up
                    </button>
                </p>
            </form>
        </div>
    );
};
