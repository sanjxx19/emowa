import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { api } from "./services/api";
import { LoginForm } from "./components/auth/LoginForm";
import { RegisterForm } from "./components/auth/RegisterForm";
import { Sidebar } from "./components/layout/Sidebar";
import { MainContent } from "./components/layout/MainContent";
import { LandingPage } from "./components/LandingPage";
import { DarkModeProvider } from "./contexts/DarkModeContext";
import { DarkModeToggle } from "./components/layout/DarkModeToggle";
import { PostDetailView } from "./components/posts/PostDetailView";
import { UserProfilePage } from "./components/profile/UserProfilePage";
import { AdminDashboard } from "./components/admin/AdminDashboard";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!api.token);
  const [currentView, setCurrentView] = useState("feed");
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

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
    navigate("/");
  };

  const handleRegister = () => {
    setIsAuthenticated(true);
    navigate("/");
  };

  return (
    <DarkModeProvider>
      <Routes>
        {/* Public Post Detail Route */}
        <Route
          path="/post/:postId"
          element={
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
              <DarkModeToggle />
              <PostDetailView />
            </div>
          }
        />

        {/* Public User Profile Route */}
        <Route
          path="/user/:userId"
          element={
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
              <DarkModeToggle />
              <UserProfilePage />
            </div>
          }
        />

        {/* Main App Route */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
                <DarkModeToggle />
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
                      {currentView === "admin" && user?.is_admin ? (
                        <AdminDashboard />
                      ) : (
                        <MainContent
                          view={currentView}
                          onPostCreated={() => {}}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <LandingPage />
            )
          }
        />

        {/* Auth Routes */}
        <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />
        <Route
          path="/signup"
          element={<RegisterForm onRegister={handleRegister} />}
        />

        {/* Catch All */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </DarkModeProvider>
  );
};

export default App;
