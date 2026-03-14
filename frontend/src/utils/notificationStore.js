const NOTIFICATION_KEY = "app_notifications";
const EVENT_NAME = "notifications:updated";

const readNotifications = () => {
  try {
    return JSON.parse(localStorage.getItem(NOTIFICATION_KEY)) || [];
  } catch {
    return [];
  }
};

const writeNotifications = (items) => {
  localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(EVENT_NAME));
};

export const getNotifications = () => readNotifications();

export const setNotifications = (items) => {
  writeNotifications(items.slice(0, 50));
};

export const upsertNotification = (item) => {
  const items = readNotifications();
  const next = [item, ...items.filter((entry) => entry.id !== item.id)].slice(0, 50);
  writeNotifications(next);
};

export const addNotification = ({ title, message = "", type = "info" }) => {
  upsertNotification({
    id: Date.now().toString(),
    title,
    message,
    type,
    read: false,
    createdAt: new Date().toISOString()
  });
};

export const markAllNotificationsRead = () => {
  const items = readNotifications().map((item) => ({
    ...item,
    read: true
  }));
  writeNotifications(items);
};

export const notificationEventName = EVENT_NAME;
