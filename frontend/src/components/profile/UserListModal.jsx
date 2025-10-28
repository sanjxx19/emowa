// FILE: frontend/src/components/profile/UserListModal.jsx
import React from 'react';
import { X, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const UserListModal = ({ title, users, onClose, isLoading }) => {
    const navigate = useNavigate();

    const handleUserClick = (userId) => {
        navigate(`/user/${userId}`);
        onClose(); // Close modal on navigation
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex justify-center items-center z-50 p-4"
            onClick={onClose} // Close on backdrop click
        >
            <div
                className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
            >
                {/* Modal Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto p-4">
                    {isLoading ? (
                        <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading...</p>
                        </div>
                    ) : users.length > 0 ? (
                        <ul className="space-y-3">
                            {users.map((user) => (
                                <li key={user.user_id}>
                                    <button
                                        onClick={() => handleUserClick(user.user_id)}
                                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 text-left transition-colors"
                                    >
                                        {/* Basic Profile Pic Placeholder */}
                                         {user.profile_pic_url ? (
                                            <img src={user.profile_pic_url} alt={user.user_name} className="w-10 h-10 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                <User className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{user.user_name}</p>
                                            {/* Optionally add email or other info if available */}
                                            {/* <p className="text-sm text-gray-500 dark:text-gray-400">{user.user_email}</p> */}
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                            No users to display.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
