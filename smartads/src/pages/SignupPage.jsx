import React, { useState } from "react";
import Navbar from "../components/Navbar";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Mail,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { API_BASE_URL, ALL_FEATURES } from "../utils/constants";
import { useGoogleLogin } from "@react-oauth/google";

const validateEmail = (email) => {
  const emailRegex =
    /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.(com|edu|pk|net|org|gov|edu\.pk|com\.pk|net\.pk|org\.pk)$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  const minLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password); 

  return {
    isValid:
      minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumber &&
      hasSpecialChar,
    minLength,
    hasUpperCase,
    hasLowerCase,
    hasNumber,
    hasSpecialChar,
  };
};

const SignupPage = ({ onNavigate }) => {
  const { registerUser, registerGoogleUser } = useAuth(); 
  const { colors } = useTheme();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);

  const handlePasswordChange = (password) => {
    setFormData({ ...formData, password });
    setPasswordStrength(validatePassword(password));
    if (errors.password) setErrors({ ...errors, password: null });
  };

  // Google Login Hook from @react-oauth/google - using implicit flow for localhost compatibility
  const googleLogin = useGoogleLogin({
    flow: 'implicit',
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setErrors({});
      
      try {
        // Get user info from Google using the access token
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        
        if (!userInfoRes.ok) {
          throw new Error('Failed to get user info from Google');
        }
        
        const userInfo = await userInfoRes.json();
        console.log('Google user info:', userInfo);
        
        // Send to backend
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
          const newUser = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.fullName,
            role: data.user.role,
            picture: userInfo.picture,
            isHeadUser: true,
            allowedFeatures: ALL_FEATURES.map(f => f.id)
          };
          
          try {
            registerGoogleUser(newUser);
          } catch (err) {
            console.log('Local registration:', err.message);
          }
          
          setLoading(false);
          alert('Account created successfully! Redirecting to dashboard...');
          
          setTimeout(() => {
            onNavigate && onNavigate('dashboard');
          }, 500);
        } else {
          throw new Error(data.error || 'Failed to create account');
        }
      } catch (err) {
        console.error('Google signup error:', err);
        setErrors({ google: err.message });
        setLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google login error:', error);
      setErrors({ google: 'Google sign-in failed. Please try again.' });
      setLoading(false);
    }
  });

  const handleGoogleSignup = () => {
    setLoading(true);
    setErrors({});
    googleLogin();
  };

  const handleSubmit = async () => {
    const newErrors = {};

    if (!formData.fullName || formData.fullName.trim().length < 3)
      newErrors.fullName = "Full name must be at least 3 characters";

    if (!formData.email) newErrors.email = "Email is required";
    else if (!validateEmail(formData.email))
      newErrors.email = "Please enter a valid email";

    if (!formData.password) newErrors.password = "Password is required";
    else if (!validatePassword(formData.password).isValid)
      newErrors.password = "Password must meet all strength requirements";

    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (!agreed) newErrors.terms = "You must agree to the terms";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    
    try {
      // Call backend API for signup
      const response = await fetch(`${API_BASE_URL}/api/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          role: "User"
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Also register in local context for immediate login capability
        const newUser = {
          name: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        };

        try {
          registerUser(newUser);
        } catch (localErr) {
          // User already exists in local storage, that's okay
          console.log("Local registration skipped:", localErr.message);
        }
        
        setLoading(false);
        alert(`Account created successfully!\nYou can now sign in.`);
        
        setTimeout(() => {
          onNavigate && onNavigate("login");
        }, 500);
      } else {
        throw new Error(data.error || 'Registration failed');
      }

    } catch (err) {
      setLoading(false);
      setErrors({ submit: err.message || 'Registration failed due to server error' });
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: colors.bg1 }}>
      {/* Navbar */}
      <Navbar onNavigate={onNavigate} />

      {/* Signup Content */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        padding: "100px 20px 40px",
        minHeight: "100vh",
      }}>
        <div style={{
          background: colors.cardBg,
          backdropFilter: "blur(20px)",
          border: `1px solid ${colors.border}`,
          borderRadius: 20,
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
          padding: 50,
          maxWidth: 900,
          width: "100%",
        }}>
          {/* HEADER */}
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
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 12,
            color: colors.text1,
          }}>
            Create Organization Account
          </h2>
          <p style={{
            textAlign: "center",
            color: colors.text2,
            marginBottom: 25,
            fontSize: "1.05rem",
          }}>
            Set up your organization and manage your team
          </p>

          {/* GOOGLE SIGNUP */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <button
              onClick={handleGoogleSignup}
              disabled={loading}
              style={{
                padding: "14px 30px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "2px solid rgba(255, 255, 255, 0.1)",
                borderRadius: 12,
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "1rem",
                fontWeight: "600",
                color: colors.text1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                transition: "all 0.3s ease",
                opacity: loading ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.background = "rgba(255, 255, 255, 0.1)";
                  e.target.style.transform = "translateY(-2px)";
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.05)";
                e.target.style.transform = "translateY(0)";
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loading ? 'Connecting...' : 'Continue with Google'}
            </button>
          </div>

          {/* Error for Google */}
          {errors.google && (
            <div style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid #EF4444",
              color: "#FCA5A5",
              padding: "10px 15px",
              borderRadius: 10,
              marginBottom: 15,
              textAlign: "center",
              fontSize: "0.85rem",
            }}>
              {errors.google}
            </div>
          )}

          {/* OR DIVIDER */}
          <div style={{ display: "flex", alignItems: "center", gap: 15, marginBottom: 30 }}>
            <div style={{ flex: 1, height: 1, background: colors.border }} />
            <span style={{ color: colors.text2, fontSize: "0.9rem", fontWeight: "600" }}>OR</span>
            <div style={{ flex: 1, height: 1, background: colors.border }} />
          </div>

          {/* Error for Submission */}
          {errors.submit && (
            <div style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid #EF4444",
              color: "#FCA5A5",
              padding: "12px 16px",
              borderRadius: 10,
              marginBottom: 20,
              textAlign: "center",
              fontSize: "0.9rem",
            }}>
              {errors.submit}
            </div>
          )}

          {/* FORM FIELDS */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 25 }}>
            {/* Full Name */}
            <div>
              <label style={{ color: colors.text2, display: "block", marginBottom: 8, fontWeight: "600", fontSize: "0.95rem" }}>
                Full Name
              </label>
              <div style={{ position: "relative" }}>
                <User size={20} style={{ position: "absolute", top: 12, left: 12, color: colors.text2 }} />
                <input
                  type="text"
                  placeholder="Your full name"
                  value={formData.fullName}
                  onChange={(e) => {
                    setFormData({ ...formData, fullName: e.target.value });
                    if (errors.fullName) setErrors({ ...errors, fullName: null });
                  }}
                  style={{
                    width: "100%",
                    padding: "12px 12px 12px 40px",
                    borderRadius: 10,
                    border: `1px solid ${errors.fullName ? '#EF4444' : colors.border}`,
                    background: colors.bg2,
                    color: colors.text1,
                    outline: "none",
                    fontSize: "1rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              {errors.fullName && (
                <p style={{ color: "#EF4444", marginTop: 5, fontSize: "0.85rem" }}>{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label style={{ color: colors.text2, display: "block", marginBottom: 8, fontWeight: "600", fontSize: "0.95rem" }}>
                Personal Email
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={20} style={{ position: "absolute", top: 12, left: 12, color: colors.text2 }} />
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: null });
                  }}
                  style={{
                    width: "100%",
                    padding: "12px 12px 12px 40px",
                    borderRadius: 10,
                    border: `1px solid ${errors.email ? '#EF4444' : colors.border}`,
                    background: colors.bg2,
                    color: colors.text1,
                    outline: "none",
                    fontSize: "1rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              {errors.email && (
                <p style={{ color: "#EF4444", marginTop: 5, fontSize: "0.85rem" }}>{errors.email}</p>
              )}
            </div>


          </div>

          {/* PASSWORD */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ color: colors.text2, display: "block", marginBottom: 8, fontWeight: "600", fontSize: "0.95rem" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={20} style={{ position: "absolute", top: 12, left: 12, color: colors.text2 }} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 50px 12px 40px",
                  borderRadius: 10,
                  border: `1px solid ${errors.password ? '#EF4444' : colors.border}`,
                  background: colors.bg2,
                  color: colors.text1,
                  outline: "none",
                  fontSize: "1rem",
                  boxSizing: "border-box",
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
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </div>
            </div>

            {/* Password Checklist */}
            {passwordStrength && formData.password && (
              <div style={{ marginTop: 10, fontSize: "0.85rem" }}>
                {[
                  ["minLength", "At least 8 characters"],
                  ["hasUpperCase", "1 uppercase letter"],
                  ["hasLowerCase", "1 lowercase letter"],
                  ["hasNumber", "1 number"],
                  ["hasSpecialChar", "1 special character"],
                ].map(([key, label]) => (
                  <div
                    key={key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      color: passwordStrength[key] ? "#4ade80" : "#f87171",
                      marginBottom: 3,
                    }}
                  >
                    {passwordStrength[key] ? (
                      <CheckCircle size={16} />
                    ) : (
                      <XCircle size={16} />
                    )}
                    {label}
                  </div>
                ))}
              </div>
            )}

            {errors.password && (
              <p style={{ color: "#EF4444", marginTop: 5, fontSize: "0.85rem" }}>{errors.password}</p>
            )}
          </div>

          {/* CONFIRM PASSWORD */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ color: colors.text2, display: "block", marginBottom: 8, fontWeight: "600", fontSize: "0.95rem" }}>
              Confirm Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={20} style={{ position: "absolute", top: 12, left: 12, color: colors.text2 }} />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={(e) => {
                  setFormData({ ...formData, confirmPassword: e.target.value });
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
                }}
                style={{
                  width: "100%",
                  padding: "12px 50px 12px 40px",
                  borderRadius: 10,
                  border: `1px solid ${errors.confirmPassword ? '#EF4444' : colors.border}`,
                  background: colors.bg2,
                  color: colors.text1,
                  outline: "none",
                  fontSize: "1rem",
                  boxSizing: "border-box",
                }}
              />
              <div
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: 10,
                  cursor: "pointer",
                  color: colors.text2,
                }}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </div>
            </div>

            {errors.confirmPassword && (
              <p style={{ color: "#EF4444", marginTop: 5, fontSize: "0.85rem" }}>
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* TERMS CHECKBOX */}
          <div style={{ marginBottom: 25 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={agreed}
                onChange={() => {
                  setAgreed(!agreed);
                  if (errors.terms) setErrors({ ...errors, terms: null });
                }}
                style={{ width: 18, height: 18, cursor: "pointer" }}
              />
              <span style={{ color: colors.text2, fontSize: "0.9rem" }}>
                I agree to the terms & conditions
              </span>
            </label>
            {errors.terms && (
              <p style={{ color: "#EF4444", marginTop: 5, fontSize: "0.85rem" }}>{errors.terms}</p>
            )}
          </div>

          {/* SUBMIT BUTTON */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: "100%",
              padding: 16,
              background: loading
                ? "rgba(124, 58, 237, 0.5)"
                : `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
              color: "white",
              border: "none",
              borderRadius: 12,
              fontSize: "1.1rem",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.4s ease",
              boxShadow: loading ? "none" : "0 8px 25px rgba(0, 217, 255, 0.3)",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Creating Account..." : "Create Organization"}
          </button>

          {/* LOGIN LINK */}
          <p style={{
            textAlign: "center",
            marginTop: 25,
            color: colors.text2,
            fontSize: "1rem",
          }}>
            Already have an account?{" "}
            <span
              onClick={() => onNavigate && onNavigate("login")}
              style={{
                color: colors.primary,
                fontWeight: "bold",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Sign In
            </span>
          </p>

          {/* BACK TO HOME */}
          <p style={{ textAlign: "center", marginTop: 12 }}>
            <span
              onClick={() => onNavigate && onNavigate("landing")}
              style={{
                color: colors.primary,
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "0.95rem",
              }}
            >
              ← Back to Home
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;