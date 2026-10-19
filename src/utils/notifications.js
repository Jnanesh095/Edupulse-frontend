
const STORAGE_KEY = "edupulse_notifications";
export const EVENT_NAME = "edupulse-notifications-updated";

export function getNotifications() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addNotification(message, type = "info") {
  const notifications = getNotifications();

  const notification = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    message,
    type,
    createdAt: new Date().toISOString(),
    read: false,
  };

  const updated = [notification, ...notifications].slice(0, 50);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event(EVENT_NAME));

  return notification;
}

export function markAllNotificationsRead() {
  const updated = getNotifications().map((item) => ({
    ...item,
    read: true,
  }));

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event(EVENT_NAME));
}
