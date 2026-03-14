import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  getNotifications,
  markAllNotificationsRead,
  notificationEventName,
  setNotifications,
  upsertNotification
} from "../utils/notificationStore";
import {
  fetchNotifications,
  markNotificationsRead
} from "../services/notificationService";
import { disconnectSocket, getSocket } from "../services/socketService";
import { getCurrentUser, isAuthenticated } from "../utils/helper";
import { isAchievementNotification } from "../utils/gamification";

const titleMap = {
  income: "Income added",
  expense: "Expense updated",
  budget: "Budget alert",
  warning: "Warning",
  ai: "AI suggestion",
  achievement: "Achievement",
  info: "Notification"
};

const normalizeNotification = (item) => ({
  id: item._id || item.id,
  title: item.title || titleMap[item.type] || "Notification",
  message: item.message || "",
  type: item.type || "info",
  read: Boolean(item.read),
  createdAt: item.createdAt || new Date().toISOString()
});

const useNotifications = () => {
  const [items, setItems] = useState(getNotifications());

  useEffect(() => {
    const sync = () => setItems(getNotifications());
    window.addEventListener(notificationEventName, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(notificationEventName, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      disconnectSocket();
      setNotifications([]);
      return;
    }

    let active = true;

    const loadNotifications = async () => {
      try {
        const data = await fetchNotifications();
        if (!active) return;
        setNotifications(data.map(normalizeNotification));
      } catch {
        // Keep local notifications if the API is unavailable.
      }
    };

    loadNotifications();

    const user = getCurrentUser();
    const socket = getSocket();

    const handleConnect = () => {
      if (user?._id) {
        socket.emit("join", user._id);
      }
    };

    socket.on("connect", handleConnect);

    if (socket.connected && user?._id) {
      socket.emit("join", user._id);
    }

    const handleIncomingNotification = (payload) => {
      const item = normalizeNotification(payload);
      upsertNotification(item);
      toast(item.title, {
        icon: isAchievementNotification(item)
          ? "T"
          : item.type === "warning"
            ? "!"
            : item.type === "expense"
              ? "-"
              : item.type === "income"
                ? "+"
                : "*"
      });
    };

    socket.on("new_notification", handleIncomingNotification);

    return () => {
      active = false;
      socket.off("connect", handleConnect);
      socket.off("new_notification", handleIncomingNotification);
    };
  }, []);

  const unreadCount = useMemo(
    () => items.filter((item) => !item.read).length,
    [items]
  );

  const markAllRead = async () => {
    try {
      if (isAuthenticated()) {
        await markNotificationsRead();
      }
    } catch {
      // Fall back to local read state even if the server call fails.
    }

    markAllNotificationsRead();
    setItems(getNotifications());
  };

  return {
    items,
    unreadCount,
    markAllRead
  };
};

export default useNotifications;
