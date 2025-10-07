import React from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";

import { LandingPage } from "./components/LandingPage";
import { LoginForm } from "./components/auth/LoginForm";
import { RegisterForm } from "./components/auth/RegisterForm";
import { Sidebar } from "./components/layout/Sidebar";
import { MainContent } from "./components/layout/MainContent";
import { api } from "./services/api";

const App = () => {
  const isAuthenticated = !!api.token;

  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPageWrapper />} />

        {/* Login */}
        <Route path="/login" element={<LoginFormWrapper />} />

        {/* Register */}
        <Route path="/register" element={<RegisterFormWrapper />} />

        {/* Main App (after login) */}
        <Route path="/app" element={<AuthenticatedApp />} />
      </Routes>
    </Router>
  );
};

// Wrapper for LandingPage to navigate to Login/Register
const LandingPageWrapper = () => {
  const navigate = useNavigate();
  return (
    <LandingPage
      onLoginClick={() => navigate("/login")}
      onSignUpClick={() => navigate("/register")}
    />
  );
};

// Wrapper for LoginForm to go to main app after login
const LoginFormWrapper = () => {
  const navigate = useNavigate();
  const handleLogin = () => navigate("/app");

  return <LoginForm onLogin={handleLogin} onSwitchToRegister={() => navigate("/register")} />;
};

// Wrapper for RegisterForm to go to main app after register
const RegisterFormWrapper = () => {
  const navigate = useNavigate();
  const handleRegister = () => navigate("/app");

  return <RegisterForm onRegister={handleRegister} onSwitchToLogin={() => navigate("/login")} />;
};

// Your authenticated main app
const AuthenticatedApp = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Sidebar currentView="feed" onViewChange={() => {}} user={{ user_name: "User" }} />
          </div>
          <div className="lg:col-span-3">
            <MainContent view="feed" onPostCreated={() => {}} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
