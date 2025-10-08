import { API_BASE } from "../constants/config";

class ApiService {
    constructor() {
        this.token = null;
        if (typeof window !== "undefined") {
            this.token = sessionStorage.getItem("token");
        }
    }

    setToken(token) {
        this.token = token;
        if (typeof window !== "undefined") {
            if (token) {
                sessionStorage.setItem("token", token);
            } else {
                sessionStorage.removeItem("token");
            }
        }
    }

    async request(endpoint, options = {}) {
        const headers = {
            "Content-Type": "application/json",
            ...options.headers,
        };

        // Only add Authorization header if token exists and endpoint is not public
        if (this.token && !options.skipAuth) {
            headers.Authorization = `Bearer ${this.token}`;
        }

        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    async login(username, password) {
        const response = await this.request("/auth/login", {
            method: "POST",
            body: JSON.stringify({ username, password }),
        });
        this.setToken(response.access_token);
        return response;
    }

    async register(username, email, password) {
        try {
            return await this.request("/auth/register", {
                method: "POST",
                body: JSON.stringify({
                    user_name: username,
                    user_email: email,
                    password,
                }),
            });
        } catch (err) {
            throw new Error(
                err.message || "Registration failed. Please try again.",
            );
        }
    }

    async getPosts(skip = 0, limit = 20, sentiment_filter = null) {
        const params = new URLSearchParams({
            skip: skip.toString(),
            limit: limit.toString(),
        });
        if (sentiment_filter)
            params.append("sentiment_filter", sentiment_filter);
        return this.request(`/posts/?${params}`);
    }

    async getPost(postId) {
        return this.request(`/posts/${postId}`);
    }

    async createPost(title, content) {
        return this.request("/posts/", {
            method: "POST",
            body: JSON.stringify({ title, content }),
        });
    }

    async likePost(postId) {
        return this.request(`/posts/${postId}/like`, {
            method: "POST",
        });
    }

    async unlikePost(postId) {
        return this.request(`/posts/${postId}/like`, {
            method: "DELETE",
        });
    }

    async getPostLikes(postId) {
        return this.request(`/posts/${postId}/likes`);
    }

    async getComments(postId) {
        return this.request(`/posts/${postId}/comments`);
    }

    async createComment(postId, content, parentCommentId = null) {
        return this.request(`/posts/${postId}/comments`, {
            method: "POST",
            body: JSON.stringify({
                content,
                parent_comment_id: parentCommentId,
            }),
        });
    }

    async updateComment(postId, commentId, content) {
        return this.request(`/posts/${postId}/comments/${commentId}`, {
            method: "PUT",
            body: JSON.stringify({ content }),
        });
    }

    async deleteComment(postId, commentId) {
        return this.request(`/posts/${postId}/comments/${commentId}`, {
            method: "DELETE",
        });
    }

    async likeComment(postId, commentId) {
        return this.request(`/posts/${postId}/comments/${commentId}/like`, {
            method: "POST",
        });
    }

    async unlikeComment(postId, commentId) {
        return this.request(`/posts/${postId}/comments/${commentId}/like`, {
            method: "DELETE",
        });
    }

    async getCommentLikes(postId, commentId) {
        return this.request(`/posts/${postId}/comments/${commentId}/likes`);
    }

    async analyzeText(text) {
        return this.request(`/posts/analyze?text=${encodeURIComponent(text)}`);
    }

    async getSentimentAnalytics() {
        return this.request("/posts/analytics/sentiment");
    }

    async getCurrentUser() {
        return this.request("/users/me");
    }

    async updateCurrentUser(userData) {
        return this.request("/users/me", {
            method: "PUT",
            body: JSON.stringify(userData),
        });
    }

    async getUserProfile(userId) {
        return this.request(`/users/${userId}`);
    }

    async followUser(userId) {
        return this.request(`/users/${userId}/follow`, {
            method: "POST",
        });
    }

    async unfollowUser(userId) {
        return this.request(`/users/${userId}/follow`, {
            method: "DELETE",
        });
    }
}

export const api = new ApiService();
