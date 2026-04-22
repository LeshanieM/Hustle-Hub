import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tourTriggered, setTourTriggered] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (storedUser && token) {
      const parsed = JSON.parse(storedUser);

      // ✅ FIX: Read isFirstLogin once, then immediately clear it from storage
      // so that page refreshes never re-trigger the onboarding tour
      if (parsed.isFirstLogin) {
        const { isFirstLogin, ...userWithoutFlag } = parsed;
        localStorage.setItem("user", JSON.stringify(userWithoutFlag));
        // Keep isFirstLogin: true in memory so tour fires this session
        setUser(parsed);
      } else {
        setUser(parsed);
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    // ✅ Save full user including isFirstLogin to localStorage
    // The useEffect above will clear it from storage after reading it once
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userData.token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  const updateUser = (updatedUserData) => {
    const newUser = { ...user, ...updatedUserData };
    localStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);
  };

  const value = {
    user,
    login,
    logout,
    updateUser,
    loading,
    tourTriggered,
    setTourTriggered,
    startTour: () => setTourTriggered(true),
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
