import React from "react";
import { Users } from "lucide-react";

const DashboardHeader = ({ user, subUsers, logout, colors, setShowUserManagement }) => (
  <div
    style={{
      maxWidth: 1400,
      margin: "0 auto",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 50,
      flexWrap: "wrap",
      gap: 20,
    }}
  >
    <div>
      <h2
        style={{
          color: colors.text1,
          fontSize: "2.2rem",
          marginBottom: 8,
          fontWeight: "bold",
        }}
      >
        Welcome, {user?.name}! 👋
      </h2>
      <p style={{ color: colors.text2, fontSize: "1rem" }}>
        {user?.isHeadUser
          ? `${user?.organizationName} - ${subUsers.length} team members`
          : ""}
      </p>
    </div>
    <div style={{ display: "flex", gap: 15, flexWrap: "wrap" }}>
      {user?.isHeadUser && (
        <button
          onClick={() => setShowUserManagement(true)}
          style={{
            padding: "12px 24px",
            background: `linear-gradient(135deg, ${colors.secondary}, #9333EA)`,
            border: "none",
            color: "#fff",
            borderRadius: 12,
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "1rem",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Users size={20} /> Team ({subUsers.length})
        </button>
      )}
      <button
        onClick={logout}
        style={{
          padding: "12px 28px",
          background: "transparent",
          border: `2px solid ${colors.primary}`,
          color: colors.primary,
          borderRadius: 12,
          cursor: "pointer",
          fontWeight: "600",
          fontSize: "1rem",
        }}
      >
        Logout
      </button>
    </div>
  </div>
);

export default DashboardHeader;
