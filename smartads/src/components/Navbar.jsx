import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "./ThemeToggle";

const Navbar = ({ onNavigate }) => {
  const [scrolled, setScrolled] = useState(false);
  const [logoHovered, setLogoHovered] = useState(false);
  const { colors, mode } = useTheme();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const textColor = mode === "dark" ? "#E0E7FF" : "#1F2937";

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        background: scrolled
          ? mode === "dark"
            ? "rgba(10,14,39,0.95)"
            : "rgba(248,250,252,0.95)"
          : "transparent",
        padding: "1.2rem 3rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: scrolled ? `0 4px 20px ${colors.primary}33` : "none",
        borderBottom: scrolled ? `1px solid ${colors.border}` : "none",
        transition: "0.4s",
        zIndex: 1000,
        backdropFilter: scrolled ? "blur(10px)" : "none",
      }}
    >
      {/* Logo */}
      <div
        style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: 12, 
          cursor: "pointer" 
        }}
        onMouseEnter={() => setLogoHovered(true)}
        onMouseLeave={() => setLogoHovered(false)}
        onClick={() => onNavigate && onNavigate("landing")}
      >
        <img
          src="/smartads-logo.jpeg"
          alt="SmartAds Logo"
          style={{
            width: 45,
            height: 45,
            objectFit: "contain",
            transform: logoHovered ? "scale(1.1)" : "scale(1)",
            transition: "transform 0.3s ease",
          }}
        />
        <h2
          style={{
            fontWeight: "bold",
            color: textColor,
            margin: 0,
            fontSize: "1.5rem",
          }}
        >
          SmartAds
        </h2>
      </div>

      {/* Navigation Buttons */}
      <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
        <ThemeToggle />
        <button
          onClick={() => onNavigate("login")}
          style={{
            padding: "12px 25px",
            borderRadius: 10,
            border: `2px solid ${colors.primary}`,
            background: "transparent",
            color: colors.primary,
            cursor: "pointer",
            fontWeight: "600",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = colors.primary;
            e.target.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "transparent";
            e.target.style.color = colors.primary;
          }}
        >
          Login
        </button>
        <button
          onClick={() => onNavigate("signup")}
          style={{
            padding: "12px 25px",
            borderRadius: 10,
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
            color: "white",
            cursor: "pointer",
            border: "none",
            fontWeight: "600",
            transition: "all 0.3s ease",
            boxShadow: `0 4px 15px ${colors.primary}40`,
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = `0 6px 20px ${colors.primary}60`;
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = `0 4px 15px ${colors.primary}40`;
          }}
        >
          Get Started
        </button>
      </div>
    </nav>
  );
};

export default Navbar;