import React from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageCircle,
  Heart,
  TrendingUp,
  Users,
  Sparkles,
  Shield,
} from "lucide-react";

export const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "AI-Powered Insights",
      description:
        "Real-time sentiment analysis helps you understand the emotional tone of every post",
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Meaningful Conversations",
      description:
        "Connect with others through authentic, emotion-aware interactions",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Smart Analytics",
      description:
        "Track sentiment trends and engagement patterns across the platform",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Safe Community",
      description:
        "AI-driven moderation keeps the platform positive and respectful",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="space-y-8">
              <div className="inline-block">
                <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium">
                  🚀 AI-Powered Social Platform
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                Connect with
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                  {" "}
                  Emotion
                </span>
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                EMOWA uses cutting-edge AI to analyze sentiment and sarcasm in
                real-time, helping you understand the emotional context of every
                conversation.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate("/signup")}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                >
                  Get Started Free
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-xl shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-200"
                >
                  Sign In
                </button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    1000+ Users
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    10k+ Interactions
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column - Visual */}
            <div className="relative">
              <div className="relative z-10 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="space-y-4">
                  {/* Mock Post Card */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-green-500 rounded-full"></div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          Sarah Johnson
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          2 mins ago
                        </div>
                      </div>
                      <span className="ml-auto px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
                        😊 Positive
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Just had an amazing day at the beach! The weather was
                      perfect! ☀️
                    </p>
                  </div>

                  {/* Mock Post Card */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-purple-500 rounded-full"></div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          Mike Chen
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          5 mins ago
                        </div>
                      </div>
                      <span className="ml-auto px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded-full flex items-center gap-1">
                        ⚡ Sarcastic
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Oh great, another Monday. Just what I needed... 🙄
                    </p>
                  </div>

                  {/* Mock Post Card */}
                  <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-gray-500 rounded-full"></div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          Alex Rivera
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          10 mins ago
                        </div>
                      </div>
                      <span className="ml-auto px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded-full">
                        😐 Neutral
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Working on a new project. Progress is steady.
                    </p>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-200 dark:bg-blue-800 rounded-full blur-2xl opacity-50"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-200 dark:bg-purple-800 rounded-full blur-2xl opacity-50"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose EMOWA?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Experience social media with emotional intelligence
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100 dark:border-gray-700"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl shadow-2xl p-12 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of users having more meaningful conversations
            </p>
            <button
              onClick={() => navigate("/signup")}
              className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
            >
              Create Your Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
