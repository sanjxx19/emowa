import React, { useState, useEffect } from "react";
import { api } from "./services/api";
import { LoginForm } from "./components/auth/LoginForm";
import { RegisterForm } from "./components/auth/RegisterForm";
import { Sidebar } from "./components/layout/Sidebar";
import { MainContent } from "./components/layout/MainContent";

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

export default App;
