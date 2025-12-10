import React, { useState } from "react";
import { Video, Image, MessageSquare, Zap, Calendar, BarChart3, ArrowRight, Rocket } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import Navbar from "../components/Navbar";

const LandingPage = ({ onNavigate }) => {
  const [hovered, setHovered] = useState(null);
  const { colors, mode } = useTheme();

  const features = [
    { icon: Video, title: "AI Video Generator", desc: "Create professional videos automatically", color: colors.primary },
    { icon: Image, title: "Logo & Poster Design", desc: "Generate stunning designs instantly", color: colors.secondary },
    { icon: MessageSquare, title: "Caption Generator", desc: "Smart captions in multiple languages", color: colors.primary },
    { icon: Zap, title: "Voiceover Creator", desc: "Natural voiceovers with accents", color: colors.secondary },
    { icon: Calendar, title: "Social Scheduler", desc: "Post directly to social media", color: colors.accent },
    { icon: BarChart3, title: "Analytics Dashboard", desc: "Track performance", color: colors.accent },
  ];

  return (
    <div style={{ background: colors.bg1, fontFamily: "Arial", color: colors.text1, transition: "0.3s all" }}>
      <style>{`
        @keyframes spin360 {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <Navbar onNavigate={onNavigate} />

      {/* HERO */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          paddingTop: 150,
          paddingBottom: 100,

          // UPDATED GRADIENT FOR DARK MODE
          background: mode === "dark"
            ? `linear-gradient(135deg, #000053, #0A0A73)`
            : `linear-gradient(135deg, ${colors.bg1}, ${colors.bg2})`,

          textAlign: "center",
          color: colors.text1,
          transition: "0.3s all",
        }}
      >
        {/* LABEL */}
        <div
          style={{
            padding: "8px 20px",
            borderRadius: 20,
            background: `${colors.primary}22`,
            border: `1px solid ${colors.primary}44`,
            marginBottom: 30,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Rocket size={18} color={colors.primary} />
          <span style={{ color: colors.primary, fontWeight: "bold", fontSize: "0.95rem" }}>
            AI-Powered Marketing Platform
          </span>
        </div>

        <h1 style={{ fontSize: "3.5rem", fontWeight: "bold", color: colors.text1, marginBottom: 20, lineHeight: 1.2 }}>
          Transform Your Marketing <br /> with AI Magic
        </h1>

        <p style={{
          fontSize: "1.2rem",
          color: colors.text2,
          maxWidth: 700,
          marginBottom: 40,
          lineHeight: 1.6,
        }}>
          Create professional logos, posters, and video ads in minutes. No design experience required.
        </p>

        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
          <button
            onClick={() => onNavigate("signup")}
            style={{
              padding: "15px 40px",
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
              color: "white",
              borderRadius: 12,
              border: "none",
              fontSize: "1.1rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            }}
          >
            Start Free Trial
          </button>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: "80px 20px", maxWidth: 1300, margin: "0 auto", background: colors.bg1 }}>
        <h2 style={{ textAlign: "center", fontSize: "2.8rem", color: "#F0F4FF", marginBottom: 10, fontWeight: "bold" }}>
          Powerful Features
        </h2>

        <p style={{ textAlign: "center", color: "#C7D2FE", fontSize: "1.1rem", marginBottom: 50 }}>
          Everything you need to grow your business
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 35,
          }}
        >
          {features.map((f, i) => (
            <div
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                padding: 30,
                borderRadius: 15,
                background: hovered === i ? `${f.color}10` : mode === "dark"
                  ? "rgba(255,255,255,0.15)"
                  : "rgba(255,255,255,0.8)",
                border: hovered === i ? `2px solid ${f.color}` : `2px solid ${colors.border}`,
                transition: "all 0.3s ease",
                cursor: "pointer",
                boxShadow: hovered === i ? "0 8px 25px rgba(0,0,0,0.1)" : "0 2px 8px rgba(0,0,0,0.05)",
                transform: hovered === i ? "translateY(-5px)" : "translateY(0)",
              }}
            >
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 15,
                  background: f.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                  animation: hovered === i ? "spin360 0.5s linear 1" : "none",
                  boxShadow: `0 4px 15px ${f.color}40`,
                }}
              >
                <f.icon size={30} color="white" />
              </div>

               <h3 style={{ color: mode === "dark" ? "#F0F4FF" : colors.text1, fontSize: "1.3rem", marginBottom: 10, fontWeight: "bold" }}>
                {f.title}
              </h3>

              <p style={{ color: mode === "dark" ? "#C7D2FE" : colors.text2, lineHeight: 1.6, fontSize: "0.95rem" }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          padding: "90px 20px",
          textAlign: "center",

          // UPDATED CTA GRADIENT TOO
          background: mode === "dark"
            ? `linear-gradient(135deg, #000053, #2D2DA0, #4C4CF5)`
            : `linear-gradient(135deg, ${colors.primary}, ${colors.secondary}, ${colors.accent})`,

          color: "white",
        }}
      >
        <h2 style={{ fontSize: "2.8rem", marginBottom: 20, fontWeight: "bold", color: "#F0F4FF" }}>
          Ready to Grow Your Business?
        </h2>

        <p
          style={{
            fontSize: "1.2rem",
            opacity: 0.9,
            marginBottom: 40,
            maxWidth: 600,
            margin: "0 auto 40px",
            color: "#C7D2FE",
          }}
        >
          Join thousands of brands using SmartAds
        </p>

        <button
          onClick={() => onNavigate("signup")}
          style={{
            padding: "16px 50px",
            borderRadius: 12,
            background: "white",
            color: "#000053",
            border: "none",
            fontSize: "1.2rem",
            fontWeight: "bold",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            transition: "all 0.3s ease",
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          }}
        >
          Get Started <ArrowRight size={20} />
        </button>
      </section>

      {/* FOOTER */}
      {/* FOOTER */}
      <footer
        style={{
          padding: "60px 40px 30px",
          borderTop: `1px solid ${colors.border}`,
          background: mode === "dark" ? "#00003A" : "#1a1a2e",
          color: "#C7D2FE",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 40,
            marginBottom: 40,
          }}
        >
          {/* About Section */}
          <div style={{ textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 15 }}>
              <img
                src="/smartads-logo.jpeg"
                alt="SmartAds"
                style={{ width: 40, height: 40, objectFit: "contain", borderRadius: 8 }}
              />
              <h3
                style={{
                  fontSize: "1.3rem",
                  fontWeight: "bold",
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                SmartAds
              </h3>
            </div>
            <p style={{ fontSize: "0.95rem", lineHeight: 1.6, opacity: 0.8 }}>
              AI-Powered Marketing Platform helping businesses create professional content in minutes.
            </p>
          </div>

          
          {/* Contact Info */}
          <div style={{ textAlign: "left" }}>
            <h4 style={{ fontSize: "1.1rem", marginBottom: 15, fontWeight: "bold", color: "#F0F4FF" }}>
              Contact Us
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Phone */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 35,
                    height: 35,
                    borderRadius: 8,
                    background: `${colors.primary}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={colors.primary}
                    strokeWidth="2"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <span style={{ fontSize: "0.95rem" }}>03031233445</span>
              </div>

              {/* Email */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 35,
                    height: 35,
                    borderRadius: 8,
                    background: `${colors.secondary}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={colors.secondary}
                    strokeWidth="2"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <span style={{ fontSize: "0.95rem", wordBreak: "break-all" }}>nakhalsheikh4@gmail.com</span>
              </div>

              {/* Location */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 35,
                    height: 35,
                    borderRadius: 8,
                    background: `${colors.accent}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={colors.accent}
                    strokeWidth="2"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <span style={{ fontSize: "0.95rem" }}>NUCES Chiniot, Pakistan</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            paddingTop: 30,
            borderTop: "1px solid rgba(199, 210, 254, 0.2)",
            textAlign: "center",
          }}
        >
          <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.7 }}>
            © 2025 SmartAds. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
