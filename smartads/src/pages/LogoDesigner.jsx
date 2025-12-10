import React, { useState } from "react";
import { Rocket, X, Upload } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";  // Changed from ../../context/AuthContext
import ThemeToggle from "../components/ThemeToggle";  // Changed from ../ThemeToggle
import { API_BASE_URL } from "../utils/constants";

const LogoDesigner = ({ onNavigate }) => {
  const { colors } = useTheme();
  const { user, logout } = useAuth();
  
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]); // Can be multiple
  const [uploadedImages, setUploadedImages] = useState([]);
  const [generateCaptions, setGenerateCaptions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Toggle type selection (Logo and/or Poster)
  const toggleType = (type) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setUploadedImages(prev => [
            ...prev,
            {
              id: Date.now() + Math.random(),
              name: file.name,
              src: event.target.result
            }
          ]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  // Remove image from selection
  const removeImage = (id) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id));
  };

  // Handle generate
  const handleGenerate = async () => {
    // Validation
    if (!productName.trim()) {
      setMessage("Please enter a product name");
      return;
    }

    if (!description.trim()) {
      setMessage("Please enter a product description");
      return;
    }

    if (selectedTypes.length === 0) {
      setMessage("Please select at least Logo or Poster");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // Upload reference images if any
      let cloudinaryUrls = [];
      if (uploadedImages.length > 0) {
        const formData = new FormData();
        for (const img of uploadedImages) {
          // Convert base64 to blob
          const response = await fetch(img.src);
          const blob = await response.blob();
          formData.append('images', blob, img.name);
        }

        const uploadResponse = await fetch(`${API_BASE_URL}/api/upload-images`, {
          method: "POST",
          body: formData,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          cloudinaryUrls = uploadData.urls || [];
        }
      }

      // Generate designs for each selected type
      const results = [];
      for (const type of selectedTypes) {
        const payload = {
          type: type,
          brandName: productName,
          tagline: description,
          description: description,
          price: price,
          captionType: generateCaptions ? "with_caption" : "without_caption",
          referenceImages: cloudinaryUrls,
          size: "1024x1024",
          style: "modern, professional",
          colors: ["#0ea5e9", "#111827", "#ffffff"]
        };

        const response = await fetch(`${API_BASE_URL}/api/generate-design`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok) {
          results.push({ type, ...data });
        } else {
          throw new Error(data.error || data.details || "Generation failed");
        }
      }

      const typeText = selectedTypes.join(" & ");
      const captionText = generateCaptions && selectedTypes.includes("poster") 
        ? " with Auto-Generated Captions" 
        : "";
      const imageCount = uploadedImages.length > 0 
        ? ` (${uploadedImages.length} reference image${uploadedImages.length !== 1 ? 's' : ''})` 
        : "";

      setMessage(`✓ ${typeText}${captionText}${imageCount} generated successfully!`);
      
      // Reset form after success
      setTimeout(() => {
        setProductName("");
        setDescription("");
        setPrice("");
        setSelectedTypes([]);
        setUploadedImages([]);
        setGenerateCaptions(false);
        setMessage("");
      }, 3000);

    } catch (error) {
      setMessage("Error generating design. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    onNavigate("landing");
  };

  return (
    <div style={{ minHeight: "100vh", background: colors.bg1, fontFamily: "system-ui" }}>
      {/* NAVBAR */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          left: 0,
          right: 0,
          background: colors.bg1,
          padding: "1rem 3rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 1000,
          borderBottom: `1px solid ${colors.border}`,
          backdropFilter: "blur(10px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => onNavigate("dashboard")}>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 20px ${colors.primary}66`,
            }}
          >
            <Rocket size={28} color="white" />
          </div>
          <h2
            style={{
              fontWeight: "bold",
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              margin: 0,
            }}
          >
            SmartAds
          </h2>
        </div>

        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <ThemeToggle />
          <span style={{ color: colors.text2, fontSize: "0.95rem" }}>
            Welcome, <strong>{user?.name || "User"}</strong>
          </span>
          <button
            onClick={() => onNavigate("dashboard")}
            style={{
              padding: "10px 22px",
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
              e.target.style.color = colors.bg1;
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "transparent";
              e.target.style.color = colors.primary;
            }}
          >
            Dashboard
          </button>

          <button
            onClick={handleLogout}
            style={{
              padding: "10px 22px",
              borderRadius: 10,
              border: "none",
              background: "#EF4444",
              color: "white",
              cursor: "pointer",
              fontWeight: "600",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#DC2626";
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#EF4444";
              e.target.style.transform = "translateY(0)";
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* FORM SECTION */}
      <section
        style={{
          minHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          paddingTop: 40,
          paddingBottom: 50,
          paddingLeft: 20,
          paddingRight: 20,
        }}
      >
        <h1
          style={{
            fontSize: "2.8rem",
            fontWeight: "bold",
            color: colors.text1,
            marginBottom: 15,
            textAlign: "center",
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Design Generator
        </h1>

        <p style={{ color: colors.text2, fontSize: "1.1rem", marginBottom: 40, textAlign: "center" }}>
          Create stunning logos, posters, and more with AI
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 25,
            width: "100%",
            maxWidth: 650,
            background: colors.cardBg,
            padding: 45,
            borderRadius: 20,
            border: `1px solid ${colors.border}`,
            boxShadow: `0 20px 60px rgba(0, 0, 0, 0.3)`,
          }}
        >
          {/* Product Name */}
          <div>
            <label style={{ display: "block", marginBottom: 10, fontWeight: "600", color: colors.text1, fontSize: "1rem" }}>
              Product Name
            </label>
            <p style={{ color: colors.text2, fontSize: "0.9rem", marginBottom: 8 }}>
              Enter the name of your product or service
            </p>
            <input
              type="text"
              placeholder="e.g., TechGear Pro, Organic Coffee"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 10,
                border: `1px solid ${colors.border}`,
                fontSize: "1rem",
                outline: "none",
                background: colors.bg2,
                color: colors.text1,
                transition: "all 0.3s ease",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.primary;
                e.target.style.boxShadow = `0 0 8px ${colors.primary}40`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.border;
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Product Description */}
          <div>
            <label style={{ display: "block", marginBottom: 10, fontWeight: "600", color: colors.text1, fontSize: "1rem" }}>
              Product Description
            </label>
            <p style={{ color: colors.text2, fontSize: "0.9rem", marginBottom: 8 }}>
              Describe your product, its features, and target audience
            </p>
            <textarea
              placeholder="e.g., A modern tech gadget for professionals that improves productivity..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 10,
                border: `1px solid ${colors.border}`,
                fontSize: "1rem",
                outline: "none",
                resize: "vertical",
                background: colors.bg2,
                color: colors.text1,
                transition: "all 0.3s ease",
                boxSizing: "border-box",
                minHeight: "120px",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.primary;
                e.target.style.boxShadow = `0 0 8px ${colors.primary}40`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.border;
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Price */}
          <div>
            <label style={{ display: "block", marginBottom: 10, fontWeight: "600", color: colors.text1, fontSize: "1rem" }}>
              Price (Optional)
            </label>
            <p style={{ color: colors.text2, fontSize: "0.9rem", marginBottom: 8 }}>
              Set a price point for your product
            </p>
            <input
              type="number"
              placeholder="e.g., 99.99"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="0"
              step="0.01"
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 10,
                border: `1px solid ${colors.border}`,
                fontSize: "1rem",
                outline: "none",
                background: colors.bg2,
                color: colors.text1,
                transition: "all 0.3s ease",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.primary;
                e.target.style.boxShadow = `0 0 8px ${colors.primary}40`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.border;
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Design Type Selection */}
          <div>
            <label style={{ display: "block", marginBottom: 12, fontWeight: "600", color: colors.text1, fontSize: "1rem" }}>
              Design Type
            </label>
            <p style={{ color: colors.text2, fontSize: "0.9rem", marginBottom: 12 }}>
              Select one or both design options
            </p>
            <div style={{ display: "flex", gap: 15 }}>
              <button
                onClick={() => toggleType("logo")}
                style={{
                  flex: 1,
                  padding: "14px 0",
                  borderRadius: 10,
                  border: `2px solid ${colors.primary}`,
                  background: selectedTypes.includes("logo") ? colors.primary : "transparent",
                  color: selectedTypes.includes("logo") ? "white" : colors.primary,
                  fontWeight: "600",
                  fontSize: "1rem",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  if (!selectedTypes.includes("logo")) {
                    e.target.style.background = `${colors.primary}20`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!selectedTypes.includes("logo")) {
                    e.target.style.background = "transparent";
                  }
                }}
              >
                ✓ Logo
              </button>

              <button
                onClick={() => toggleType("poster")}
                style={{
                  flex: 1,
                  padding: "14px 0",
                  borderRadius: 10,
                  border: `2px solid ${colors.secondary}`,
                  background: selectedTypes.includes("poster") ? colors.secondary : "transparent",
                  color: selectedTypes.includes("poster") ? "white" : colors.secondary,
                  fontWeight: "600",
                  fontSize: "1rem",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  if (!selectedTypes.includes("poster")) {
                    e.target.style.background = `${colors.secondary}20`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!selectedTypes.includes("poster")) {
                    e.target.style.background = "transparent";
                  }
                }}
              >
                ✓ Poster
              </button>
            </div>
          </div>

          {/* Auto-Generate Captions (Show only if Poster is selected) */}
          {selectedTypes.includes("poster") && (
            <div>
              <label style={{ display: "block", marginBottom: 12, fontWeight: "600", color: colors.text1, fontSize: "1rem" }}>
                Captions
              </label>
              <p style={{ color: colors.text2, fontSize: "0.9rem", marginBottom: 12 }}>
                Auto-generate captions for your poster
              </p>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={generateCaptions}
                  onChange={(e) => setGenerateCaptions(e.target.checked)}
                  style={{ width: 20, height: 20, cursor: "pointer" }}
                />
                <span style={{ color: colors.text1, fontSize: "0.95rem" }}>
                  Generate captions automatically with poster
                </span>
              </label>
            </div>
          )}

          {/* Reference Images Upload */}
          <div>
            <label style={{ display: "block", marginBottom: 12, fontWeight: "600", color: colors.text1, fontSize: "1rem" }}>
              Reference Images (Optional)
            </label>
            <p style={{ color: colors.text2, fontSize: "0.9rem", marginBottom: 12 }}>
              Upload 1 or multiple reference images to guide the design. Leave empty if not needed.
            </p>

            {/* Upload Area */}
            <label
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                padding: "30px 20px",
                borderRadius: 12,
                border: `2px dashed ${colors.border}`,
                background: colors.bg2,
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.primary;
                e.currentTarget.style.background = `${colors.primary}15`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.border;
                e.currentTarget.style.background = colors.bg2;
              }}
            >
              <Upload size={28} color={colors.primary} />
              <span style={{ color: colors.text1, fontWeight: "600", textAlign: "center" }}>
                Click to upload or drag and drop
              </span>
              <span style={{ color: colors.text2, fontSize: "0.85rem", textAlign: "center" }}>
                PNG, JPG, GIF up to 5MB each
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: "none" }}
              />
            </label>

            {/* Uploaded Images Gallery */}
            {uploadedImages.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <p style={{ color: colors.text2, fontSize: "0.9rem", marginBottom: 12 }}>
                  {uploadedImages.length} image{uploadedImages.length !== 1 ? "s" : ""} selected
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                    gap: 12,
                  }}
                >
                  {uploadedImages.map(img => (
                    <div
                      key={img.id}
                      style={{
                        position: "relative",
                        borderRadius: 10,
                        overflow: "hidden",
                        border: `2px solid ${colors.border}`,
                      }}
                    >
                      <img
                        src={img.src}
                        alt={img.name}
                        style={{
                          width: "100%",
                          height: "100px",
                          objectFit: "cover",
                        }}
                      />
                      <button
                        onClick={() => removeImage(img.id)}
                        style={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          background: "#EF4444",
                          border: "none",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = "#DC2626";
                          e.target.style.transform = "scale(1.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = "#EF4444";
                          e.target.style.transform = "scale(1)";
                        }}
                      >
                        <X size={16} />
                      </button>
                      <div
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background: "rgba(0, 0, 0, 0.6)",
                          color: "white",
                          padding: "4px 6px",
                          fontSize: "0.7rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={img.name}
                      >
                        {img.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Message */}
          {message && (
            <div
              style={{
                padding: 12,
                borderRadius: 10,
                background: message.includes("successfully") 
                  ? "rgba(16, 185, 129, 0.1)" 
                  : "rgba(239, 68, 68, 0.1)",
                color: message.includes("successfully") 
                  ? "#10B981" 
                  : "#FCA5A5",
                border: `1px solid ${message.includes("successfully") ? "#10B981" : "#EF4444"}`,
                textAlign: "center",
                fontSize: "0.95rem",
              }}
            >
              {message}
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              marginTop: 10,
              padding: "16px 0",
              borderRadius: 12,
              background: loading 
                ? colors.bg2 
                : `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
              color: loading ? colors.text2 : "white",
              fontSize: "1.1rem",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
              border: "none",
              transition: "all 0.3s ease",
              boxShadow: loading ? "none" : `0 4px 15px ${colors.primary}40`,
              opacity: loading ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = `0 8px 25px ${colors.primary}60`;
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = `0 4px 15px ${colors.primary}40`;
              }
            }}
          >
            {loading ? "Generating..." : "Generate Design"}
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          padding: 40,
          background: colors.bg2,
          textAlign: "center",
          color: colors.text2,
          marginTop: 50,
          borderTop: `1px solid ${colors.border}`,
        }}
      >
        © 2025 SmartAds. All rights reserved. | Powered by AI
      </footer>
    </div>
  );
};

export default LogoDesigner;