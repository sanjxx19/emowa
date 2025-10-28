// FILE: frontend/src/components/profile/UserProfilePage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { User, Calendar, UserPlus, UserMinus, ArrowLeft } from "lucide-react";
import { api } from "../../services/api";
import { PostCard } from "../posts/PostCard";
import { UserListModal } from "./UserListModal"; // Import the modal

export const UserProfilePage = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        followers_count: 0,
        following_count: 0,
        posts_count: 0,
    });
    const [posts, setPosts] = useState([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    // *** NEW STATE FOR MODAL ***
    const [showUserListModal, setShowUserListModal] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalUsers, setModalUsers] = useState([]);
    const [modalLoading, setModalLoading] = useState(false);
    // *** END NEW STATE ***

    useEffect(() => {
        fetchProfileData();
    }, [userId]);

    const fetchProfileData = async () => {
        // ...(existing fetch logic remains the same)
        try {
            setLoading(true);

            // Fetch user profile
            const userResponse = await api.getUserProfile(userId);
            setUser(userResponse);

            // Fetch user stats
            const statsResponse = await api.getUserStats(userId);
            setStats(statsResponse);

            // Fetch user posts
            const postsResponse = await api.getUserPosts(userId);
            setPosts(postsResponse);

            // If logged in, check follow status and get current user
            if (api.token) {
                try {
                    const currentUserData = await api.getCurrentUser();
                    setCurrentUser(currentUserData);

                    // Only check follow status if viewing someone else's profile
                    if (currentUserData.user_id !== parseInt(userId)) {
                        const followResponse =
                            await api.getFollowStatus(userId);
                        setIsFollowing(followResponse.is_following);
                    }
                } catch (err) {
                    console.error("Failed to fetch follow status:", err);
                }
            }
        } catch (err) {
            console.error("Failed to fetch profile data:", err);
        } finally {
            setLoading(false);
        }
    };

    // --- (handleFollowToggle remains the same) ---
    const handleFollowToggle = async () => {
        if (!api.token) {
            alert("Please log in to follow users");
            navigate("/login");
            return;
        }

        try {
            if (isFollowing) {
                await api.unfollowUser(userId);
                setIsFollowing(false);
                setStats((prev) => ({
                    ...prev,
                    followers_count: Math.max(0, prev.followers_count - 1), // Prevent negative count
                }));
            } else {
                await api.followUser(userId);
                setIsFollowing(true);
                setStats((prev) => ({
                    ...prev,
                    followers_count: prev.followers_count + 1,
                }));
            }
        } catch (err) {
            console.error("Failed to toggle follow:", err);
            alert(err.message || "Failed to update follow status");
        }
    };

    // *** NEW FUNCTIONS TO HANDLE MODAL ***
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

    const closeModal = () => {
        setShowUserListModal(false);
        setModalUsers([]);
        setModalTitle("");
    };
    // *** END NEW FUNCTIONS ***

    // --- (Loading and user check remain the same) ---
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-pulse">
                        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                        User not found
                    </p>
                </div>
            </div>
        );
    }

    const isOwnProfile = currentUser?.user_id === parseInt(userId);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-4 inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>

                {/* Profile Header */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-colors mb-6">
                    <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

                    <div className="px-6 pb-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16">
                            {/* --- Profile Pic (remains same) --- */}
                            <div className="relative">
                                {user.profile_pic_url ? (
                                    <img
                                        src={user.profile_pic_url}
                                        alt={user.user_name}
                                        className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 object-cover"
                                    />
                                ) : (
                                    <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                        <User className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 sm:mt-4">
                                {/* --- User Name and Joined Date (remains same) --- */}
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {user.user_name}
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Joined{" "}
                                    {new Date(
                                        user.created_at,
                                    ).toLocaleDateString("en-US", {
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </p>
                            </div>

                            {/* --- Follow/Unfollow/Edit Button (remains same) --- */}
                            {!isOwnProfile && api.token && (
                                <button
                                    onClick={handleFollowToggle}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                        isFollowing
                                            ? "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                                            : "bg-blue-600 text-white hover:bg-blue-700"
                                    }`}
                                >
                                    {isFollowing ? (
                                        <>
                                            <UserMinus className="w-4 h-4" />
                                            Unfollow
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="w-4 h-4" />
                                            Follow
                                        </>
                                    )}
                                </button>
                            )}
                            {isOwnProfile && (
                                <button
                                    onClick={() => navigate("/")} // Navigate to main page which shows ProfilePage via sidebar
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Edit Profile
                                </button>
                            )}
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

                {/* User Posts */}
                <div>
                    {/* --- Posts rendering (remains same) --- */}
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Posts by {user.user_name}
                    </h2>
                    {posts.length > 0 ? (
                        <div className="space-y-4">
                            {posts.map((post) => (
                                <PostCard key={post.post_id} post={post} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
                            <p className="text-gray-600 dark:text-gray-400">
                                No posts yet
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Render Modal Conditionally */}
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
