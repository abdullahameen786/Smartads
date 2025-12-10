import React, { useState } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Dashboard from "./pages/Dashboard";
import LogoDesigner from "./pages/LogoDesigner"; 

const AppContent = () => {
  const [page, setPage] = useState("landing");
  const { user } = useAuth();

  const screens = {
    landing: <LandingPage onNavigate={setPage} />,
    login: <LoginPage onNavigate={setPage} />,
    signup: <SignupPage onNavigate={setPage} />,
    dashboard: <Dashboard onNavigate={setPage} />,
    "logo-designer": <LogoDesigner onNavigate={setPage} />,
  };

  // 1. If user is NOT logged in
  if (!user) {
    // Only allow access to public pages
    if (page === "landing" || page === "login" || page === "signup") {
      return screens[page];
    }
    // If they try to access dashboard/logo-designer while logged out, force Login
    return screens["login"];
  }

  // 2. If user IS logged in
  // Allow access to whatever page is requested, default to dashboard
  return screens[page] || screens["dashboard"];
};

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </ThemeProvider>
);

export default App;