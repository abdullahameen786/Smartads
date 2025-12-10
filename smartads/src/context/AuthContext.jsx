import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/constants';

const AuthContext = createContext();

export const ALL_FEATURES = [
  { id: 'logo', name: 'Logo Designer', icon: '🎨', category: 'Design' },
  { id: 'poster', name: 'Poster Creator', icon: '📄', category: 'Design' },
  { id: 'video', name: 'Video Generator', icon: '🎬', category: 'Video' },
  { id: 'caption', name: 'Caption Writer', icon: '✍️', category: 'Content' },
  { id: 'voiceover', name: 'Voiceover Maker', icon: '🎤', category: 'Audio' },
  { id: 'analytics', name: 'Analytics', icon: '📊', category: 'Analytics' },
];

const validateEmail = (email) => /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

const validatePassword = (password) =>
  password.length >= 8 &&
  /[A-Z]/.test(password) &&
  /[a-z]/.test(password) &&
  /[0-9]/.test(password) &&
  /[!@#$%^&*]/.test(password);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([
    {
      id: 1,
      email: 'admin@smartads.com',
      password: 'Admin@123',
      name: 'Admin User',
      organizationName: 'SmartAds HQ',
      isHeadUser: true,
      headUserId: null,
      allowedFeatures: ALL_FEATURES.map(f => f.id),
      createdAt: new Date().toISOString(),
    },
  ]);

  // Load users and logged-in user from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('smartads_data');
    if (saved) {
      const { users: savedUsers, user: savedUser } = JSON.parse(saved);
      if (savedUsers) setUsers(savedUsers);
      if (savedUser) setUser(savedUser);
    }
  }, []);

  // Persist users and logged-in user to localStorage
  useEffect(() => {
    localStorage.setItem('smartads_data', JSON.stringify({ users, user }));
  }, [users, user]);

  // Login for head user or sub-user
  const login = async ({ email, password }) => {
    try {
      // Try backend API login first
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Backend login successful, create user object
        const backendUser = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.fullName,
          role: data.user.role,
          isHeadUser: true,
          allowedFeatures: ALL_FEATURES.map(f => f.id),
        };
        setUser(backendUser);
        return backendUser;
      }
    } catch (backendError) {
      console.log("Backend login failed, trying local:", backendError.message);
    }

    // Fallback to local storage login
    const foundUser = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!foundUser) throw new Error('Invalid credentials');
    setUser(foundUser);
    return foundUser;
  };

  const logout = () => setUser(null);

  // Register head user (optional signup)
  const registerUser = (newUser) => {
    if (!validateEmail(newUser.email)) throw new Error('Invalid email format');
    if (!validatePassword(newUser.password))
      throw new Error('Password must be 8+ chars with uppercase, lowercase, number & special char');
    if (users.find(u => u.email.toLowerCase() === newUser.email.toLowerCase()))
      throw new Error('Email already exists');

    const userWithId = {
      ...newUser,
      id: Math.max(...users.map(u => u.id), 0) + 1,
      email: newUser.email.toLowerCase(),
      isHeadUser: true,
      headUserId: null,
      allowedFeatures: ALL_FEATURES.map(f => f.id),
      createdAt: new Date().toISOString(),
    };

    setUsers([...users, userWithId]);
    return userWithId;
  };

  // Register Google user
  const registerGoogleUser = (googleData) => {
    const email = googleData.email?.toLowerCase();
    if (!email) throw new Error('Invalid Google user data');

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      // Update existing user with latest data and set as current user
      const updatedUser = {
        ...existingUser,
        name: googleData.name || existingUser.name,
        picture: googleData.picture || existingUser.picture,
      };
      setUser(updatedUser);
      return updatedUser;
    }

    // Create new user from Google data
    const newUser = {
      id: googleData.id || Math.max(...users.map(u => u.id), 0) + 1,
      name: googleData.name || googleData.given_name || 'Google User',
      email: email,
      password: 'google-oauth-' + Date.now(), // Placeholder password
      picture: googleData.picture || null,
      organizationName: googleData.hd || 'Personal',
      isHeadUser: true,
      headUserId: null,
      allowedFeatures: googleData.allowedFeatures || ALL_FEATURES.map(f => f.id),
      createdAt: new Date().toISOString(),
      authProvider: 'google',
    };

    setUsers([...users, newUser]);
    setUser(newUser);
    return newUser;
  };

  // Add sub-user under head user
  const addSubUser = async (headUserId, subUserData) => {
    try {
      // Call backend API to add sub-user
      const response = await fetch(`${API_BASE_URL}/api/add-subuser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          headUserId: headUserId,
          name: subUserData.name,
          email: subUserData.email,
          password: subUserData.password,
          allowedFeatures: subUserData.allowedFeatures,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Also add to local users array for backward compatibility
        const localSubUser = {
          ...subUserData,
          id: data.subUser.id,
          email: subUserData.email.toLowerCase(),
          password: subUserData.password,
          organizationName: user?.organizationName || 'Organization',
          isHeadUser: false,
          headUserId,
          createdAt: data.subUser.createdAt,
        };
        setUsers([...users, localSubUser]);
        return localSubUser;
      } else {
        throw new Error(data.error || 'Failed to add sub-user');
      }
    } catch (error) {
      // Fallback to local storage
      console.log("Backend add sub-user failed, using local:", error.message);
      
      if (!validateEmail(subUserData.email)) throw new Error('Invalid email format');
      if (!validatePassword(subUserData.password))
        throw new Error('Password must be 8+ chars with uppercase, lowercase, number & special char');
      if (users.find(u => u.email.toLowerCase() === subUserData.email.toLowerCase()))
        throw new Error('Email already exists');
      if (!subUserData.allowedFeatures || subUserData.allowedFeatures.length === 0)
        throw new Error('At least one feature must be assigned');

      const headUser = users.find(u => u.id === headUserId);
      if (!headUser?.isHeadUser) throw new Error('Invalid head user');

      const subUser = {
        ...subUserData,
        id: Math.max(...users.map(u => u.id), 0) + 1,
        email: subUserData.email.toLowerCase(),
        password: subUserData.password,
        organizationName: headUser.organizationName,
        isHeadUser: false,
        headUserId,
        createdAt: new Date().toISOString(),
      };

      setUsers([...users, subUser]);
      return subUser;
    }
  };

  // Update sub-user
  const updateSubUser = async (subUserId, updates) => {
    try {
      // Call backend API to update sub-user
      const response = await fetch(`${API_BASE_URL}/api/update-subuser/${subUserId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Also update in local users array
        const updatedUsers = users.map(u =>
          u.id === subUserId ? { ...u, ...updates, email: updates.email?.toLowerCase() || u.email } : u
        );
        setUsers(updatedUsers);
        if (user?.id === subUserId) setUser(updatedUsers.find(u => u.id === subUserId));
      } else {
        throw new Error(data.error || 'Failed to update sub-user');
      }
    } catch (error) {
      // Fallback to local storage
      console.log("Backend update sub-user failed, using local:", error.message);
      
      if (updates.email && !validateEmail(updates.email)) throw new Error('Invalid email format');
      if (updates.password && !validatePassword(updates.password))
        throw new Error('Password must be 8+ chars with uppercase, lowercase, number & special char');

      const updatedUsers = users.map(u =>
        u.id === subUserId ? { ...u, ...updates, email: updates.email?.toLowerCase() || u.email, password: updates.password || u.password } : u
      );

      setUsers(updatedUsers);
      if (user?.id === subUserId) setUser(updatedUsers.find(u => u.id === subUserId));
    }
  };

  // Remove sub-user
  const removeSubUser = async (headUserId, subUserId) => {
    try {
      // Call backend API to delete sub-user
      const response = await fetch(`${API_BASE_URL}/api/delete-subuser/${subUserId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Also remove from local users array
        setUsers(users.filter(u => u.id !== subUserId));
        if (user?.id === subUserId) logout();
      } else {
        throw new Error(data.error || 'Failed to delete sub-user');
      }
    } catch (error) {
      // Fallback to local storage
      console.log("Backend delete sub-user failed, using local:", error.message);
      
      const subUser = users.find(u => u.id === subUserId);
      if (!subUser || subUser.headUserId !== headUserId) throw new Error('Cannot remove this user');
      setUsers(users.filter(u => u.id !== subUserId));
      if (user?.id === subUserId) logout();
    }
  };

  // Get sub-users for a head user
  const getSubUsers = async (headUserId) => {
    try {
      // Call backend API to get sub-users
      const response = await fetch(`${API_BASE_URL}/api/get-subusers/${headUserId}`);
      const data = await response.json();

      if (response.ok && data.success) {
        // Merge with local users
        const backendSubUsers = data.subUsers || [];
        const localSubUsers = users.filter(u => u.headUserId === headUserId);
        
        // Combine both, preferring backend data
        const combinedSubUsers = [...backendSubUsers];
        localSubUsers.forEach(localUser => {
          if (!combinedSubUsers.find(u => u.email === localUser.email)) {
            combinedSubUsers.push(localUser);
          }
        });
        
        return combinedSubUsers;
      }
    } catch (error) {
      console.log("Backend get sub-users failed, using local:", error.message);
    }
    
    // Fallback to local storage
    return users.filter(u => u.headUserId === headUserId);
  };

  // Check if user has access to a feature
  const hasFeatureAccess = (userId, featureId) => {
    // If checking current logged-in user, use their object directly
    if (user && user.id === userId) {
      return user?.allowedFeatures?.includes(featureId) || false;
    }
    // Otherwise check in users array (for sub-users management)
    const u = users.find(usr => usr.id === userId);
    return u?.allowedFeatures?.includes(featureId) || false;
  };

  // Get features for a user
  const getUserFeatures = (userId) => {
    // If checking current logged-in user, use their object directly
    if (user && user.id === userId) {
      return ALL_FEATURES.filter(f => user?.allowedFeatures?.includes(f.id));
    }
    // Otherwise check in users array (for sub-users management)
    const u = users.find(usr => usr.id === userId);
    return ALL_FEATURES.filter(f => u?.allowedFeatures?.includes(f.id));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        login,
        logout,
        registerUser,
        registerGoogleUser,
        addSubUser,
        updateSubUser,
        removeSubUser,
        getSubUsers,
        hasFeatureAccess,
        getUserFeatures,
        ALL_FEATURES,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
