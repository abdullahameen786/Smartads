import React from "react";

const ToolCard = ({ tool, colors }) => (
  <div
    onClick={tool.action || null}
    style={{
      padding: 30,
      borderRadius: 20,
      background: colors.cardBg,
      border: `1px solid ${colors.border}`,
      cursor: tool.action ? "pointer" : "default",
      transition: "all 0.3s ease",
    }}
    onMouseEnter={(e) =>
      tool.action &&
      ((e.currentTarget.style.transform = "translateY(-5px)"),
      (e.currentTarget.style.boxShadow = `0 10px 30px ${tool.color}40`))
    }
    onMouseLeave={(e) =>
      tool.action &&
      ((e.currentTarget.style.transform = "translateY(0)"),
      (e.currentTarget.style.boxShadow = "none"))
    }
  >
    <div
      style={{
        width: 80,
        height: 80,
        borderRadius: 16,
        background: `linear-gradient(135deg, ${tool.color}, ${tool.color}dd)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 20px",
        boxShadow: `0 8px 20px ${tool.color}40`,
      }}
    >
      <tool.icon size={40} color="white" strokeWidth={2} />
    </div>
    <h3
      style={{
        color: colors.text1,
        fontSize: "1.3rem",
        marginBottom: 8,
        textAlign: "center",
        fontWeight: "600",
      }}
    >
      {tool.name}
    </h3>
    <p
      style={{
        color: colors.text2,
        fontSize: "0.9rem",
        textAlign: "center",
        lineHeight: 1.5,
      }}
    >
      {tool.description}
    </p>
  </div>
);

export default ToolCard;
