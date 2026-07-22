import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const webTimeouts: number[] = [];

export async function requestPrayerNotificationPermission() {
  if (Platform.OS === "web") {
    if (!("Notification" in window)) return false;

    if (Notification.permission === "granted") return true;

    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function cancelPrayerNotifications() {
  if (Platform.OS === "web") {
    webTimeouts.forEach((id) => clearTimeout(id));
    webTimeouts.length = 0;
    return;
  }

  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function schedulePrayerNotification({
  title,
  body,
  date,
  sound,
}: {
  title: string;
  body: string;
  date: Date;
  sound?: string;
}) {
  if (date <= new Date()) return;

  if (Platform.OS === "web") {
    const hasPermission = await requestPrayerNotificationPermission();

    if (!hasPermission) return;

    const delay = date.getTime() - Date.now();

    const timeoutId = window.setTimeout(() => {
      new Notification(title, {
        body,
        icon: "/icon.png",
      });
    }, delay);

    webTimeouts.push(timeoutId);
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
    },
  });
}
