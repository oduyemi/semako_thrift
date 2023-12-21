import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "../components/Header";
import DashboardPage from "../pages/Dashboard/index";
import About from "../pages/About";
import Register from "../pages/Register";
import Login from "../pages/Login";
import Reset from "../pages/ResetPassword";
import PrivateRoute from "../PrivateRoute";

export const Navigation = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (pin, nextStep) => {
    console.log("Login successful. PIN:", pin);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <BrowserRouter>
      <Header isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Login onLogin={handleLogin} />} />
        {/* <Route path="/dashboard" element={<PrivateRoute element={<DashboardPage />} isAuthenticated={isAuthenticated} />} /> */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset" element={<Reset />} />
      </Routes>
    </BrowserRouter>
  );
};
