import React from "react";
import { X } from "lucide-react";

const Modal = ({ title, onClose, children, colors }) => (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.8)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      zIndex: 1000,
      backdropFilter: "blur(5px)",
    }}
  >
    <div
      style={{
        background: colors.cardBg,
        borderRadius: 20,
        padding: 40,
        maxWidth: 600,
        width: "100%",
        border: `1px solid ${colors.border}`,
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
        maxHeight: "90vh",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 30,
        }}
      >
        <h2
          style={{
            color: colors.text1,
            fontSize: "1.6rem",
            fontWeight: "bold",
            margin: 0,
          }}
        >
          {title}
        </h2>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            color: colors.text2,
            cursor: "pointer",
            padding: 8,
          }}
        >
          <X size={24} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

export default Modal;
