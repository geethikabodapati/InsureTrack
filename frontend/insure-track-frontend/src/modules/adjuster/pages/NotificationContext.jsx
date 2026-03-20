import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { notificationsApi } from "../../../core/services/api";

// Vasudha's userId in the backend
const ADJUSTER_USER_ID = 5;

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationsApi.getAll(ADJUSTER_USER_ID);
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Notifications fetch failed:", err.message);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markRead = useCallback(async (id) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications(prev =>
        prev.map(n => (n.notificationId === id || n.id === id) ? { ...n, read: true } : n)
      );
    } catch (err) { console.error("markRead failed:", err.message); }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await notificationsApi.markAllRead(ADJUSTER_USER_ID);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) { console.error("markAllRead failed:", err.message); }
  }, []);

  const remove = useCallback(async (id) => {
    try {
      await notificationsApi.dismiss(id);
      setNotifications(prev =>
        prev.filter(n => n.notificationId !== id && n.id !== id)
      );
    } catch (err) { console.error("dismiss failed:", err.message); }
  }, []);

  const refresh = useCallback(() => fetchNotifications(), [fetchNotifications]);

  const unreadCount = notifications.filter(n =>
    n.read === false || n.status === "UNREAD"
  ).length;

  return (
    <NotificationContext.Provider value={{
      notifications, loading, unreadCount,
      markRead, markAllRead, remove, refresh, fetchNotifications,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
