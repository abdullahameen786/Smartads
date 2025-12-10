import React from "react";
import Modal from "./Modal";
import { Plus, Edit, Trash2, Users } from "lucide-react";

const UserManagementModal = ({
  show,
  onClose,
  subUsers,
  colors,
  setShowAddUser,
  setShowEditUser,
  setSelectedUser,
  handleDeleteSubUser,
  ALL_FEATURES,
}) => {
  if (!show) return null;

  return (
    <Modal title={`Team Management (${subUsers.length})`} onClose={onClose} colors={colors}>
      <button
        onClick={() => setShowAddUser(true)}
        style={{
          padding: "12px 24px",
          background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
          border: "none",
          color: "#fff",
          borderRadius: 12,
          cursor: "pointer",
          fontWeight: "600",
          marginBottom: 25,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Plus size={20} /> Add Member
      </button>

      {subUsers.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: colors.text2 }}>
          <Users size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
          <p>No team members yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          {subUsers.map((subUser) => (
            <div
              key={subUser.id}
              style={{
                padding: 20,
                background: colors.bg2,
                borderRadius: 12,
                border: `1px solid ${colors.border}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: 15,
                }}
              >
                <div style={{ flex: 1, minWidth: 200 }}>
                  <h3 style={{ color: colors.text1, marginBottom: 8, fontSize: "1.1rem" }}>
                    {subUser.name}
                  </h3>
                  <p style={{ color: colors.text2, fontSize: "0.9rem", marginBottom: 10 }}>
                    {subUser.email}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {subUser.allowedFeatures.map((featureId) => {
                      const feature = ALL_FEATURES.find((f) => f.id === featureId);
                      return feature ? (
                        <span
                          key={featureId}
                          style={{
                            padding: "4px 10px",
                            background: `${colors.primary}30`,
                            color: colors.primary,
                            borderRadius: 6,
                            fontSize: "0.75rem",
                            fontWeight: "600",
                          }}
                        >
                          {feature.icon} {feature.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => {
                      setSelectedUser(subUser);
                      setShowEditUser(true);
                    }}
                    style={{
                      padding: "8px 12px",
                      background: colors.secondary,
                      border: "none",
                      borderRadius: 8,
                      cursor: "pointer",
                      color: "#fff",
                    }}
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteSubUser(subUser.id)}
                    style={{
                      padding: "8px 12px",
                      background: "#EF4444",
                      border: "none",
                      borderRadius: 8,
                      cursor: "pointer",
                      color: "#fff",
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

export default UserManagementModal;
