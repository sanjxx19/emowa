import React, { useState, useEffect, useCallback } from "react";
import {
  User,
  Heart,
  MessageCircle,
  TrendingUp,
  BarChart3,
  Users,
  Settings,
  Plus,
  Send,
  Eye,
  EyeOff,
  AlertTriangle,
  Smile,
  Meh,
  Frown,
  Zap,
} from "lucide-react";

const API_BASE = "http://172.29.22.232:8000/api/v1";

// Utility functions
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getSentimentIcon = (sentiment) => {
  switch (sentiment?.toLowerCase()) {
    case "positive":
      return <Smile className="w-4 h-4 text-green-500" />;
    case "negative":
      return <Frown className="w-4 h-4 text-red-500" />;
    default:
      return <Meh className="w-4 h-4 text-gray-500" />;
  }
};

const getSentimentColor = (sentiment) => {
  switch (sentiment?.toLowerCase()) {
    case "positive":
      return "bg-green-100 text-green-800 border-green-200";
    case "negative":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// API service
class ApiService {
  constructor() {
    this.token = null;
    // Check if we're in browser environment
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("token");
    }
  }

  setToken(token) {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("token", token);
      } else {
        localStorage.removeItem("token");
      }
    }
  }

  async request(endpoint, options = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

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

  // async register(user_name, user_email, password) {
  //   return this.request('/auth/register', {
  //     method: 'POST',
  //     body: JSON.stringify({ user_name, user_email, password }),
  //   });
  // }
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
      throw new Error(err.message || "Registration failed. Please try again.");
    }
  }

  async getPosts(skip = 0, limit = 20, sentiment_filter = null) {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });
    if (sentiment_filter) params.append("sentiment_filter", sentiment_filter);
    return this.request(`/posts/?${params}`);
  }

  async createPost(title, content) {
    return this.request("/posts/", {
      method: "POST",
      body: JSON.stringify({ title, content }),
    });
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
}

const api = new ApiService();

// Components
const LoginForm = ({ onLogin, onSwitchToRegister }) => {
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
              setFormData({ ...formData, username: e.target.value })
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
              setFormData({ ...formData, password: e.target.value })
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

const RegisterForm = ({ onRegister, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    user_name: "",
    user_email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.register(
        formData.user_name,
        formData.user_email,
        formData.password,
      );
      onRegister();
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Join EMOWA</h1>
        <p className="text-gray-600">Create your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Username
          </label>
          <input
            type="text"
            required
            value={formData.user_name}
            onChange={(e) =>
              setFormData({ ...formData, user_name: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            required
            value={formData.user_email}
            onChange={(e) =>
              setFormData({ ...formData, user_email: e.target.value })
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
              setFormData({ ...formData, password: e.target.value })
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
          {loading ? "Creating Account..." : "Sign Up"}
        </button>

        <p className="text-center text-gray-600">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:underline"
          >
            Login
          </button>
        </p>
      </form>
    </div>
  );
};

const CreatePostForm = ({ onPostCreated }) => {
  const [formData, setFormData] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const analyzeContent = useCallback(async () => {
    if (!formData.content.trim()) return;

    try {
      const result = await api.analyzeText(formData.content);
      setAnalysis(result);
    } catch (err) {
      console.error("Analysis failed:", err);
    }
  }, [formData.content]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.content.length > 10) {
        analyzeContent();
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [formData.content, analyzeContent]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.createPost(formData.title, formData.content);
      setFormData({ title: "", content: "" });
      setAnalysis(null);
      onPostCreated();
    } catch (err) {
      console.error("Failed to create post:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Create New Post
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Post title..."
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="relative">
          <textarea
            placeholder="What's on your mind?"
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
            required
          />

          {analysis && (
            <div className="absolute top-2 right-2">
              <button
                type="button"
                onClick={() => setShowAnalysis(!showAnalysis)}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showAnalysis ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          )}
        </div>

        {analysis && showAnalysis && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              AI Analysis Preview
            </h4>

            <div className="flex flex-wrap gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getSentimentColor(analysis.sentiment?.sentiment_label)}`}
              >
                {getSentimentIcon(analysis.sentiment?.sentiment_label)}
                {analysis.sentiment?.sentiment_label} (
                {Math.round(analysis.sentiment?.confidence * 100)}%)
              </span>

              {analysis.sarcasm?.is_sarcastic && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                  <Zap className="w-3 h-3" />
                  Sarcastic ({Math.round(analysis.sarcasm.confidence * 100)}%)
                </span>
              )}

              {analysis.needs_review && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                  <AlertTriangle className="w-3 h-3" />
                  Needs Review
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={
              loading || !formData.title.trim() || !formData.content.trim()
            }
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Posting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Post
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

const PostCard = ({ post }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-4 hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {post.title}
          </h3>
          <p className="text-sm text-gray-500">
            User {post.user_id} • {formatDate(post.created_at)}
          </p>
        </div>

        {(post.sentiment_label || post.is_sarcastic) && (
          <div className="flex flex-wrap gap-1">
            {post.sentiment_label && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getSentimentColor(post.sentiment_label)}`}
              >
                {getSentimentIcon(post.sentiment_label)}
                {post.sentiment_label}
              </span>
            )}

            {post.is_sarcastic && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                <Zap className="w-3 h-3" />
                Sarcastic
              </span>
            )}
          </div>
        )}
      </div>

      <p className="text-gray-700 mb-4 leading-relaxed">{post.content}</p>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors">
            <Heart className="w-4 h-4" />
            <span className="text-sm">Like</span>
          </button>
          <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">Comment</span>
          </button>
        </div>

        {post.sentiment_confidence && (
          <div className="text-xs text-gray-500">
            Confidence: {Math.round(post.sentiment_confidence * 100)}%
          </div>
        )}
      </div>
    </div>
  );
};

const SentimentFilter = ({ currentFilter, onFilterChange }) => {
  const filters = [
    { value: null, label: "All Posts", color: "gray" },
    { value: "positive", label: "Positive", color: "green" },
    { value: "neutral", label: "Neutral", color: "gray" },
    { value: "negative", label: "Negative", color: "red" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-3">
        Filter by Sentiment
      </h3>
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.value || "all"}
            onClick={() => onFilterChange(filter.value)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              currentFilter === filter.value
                ? `bg-${filter.color}-100 text-${filter.color}-800 border border-${filter.color}-200`
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
};

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await api.getSentimentAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const totalSentiments =
    analytics.sentiment_distribution?.reduce(
      (sum, item) => sum + item.count,
      0,
    ) || 0;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-blue-600" />
        Platform Analytics
      </h3>

      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Sentiment Distribution
          </h4>
          <div className="space-y-2">
            {analytics.sentiment_distribution?.map((item) => {
              const percentage =
                totalSentiments > 0 ? (item.count / totalSentiments) * 100 : 0;
              return (
                <div
                  key={item.sentiment}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    {getSentimentIcon(item.sentiment)}
                    <span className="text-sm font-medium capitalize">
                      {item.sentiment}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          item.sentiment === "positive"
                            ? "bg-green-500"
                            : item.sentiment === "negative"
                              ? "bg-red-500"
                              : "bg-gray-500"
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {item.count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Sarcasm Statistics
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-900">
                {analytics.sarcasm_stats?.total_analyzed || 0}
              </div>
              <div className="text-sm text-gray-600">Total Analyzed</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-purple-600">
                {analytics.sarcasm_stats?.sarcasm_percentage || 0}%
              </div>
              <div className="text-sm text-gray-600">Sarcastic</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({ currentView, onViewChange, user }) => {
  const menuItems = [
    { id: "feed", label: "Feed", icon: MessageCircle },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">EMOWA</h2>
        <p className="text-sm text-gray-600">Welcome, {user?.user_name}</p>
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

const MainContent = ({ view, onPostCreated }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sentimentFilter, setSentimentFilter] = useState(null);

  const fetchPosts = useCallback(async () => {
    try {
      const data = await api.getPosts(0, 20, sentimentFilter);
      setPosts(data);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    } finally {
      setLoading(false);
    }
  }, [sentimentFilter]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handlePostCreated = () => {
    fetchPosts();
    onPostCreated();
  };

  if (view === "analytics") {
    return <AnalyticsDashboard />;
  }

  if (view === "profile") {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Profile Settings
        </h3>
        <p className="text-gray-600">
          Profile management features coming soon...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CreatePostForm onPostCreated={handlePostCreated} />
      <SentimentFilter
        currentFilter={sentimentFilter}
        onFilterChange={setSentimentFilter}
      />

      <div>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-lg p-6 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          posts.map((post) => <PostCard key={post.post_id} post={post} />)
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No posts yet
            </h3>
            <p className="text-gray-600">Be the first to share something!</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!api.token);
  const [isRegistering, setIsRegistering] = useState(false);
  const [currentView, setCurrentView] = useState("feed");
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchUser = async () => {
        try {
          const userData = await api.getCurrentUser();
          setUser(userData);
        } catch (err) {
          console.error("Failed to fetch user:", err);
          setIsAuthenticated(false);
          api.setToken(null);
        }
      };
      fetchUser();
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleRegister = () => {
    setIsRegistering(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        {isRegistering ? (
          <RegisterForm
            onRegister={handleRegister}
            onSwitchToLogin={() => setIsRegistering(false)}
          />
        ) : (
          <LoginForm
            onLogin={handleLogin}
            onSwitchToRegister={() => setIsRegistering(true)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Sidebar
              currentView={currentView}
              onViewChange={setCurrentView}
              user={user}
            />
          </div>
          <div className="lg:col-span-3">
            <MainContent view={currentView} onPostCreated={() => {}} />
          </div>
        </div>
      </div>
    </div>
  );
};

//   const App = () => {
//   const [isAuthenticated, setIsAuthenticated] = useState(true); // 👈 force login
//   const [isRegistering, setIsRegistering] = useState(false);
//   const [currentView, setCurrentView] = useState('feed');
//   const [user, setUser] = useState({ user_name: "TestUser" }); // 👈 fake user

//   // skip fetching from backend
//   useEffect(() => {}, []);

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="container mx-auto px-4 py-6">
//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//           <div className="lg:col-span-1">
//             <Sidebar currentView={currentView} onViewChange={setCurrentView} user={user} />
//           </div>
//           <div className="lg:col-span-3">
//             <MainContent view={currentView} onPostCreated={() => {}} />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

export default App;
