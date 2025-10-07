import React from "react";
import { useNavigate } from "react-router-dom";

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold tracking-tight">Welcome to EMOWA</h1>
        <p className="text-lg opacity-90">
          Understand emotions. Connect better. Engage smarter.
        </p>

        <div className="flex gap-6 justify-center mt-8">
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl shadow-md hover:bg-gray-100 transition"
          >
            Login
          </button>

          <button
            onClick={() => navigate("/signup")}
            className="px-6 py-3 bg-blue-800 font-semibold rounded-xl shadow-md hover:bg-blue-900 transition"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};
