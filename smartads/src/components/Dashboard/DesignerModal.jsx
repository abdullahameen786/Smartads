import React from "react";
import Modal from "./Modal";
import { Palette, FileImage } from "lucide-react";

const DesignerModal = ({
  show,
  onClose,
  designType,
  setDesignType,
  formData,
  setFormData,
  handleSubmit,
  errors,
  loading,
  colors,
}) => {
  if (!show) return null;

  return (
    <Modal title="Logo & Poster Designer" onClose={onClose} colors={colors}>
      <div style={{ marginBottom: 25 }}>
        <label
          style={{ color: colors.text2, display: "block", marginBottom: 12, fontWeight: "600" }}
        >
          Design Type
        </label>
        <div style={{ display: "flex", gap: 15 }}>
          {["logo", "poster"].map((type) => (
            <button
              key={type}
              onClick={() => setDesignType(type)}
              style={{
                flex: 1,
                padding: "15px 20px",
                borderRadius: 12,
                border:
                  designType === type ? `2px solid ${colors.primary}` : `1px solid ${colors.border}`,
                background: designType === type ? `${colors.primary}20` : colors.bg2,
                color: colors.text1,
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                textTransform: "capitalize",
              }}
            >
              {type === "logo" ? <Palette size={20} /> : <FileImage size={20} />} {type}
            </button>
          ))}
        </div>
      </div>

      {["productName", ...(designType === "poster" ? ["amount"] : []), "description"].map((field) => (
        <div key={field} style={{ marginBottom: 20 }}>
          <label
            style={{
              color: colors.text2,
              display: "block",
              marginBottom: 8,
              fontWeight: "600",
              textTransform: "capitalize",
            }}
          >
            {field.replace(/([A-Z])/g, " $1")} *
          </label>
          {field === "description" ? (
            <textarea
              placeholder={`Describe your ${designType}...`}
              value={formData[field]}
              onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
              rows={4}
              style={{
                width: "100%",
                padding: 14,
                borderRadius: 10,
                border: `1px solid ${errors[field] ? "#EF4444" : colors.border}`,
                background: colors.bg2,
                color: colors.text1,
                fontSize: "1rem",
                outline: "none",
                resize: "vertical",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
          ) : (
            <input
              type="text"
              placeholder={field === "amount" ? "e.g., $99" : `Enter ${field}`}
              value={formData[field]}
              onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
              style={{
                width: "100%",
                padding: 14,
                borderRadius: 10,
                border: `1px solid ${errors[field] ? "#EF4444" : colors.border}`,
                background: colors.bg2,
                color: colors.text1,
                fontSize: "1rem",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          )}
          {errors[field] && (
            <p style={{ color: "#EF4444", marginTop: 6, fontSize: "0.85rem" }}>{errors[field]}</p>
          )}
        </div>
      ))}

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          width: "100%",
          padding: 16,
          background: loading ? colors.bg2 : `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
          color: "white",
          border: "none",
          borderRadius: 12,
          fontSize: "1.1rem",
          fontWeight: "bold",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? "Generating..." : `Generate ${designType === "logo" ? "Logo" : "Poster"}`}
      </button>
    </Modal>
  );
};

export default DesignerModal;
