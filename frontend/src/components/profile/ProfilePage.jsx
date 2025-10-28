// FILE: frontend/src/components/profile/ProfilePage.jsx
import React, { useState, useEffect } from "react";
// Added MessageSquare, UserPlus, UserMinus
import {
    User,
    Mail,
    Lock,
    Camera,
    Save,
    X,
    Edit2,
    CheckCircle,
    MessageSquare,
    UserPlus,
    UserMinus,
} from "lucide-react";
import { api } from "../../services/api";
import { PostCard } from "../posts/PostCard";
import { UserListModal } from "./UserListModal"; // Import the modal

export const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [formData, setFormData] = useState({
        user_email: "",
        profile_pic_url: "",
        password: "",
        confirmPassword: "",
    });
    const [userPosts, setUserPosts] = useState([]); // State for user posts
    const [stats, setStats] = useState({
        total_posts: 0,
        followers_count: 0,
        following_count: 0,
    });
    const [loadingPosts, setLoadingPosts] = useState(true); // Separate loading state for posts

    const [showUserListModal, setShowUserListModal] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalUsers, setModalUsers] = useState([]);
    const [modalLoading, setModalLoading] = useState(false);

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            setLoadingPosts(true);
            const userData = await api.getCurrentUser();
            setUser(userData);
            setFormData({
                user_email: userData.user_email || "",
                profile_pic_url: userData.profile_pic_url || "",
                password: "",
                confirmPassword: "",
            });

            const posts = await api.getUserPosts(userData.user_id);
            setUserPosts(posts);
            setLoadingPosts(false);

            try {
                const userStats = await api.getUserStats(userData.user_id);
                setStats({
                    total_posts: userStats.posts_count ?? posts.length,
                    followers_count: userStats.followers_count ?? 0, // Use consistent naming
                    following_count: userStats.following_count ?? 0, // Use consistent naming
                });
            } catch (statsErr) {
                console.error(
                    "Failed to fetch user stats, using post count only:",
                    statsErr,
                );
                setStats({
                    total_posts: posts.length,
                    followers_count: 0, // Use consistent naming
                    following_count: 0, // Use consistent naming
                });
            }
        } catch (err) {
            console.error("Failed to fetch user data:", err);
            setMessage({ type: "error", text: "Failed to load profile" });
            setLoadingPosts(false);
        } finally {
            setLoading(false);
        }
    };

    // --- (handleSubmit, handleCancel functions remain the same) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: "", text: "" });

        // Validate passwords match if changing password
        if (
            formData.password &&
            formData.password !== formData.confirmPassword
        ) {
            setMessage({ type: "error", text: "Passwords do not match" });
            setSaving(false);
            return;
        }

        try {
            const updateData = {
                user_email: formData.user_email,
                profile_pic_url: formData.profile_pic_url || null,
            };

            // Only include password if it's being changed
            if (formData.password) {
                updateData.password = formData.password;
            }

            const updatedUser = await api.updateCurrentUser(updateData);
            setUser(updatedUser);
            setEditing(false);
            setFormData({
                ...formData,
                password: "",
                confirmPassword: "",
            });
            setMessage({
                type: "success",
                text: "Profile updated successfully!",
            });

            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        } catch (err) {
            console.error("Failed to update profile:", err);
            setMessage({
                type: "error",
                text: "Failed to update profile. Please try again.",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setEditing(false);
        setFormData({
            user_email: user.user_email || "",
            profile_pic_url: user.profile_pic_url || "",
            password: "",
            confirmPassword: "",
        });
        setMessage({ type: "", text: "" });
    };

    const fetchAndShowUsers = async (type) => {
        if (
            (type === "followers" && stats.followers_count === 0) ||
            (type === "following" && stats.following_count === 0)
        ) {
            return; // Don't open modal if count is 0
        }

        setModalTitle(type === "followers" ? "Followers" : "Following");
        setShowUserListModal(true);
        setModalLoading(true);
        setModalUsers([]); // Clear previous users

        try {
            let users;
            if (type === "followers") {
                users = await api.getFollowers(userId);
            } else {
                users = await api.getFollowing(userId);
            }
            // Assuming API returns an array of user objects { user_id, user_name, profile_pic_url? }
            setModalUsers(users || []);
        } catch (err) {
            console.error(`Failed to fetch ${type}:`, err);
            // Optionally show an error message in the modal
        } finally {
            setModalLoading(false);
        }
    };
    // *** END REVISED FUNCTION ***

    // closeModal function remains the same
    const closeModal = () => {
        setShowUserListModal(false);
        setModalUsers([]);
        setModalTitle("");
        // setMessage({ type: "", text: "" }); // Clear any error messages if you add them later
    };

    // --- (Loading and user check remain the same) ---
    if (loading) {
        // Only show main profile loading initially
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="animate-pulse space-y-6">
                    <div className="flex items-center space-x-4">
                        <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="space-y-6">
            {/* Profile Header Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-colors">
                <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

                <div className="px-6 pb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16">
                        <div className="relative">
                            {/* --- Profile Picture Logic (remains same) --- */}
                            {formData.profile_pic_url ? (
                                <img
                                    src={formData.profile_pic_url}
                                    alt={user.user_name}
                                    className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 object-cover"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                    <User className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                                </div>
                            )}
                            {editing && (
                                <button className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-colors">
                                    <Camera className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <div className="flex-1 sm:mt-4">
                            {/* --- User Name and Joined Date (remains same) --- */}
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {user.user_name}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                Member since{" "}
                                {new Date(user.created_at).toLocaleDateString(
                                    "en-US",
                                    { month: "long", year: "numeric" },
                                )}
                            </p>
                        </div>

                        <div className="flex gap-2">
                            {/* --- Edit/Cancel Buttons (remains same) --- */}
                            {!editing ? (
                                <button
                                    onClick={() => setEditing(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Edit Profile
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={handleCancel}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                        Cancel
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Stats - NOW CLICKABLE */}
                    <div className="grid grid-cols-3 gap-4 mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="text-center">
                            {/* Posts count (not clickable) */}
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {stats.posts_count}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Posts
                            </div>
                        </div>
                        {/* Followers Count - Clickable */}
                        <button
                            onClick={() => fetchAndShowUsers("followers")}
                            disabled={stats.followers_count === 0}
                            className="text-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors disabled:opacity-50 disabled:cursor-default"
                        >
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {stats.followers_count}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Followers
                            </div>
                        </button>
                        {/* Following Count - Clickable */}
                        <button
                            onClick={() => fetchAndShowUsers("following")}
                            disabled={stats.following_count === 0}
                            className="text-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors disabled:opacity-50 disabled:cursor-default"
                        >
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {stats.following_count}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Following
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* --- Message Alert (remains same) --- */}
            {message.text && (
                <div
                    className={`rounded-lg p-4 flex items-center gap-2 ${
                        message.type === "success"
                            ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800"
                            : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800"
                    }`}
                >
                    {message.type === "success" && (
                        <CheckCircle className="w-5 h-5" />
                    )}
                    {message.text}
                </div>
            )}

            {/* Profile Information Card (editing form) */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Profile Information
                </h3>
                {/* --- Form fields (Username, Email, Profile Pic URL, Password) remain same --- */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Username (Read-only) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Username
                            </div>
                        </label>
                        <input
                            type="text"
                            value={user.user_name}
                            disabled
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Username cannot be changed
                        </p>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                Email Address
                            </div>
                        </label>
                        <input
                            type="email"
                            value={formData.user_email}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    user_email: e.target.value,
                                })
                            }
                            disabled={!editing}
                            className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                                editing
                                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    : "bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300"
                            }`}
                            required
                        />
                    </div>

                    {/* Profile Picture URL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <div className="flex items-center gap-2">
                                <Camera className="w-4 h-4" />
                                Profile Picture URL
                            </div>
                        </label>
                        <input
                            type="url"
                            value={formData.profile_pic_url}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    profile_pic_url: e.target.value,
                                })
                            }
                            disabled={!editing}
                            placeholder="https://example.com/profile.jpg"
                            className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                                editing
                                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                    : "bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300"
                            }`}
                        />
                    </div>

                    {/* Password Section (only visible when editing) */}
                    {editing && (
                        <>
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                                    Change Password
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    Leave blank if you don't want to change your
                                    password
                                </p>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            <div className="flex items-center gap-2">
                                                <Lock className="w-4 h-4" />
                                                New Password
                                            </div>
                                        </label>
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    password: e.target.value,
                                                })
                                            }
                                            placeholder="Enter new password"
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                            minLength={6}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            <div className="flex items-center gap-2">
                                                <Lock className="w-4 h-4" />
                                                Confirm New Password
                                            </div>
                                        </label>
                                        <input
                                            type="password"
                                            value={formData.confirmPassword}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    confirmPassword:
                                                        e.target.value,
                                                })
                                            }
                                            placeholder="Confirm new password"
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                            minLength={6}
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Save Button */}
                    {editing && (
                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {saving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </form>
            </div>

            {/* Account Details (remains same) */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Account Details
                </h3>
                <div className="space-y-3 text-sm">
                    {/* User ID, Created, Updated (remain same) */}
                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">
                            User ID
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                            {user.user_id}
                        </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">
                            Account Created
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                            {new Date(user.created_at).toLocaleDateString(
                                "en-US",
                                {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                },
                            )}
                        </span>
                    </div>
                    <div className="flex justify-between py-2">
                        <span className="text-gray-600 dark:text-gray-400">
                            Last Updated
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                            {new Date(user.updated_at).toLocaleDateString(
                                "en-US",
                                {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                },
                            )}
                        </span>
                    </div>
                </div>
            </div>

            {/* User Posts Section - NEW */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Your Posts
                </h3>
                {loadingPosts ? (
                    <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Loading posts...
                        </p>
                    </div>
                ) : userPosts.length > 0 ? (
                    <div className="space-y-4">
                        {userPosts.map((post) => (
                            <PostCard
                                key={post.post_id}
                                post={post}
                                onPostDeleted={() => fetchUserData()}
                            /> // Refresh data if post deleted
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">
                            You haven't created any posts yet.
                        </p>
                    </div>
                )}
            </div>
            {showUserListModal && (
                <UserListModal
                    title={modalTitle}
                    users={modalUsers}
                    onClose={closeModal}
                    isLoading={modalLoading}
                />
            )}
        </div>
    );
};
