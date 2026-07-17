import { useSettings } from "@/app/context/settingsContext";
import { CalculationMethod, Coordinates, Madhab, PrayerTimes } from "adhan";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";

export default function AdhkarReminder() {
  const { settings } = useSettings();

  useEffect(() => {
    scheduleReminders();
  }, []);

  const scheduleReminders = async () => {
    if (!settings.adhkarReminder) return;

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") return;

      const location = await Location.getCurrentPositionAsync({});

      const coordinates = new Coordinates(
        location.coords.latitude,
        location.coords.longitude,
      );

      const params = CalculationMethod.MuslimWorldLeague();
      params.madhab = Madhab.Shafi;

      const today = new Date();

      const prayer = new PrayerTimes(coordinates, today, params);

      const morningReminder = new Date(prayer.fajr);
      morningReminder.setHours(morningReminder.getHours() + 1);

      const eveningReminder = new Date(prayer.asr);
      eveningReminder.setHours(eveningReminder.getHours() + 1);

      await Notifications.cancelScheduledNotificationAsync(
        "morning-adhkar",
      ).catch(() => {});

      await Notifications.cancelScheduledNotificationAsync(
        "evening-adhkar",
      ).catch(() => {});

      if (morningReminder > new Date()) {
        await Notifications.scheduleNotificationAsync({
          identifier: "morning-adhkar",
          content: {
            title: "🌅 Morning Adhkar",
            body: "Don't forget your morning remembrance.",
            sound: "default",
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: morningReminder,
          },
        });
      }

      if (eveningReminder > new Date()) {
        await Notifications.scheduleNotificationAsync({
          identifier: "evening-adhkar",
          content: {
            title: "🌇 Evening Adhkar",
            body: "Don't forget your evening remembrance.",
            sound: "default",
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: eveningReminder,
          },
        });
      }

      console.log("Morning reminder:", morningReminder.toLocaleString());

      console.log("Evening reminder:", eveningReminder.toLocaleString());
    } catch (error) {
      console.log("Reminder Error:", error);
    }
  };

  return null;
}
