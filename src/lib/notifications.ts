export const supportsNotifications = (): boolean => typeof window !== "undefined" && "Notification" in window;

export const ensureNotificationPermission = async (): Promise<NotificationPermission | "unsupported"> => {
  if (!supportsNotifications()) {
    return "unsupported";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  if (Notification.permission === "denied") {
    return "denied";
  }

  return Notification.requestPermission();
};

export const showSystemNotification = (title: string, body: string): void => {
  if (!supportsNotifications()) {
    return;
  }

  if (Notification.permission !== "granted") {
    return;
  }

  void new Notification(title, {
    body,
    tag: "focus-flow-session"
  });
};
