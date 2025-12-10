import React from "react";
import Modal from "./Modal";

const AddEditUserModal = ({
  show,
  onClose,
  showAddUser,
  showEditUser,
  colors,
  errors,
  setErrors,
  newUserData,
  setNewUserData,
  selectedUser,
  setSelectedUser,
  ALL_FEATURES,
  handleAddSubUser,
  handleUpdateSubUser,
  toggleFeature,
}) => {
  if (!show) return null;

  const currentUserData = showEditUser ? selectedUser : newUserData;

  const handleChange = (field, value) => {
    if (showEditUser) setSelectedUser({ ...selectedUser, [field]: value });
    else setNewUserData({ ...newUserData, [field]: value });

    // Reset error for this field
    if (errors[field]) setErrors({ ...errors, [field]: null });
  };

  const handleToggleFeature = (featureId) => {
    toggleFeature(featureId, showEditUser);
    if (errors.features) setErrors({ ...errors, features: null });
  };

  return (
    <Modal title={showAddUser ? "Add Team Member" : "Edit Team Member"} onClose={onClose} colors={colors}>
      {errors.submit && (
        <div
          style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid #EF4444",
            color: "#FCA5A5",
            padding: 12,
            borderRadius: 10,
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          {errors.submit}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {["name", "email", "password"].map((field) => (
          <div key={field}>
            <label
              style={{
                color: colors.text2,
                display: "block",
                marginBottom: 8,
                fontWeight: "600",
                textTransform: "capitalize",
              }}
            >
              {field} {field !== "password" || showAddUser ? "*" : "(optional)"}
            </label>
            <input
              type={field === "password" ? "password" : field === "email" ? "email" : "text"}
              placeholder={field === "password" ? "Min 8 chars, 1 uppercase, 1 number, 1 special" : `Enter ${field}`}
              value={currentUserData?.[field] || ""}
              onChange={(e) => handleChange(field, e.target.value)}
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
            {errors[field] && <p style={{ color: "#EF4444", marginTop: 6, fontSize: "0.85rem" }}>{errors[field]}</p>}
          </div>
        ))}

        <div>
          <label style={{ color: colors.text2, display: "block", marginBottom: 12, fontWeight: "600" }}>Assign Features *</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
            {ALL_FEATURES.map((feature) => {
              const isSelected = showEditUser
                ? selectedUser?.allowedFeatures?.includes(feature.id)
                : newUserData.allowedFeatures.includes(feature.id);
              return (
                <div
                  key={feature.id}
                  onClick={() => handleToggleFeature(feature.id)}
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    border: `2px solid ${isSelected ? colors.primary : colors.border}`,
                    background: isSelected ? colors.primary + "20" : colors.bg2,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    transition: "all 0.3s ease",
                  }}
                >
                  <span style={{ fontSize: "1.2rem" }}>{feature.icon}</span>
                  <span style={{ color: colors.text1, fontSize: "0.85rem", fontWeight: "600" }}>{feature.name}</span>
                </div>
              );
            })}
          </div>
          {errors.features && <p style={{ color: "#EF4444", marginTop: 6, fontSize: "0.85rem" }}>{errors.features}</p>}
        </div>

        <button
          onClick={showAddUser ? handleAddSubUser : handleUpdateSubUser}
          style={{
            padding: "14px 0",
            borderRadius: 10,
            border: "none",
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
            color: "white",
            cursor: "pointer",
            fontSize: "1rem",
            fontWeight: "600",
            marginTop: 10,
          }}
        >
          {showAddUser ? "Add User" : "Update User"}
        </button>
      </div>
    </Modal>
  );
};

export default AddEditUserModal;
