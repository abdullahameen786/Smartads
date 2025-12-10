// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

// Colors & Constants
export const colors = {
  bg1: "#0A0E27",
  cardBg: "rgba(15, 19, 48, 0.8)",
  text1: "#E0E7FF",
  text2: "#B4C6FC",
  primary: "#00D9FF",
  secondary: "#7C3AED",
  locked: "#4B5563",
  error: "#EF4444",
  inputBg: "rgba(255,255,255,0.1)",
  border: "rgba(0, 217, 255, 0.2)"
};

export const ALL_FEATURES = [
  { id: 'logo', name: 'Logo Design' },
  { id: 'poster', name: 'Poster Creation' },
  { id: 'video', name: 'Video Generation' },
  { id: 'caption', name: 'Caption Writer' },
  { id: 'voiceover', name: 'Voiceover Synthesis' },
  { id: 'analytics', name: 'Analytics' },
];
