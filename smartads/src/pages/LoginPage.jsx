import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Navbar from "../components/Navbar";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { API_BASE_URL, ALL_FEATURES } from "../utils/constants";

const LoginPage = ({ onNavigate }) => {
  const { login, registerGoogleUser } = useAuth();
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Google Login Hook - using implicit flow (token) for better localhost compatibility
  const googleLogin = useGoogleLogin({
    flow: 'implicit',
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError("");
      
      try {
        // Get user info from Google
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        
        if (!userInfoRes.ok) {
          throw new Error('Failed to get user info from Google');
        }
        
        const userInfo = await userInfoRes.json();
        console.log('Google user info:', userInfo);
        
        // Send to backend for login/signup
        const res = await fetch(`${API_BASE_URL}/api/google-signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userInfo.email,
            name: userInfo.name,
            googleId: userInfo.id,
            picture: userInfo.picture
          })
        });
        
        const data = await res.json();
        
        if (data.success) {
          const googleUser = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.fullName,
            role: data.user.role,
            picture: userInfo.picture,
            isHeadUser: true,
            allowedFeatures: ALL_FEATURES.map(f => f.id)
          };
          
          try {
            registerGoogleUser(googleUser);
          } catch (err) {
            console.log('Local registration:', err.message);
          }
          
          setLoading(false);
          onNavigate && onNavigate('dashboard');
        } else {
          throw new Error(data.error || 'Google login failed');
        }
      } catch (err) {
        console.error('Google login error:', err);
        setError(err.message || 'Google sign-in failed. Please try again.');
        setLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google login error:', error);
      setError('Google sign-in failed. Please try again.');
      setLoading(false);
    }
  });

  const handleGoogleLogin = () => {
    setLoading(true);
    setError("");
    googleLogin();
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const loggedInUser = await login({ email, password });
      onNavigate && onNavigate("dashboard");
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: colors.bg1,
      display: "flex", 
      flexDirection: "column" 
    }}>
      {/* Navbar */}
      <Navbar onNavigate={onNavigate} />

      {/* Login Content */}
      <div style={{ 
        flex: 1, 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        padding: 20 
      }}>
        <div style={{ 
          width: "100%", 
          maxWidth: 500, 
          padding: 50, 
          borderRadius: 20, 
          background: colors.cardBg,
          backdropFilter: "blur(20px)",
          border: `1px solid ${colors.border}`, 
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)"
        }}>
          {/* Logo */}
          <div style={{
            width: 80,
            height: 80,
            borderRadius: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 25px",
          }}>
            <img
              src="/smartads-logo.jpeg"
              alt="SmartAds"
              style={{ width: 80, height: 80, objectFit: "contain", borderRadius: 18 }}
            />
          </div>

          <h2 style={{ 
            fontSize: "2.3rem", 
            color: colors.text1, 
            textAlign: "center", 
            marginBottom: 12, 
            fontWeight: "bold" 
          }}>
            Welcome Back
          </h2>
          <p style={{ 
            textAlign: "center", 
            color: colors.text2, 
            marginBottom: 30, 
            fontSize: "1.05rem" 
          }}>
            Login to your SmartAds account
          </p>

          {error && (
            <div style={{ 
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid #EF4444",
              color: "#FCA5A5", 
              padding: "12px 16px", 
              borderRadius: 10, 
              marginBottom: 20, 
              textAlign: "center", 
              fontSize: "0.9rem" 
            }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label style={{ 
                color: colors.text2, 
                display: "block", 
                marginBottom: 8, 
                fontWeight: "600", 
                fontSize: "0.95rem" 
              }}>
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={20} style={{ 
                  position: "absolute", 
                  left: 12, 
                  top: 12, 
                  color: colors.text2 
                }} />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  onKeyPress={handleKeyPress}
                  style={{ 
                    width: "100%", 
                    padding: "12px 12px 12px 40px", 
                    borderRadius: 10, 
                    border: `1px solid ${error && !password ? '#EF4444' : colors.border}`, 
                    background: colors.bg2, 
                    color: colors.text1, 
                    outline: "none", 
                    fontSize: "1rem", 
                    boxSizing: "border-box",
                    transition: "all 0.3s ease"
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.primary;
                    e.currentTarget.style.boxShadow = `0 0 10px ${colors.primary}40`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ 
                color: colors.text2, 
                display: "block", 
                marginBottom: 8, 
                fontWeight: "600", 
                fontSize: "0.95rem" 
              }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={20} style={{ 
                  position: "absolute", 
                  left: 12, 
                  top: 12, 
                  color: colors.text2 
                }} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  onKeyPress={handleKeyPress}
                  style={{ 
                    width: "100%", 
                    padding: "12px 50px 12px 40px", 
                    borderRadius: 10, 
                    border: `1px solid ${error && !email ? '#EF4444' : colors.border}`, 
                    background: colors.bg2, 
                    color: colors.text1, 
                    outline: "none", 
                    fontSize: "1rem", 
                    boxSizing: "border-box",
                    transition: "all 0.3s ease"
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.primary;
                    e.currentTarget.style.boxShadow = `0 0 10px ${colors.primary}40`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                <div 
                  onClick={() => setShowPassword(!showPassword)} 
                  style={{ 
                    position: "absolute", 
                    right: 12, 
                    top: 10, 
                    cursor: "pointer", 
                    color: colors.text2,
                    transition: "color 0.2s ease"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = colors.primary}
                  onMouseLeave={(e) => e.currentTarget.style.color = colors.text2}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              style={{ 
                width: "100%", 
                marginTop: 5, 
                padding: 16, 
                background: loading 
                  ? "rgba(124, 58, 237, 0.5)" 
                  : `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`, 
                borderRadius: 12, 
                border: "none", 
                color: "white", 
                fontSize: "1.1rem", 
                cursor: loading ? "not-allowed" : "pointer", 
                fontWeight: "bold", 
                opacity: loading ? 0.6 : 1,
                transition: "all 0.4s ease",
                boxShadow: loading ? "none" : "0 8px 25px rgba(0, 217, 255, 0.3)"
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = `0 12px 30px ${colors.secondary}50`;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = loading ? "none" : "0 8px 25px rgba(0, 217, 255, 0.3)";
              }}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            {/* Divider */}
            <div style={{
              display: "flex",
              alignItems: "center",
              margin: "20px 0",
              gap: 15
            }}>
              <div style={{ flex: 1, height: 1, background: colors.border }} />
              <span style={{ color: colors.text2, fontSize: "0.9rem" }}>or</span>
              <div style={{ flex: 1, height: 1, background: colors.border }} />
            </div>

            {/* Google Login Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              style={{
                width: "100%",
                padding: 14,
                background: "white",
                borderRadius: 12,
                border: `1px solid ${colors.border}`,
                color: "#333",
                fontSize: "1rem",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                transition: "all 0.3s ease",
                opacity: loading ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </div>

          <p style={{ 
            marginTop: 25, 
            color: colors.text2, 
            textAlign: "center", 
            fontSize: "1rem" 
          }}>
            Don't have an account?{" "}
            <span 
              onClick={() => onNavigate && onNavigate("signup")} 
              style={{ 
                color: colors.primary, 
                cursor: "pointer", 
                fontWeight: "bold", 
                textDecoration: "underline",
                transition: "opacity 0.2s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
            >
              Sign up
            </span>
          </p>

          <div style={{ 
            marginTop: 30, 
            padding: 15, 
            background: colors.bg2, 
            borderRadius: 10, 
            fontSize: "0.8rem", 
            color: colors.text2, 
            border: `1px dashed ${colors.border}` 
          }}>
            <p style={{ 
              marginBottom: 8, 
              fontWeight: "600", 
              color: colors.primary,
              fontSize: "0.85rem"
            }}>📝 Demo Credentials:</p>
            <p style={{ marginBottom: 3 }}>Email: <strong style={{ color: colors.text1 }}>admin@smartads.com</strong></p>
            <p>Password: <strong style={{ color: colors.text1 }}>Admin@123</strong></p>
          </div>

          <p style={{ textAlign: "center", marginTop: 15 }}>
            <span
              onClick={() => onNavigate && onNavigate("landing")}
              style={{
                color: colors.primary,
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "0.95rem",
                transition: "opacity 0.2s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
            >
              ← Back to Home
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;