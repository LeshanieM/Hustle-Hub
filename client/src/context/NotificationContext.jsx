import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import api from "../api/axios";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({});

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await api.get("/notifications");
      setNotifications(data.notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get("/notifications/unread-count");
      setUnreadCount(data.count);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  }, [user]);

  const fetchPreferences = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get("/notifications/preferences");
      setPreferences(data);
    } catch (error) {
      console.error("Error fetching preferences:", error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUnreadCount();
      fetchPreferences();

      // Refresh unread count and notifications every 30 seconds
      const interval = setInterval(() => {
        fetchUnreadCount();
        fetchNotifications();
      }, 30000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setPreferences({});
    }
  }, [user, fetchNotifications, fetchUnreadCount, fetchPreferences]);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const updatePreferences = async (newPrefs) => {
    try {
      const { data } = await api.put("/notifications/preferences", { preferences: newPrefs });
      setPreferences(data);
    } catch (error) {
      console.error("Error updating preferences:", error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        preferences,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        updatePreferences,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
