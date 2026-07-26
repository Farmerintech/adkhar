import {
  ADHAN_CHANNEL_MAP,
  ADHAN_SOUND_MAP,
} from "@/app/context/notificationsContext";
import { useSettings } from "@/app/context/settingsContext";
import { CalculationMethod, Coordinates, Madhab, PrayerTimes } from "adhan";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { Platform } from "react-native";

// How many days ahead to pre-schedule, so reminders keep firing
// even if the user doesn't open the app in between.
const DAYS_AHEAD = 7;

// How long before Fajr the follow-up Tahajjud reminder fires.
const FOLLOWUP_MINUTES_BEFORE_FAJR = 60;

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const addHours = (date: Date, hours: number) => {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
};

const addMinutes = (date: Date, minutes: number) => {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
};

export default function AdhkarReminder() {
  const { settings } = useSettings();

  useEffect(() => {
    scheduleReminders();
  }, [settings.adhkarReminder, settings.tahajjudReminder, settings.adhanVoice]);

  const cancelOwnNotifications = async () => {
    const identifiers: string[] = [];

    for (let i = 0; i < DAYS_AHEAD; i++) {
      identifiers.push(`morning-adhkar-${i}`);
      identifiers.push(`evening-adhkar-${i}`);
      identifiers.push(`tahajjud-start-${i}`);
      identifiers.push(`tahajjud-followup-${i}`);
    }

    await Promise.all(
      identifiers.map((id) =>
        Notifications.cancelScheduledNotificationAsync(id).catch(() => {}),
      ),
    );
  };

  const scheduleReminders = async () => {
    // Cancel our own previously scheduled notifications first,
    // regardless of which reminders are currently enabled, so
    // toggling something off actually removes stale ones.
    await cancelOwnNotifications();

    if (!settings.adhkarReminder && !settings.tahajjudReminder) return;

    const voice = settings.adhanVoice as keyof typeof ADHAN_SOUND_MAP;
    const sound = ADHAN_SOUND_MAP[voice];
    const channelId = ADHAN_CHANNEL_MAP[voice];
    const isAndroid = Platform.OS === "android";

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

      const now = new Date();

      for (let i = 0; i < DAYS_AHEAD; i++) {
        const dayDate = addDays(now, i);
        const nextDayDate = addDays(now, i + 1);

        const prayer = new PrayerTimes(coordinates, dayDate, params);
        const nextDayPrayer = new PrayerTimes(coordinates, nextDayDate, params);

        // --- Morning / Evening Adhkar ---
        if (settings.adhkarReminder) {
          const morningReminder = addHours(prayer.fajr, 1);
          const eveningReminder = addHours(prayer.asr, 1);

          if (morningReminder > now) {
            await Notifications.scheduleNotificationAsync({
              identifier: `morning-adhkar-${i}`,
              content: {
                title: "🌅 Morning Adhkar",
                body: "Don't forget your morning remembrance.",
                sound: sound as any,
                ...(isAndroid && { channelId }),
              },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: morningReminder,
              },
            });
          }

          if (eveningReminder > now) {
            await Notifications.scheduleNotificationAsync({
              identifier: `evening-adhkar-${i}`,
              content: {
                title: "🌇 Evening Adhkar",
                body: "Don't forget your evening remembrance.",
                sound: sound as any,
                ...(isAndroid && { channelId }),
              },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: eveningReminder,
              },
            });
          }
        }

        // --- Tahajjud (astronomical last-third-of-night method) ---
        // Night = Maghrib (today) -> Fajr (tomorrow).
        // Last third starts at Maghrib + (2/3 * night duration).
        if (settings.tahajjudReminder) {
          const nightStart = prayer.maghrib;
          const nightEnd = nextDayPrayer.fajr;
          const nightDurationMs = nightEnd.getTime() - nightStart.getTime();

          // Sanity guard: if this comes out negative or absurd
          // (bad location/date edge case), skip this day.
          if (nightDurationMs > 0) {
            const lastThirdStart = new Date(
              nightStart.getTime() + (nightDurationMs * 2) / 3,
            );

            const followupTime = addMinutes(
              nightEnd,
              -FOLLOWUP_MINUTES_BEFORE_FAJR,
            );

            // First (start-of-Tahajjud) reminder.
            if (lastThirdStart > now) {
              await Notifications.scheduleNotificationAsync({
                identifier: `tahajjud-start-${i}`,
                content: {
                  title: "🌙 Tahajjud Begins",
                  body: "The last third of the night has begun — a blessed time for Tahajjud.",
                  sound: sound as any,
                  ...(isAndroid && { channelId }),
                },
                trigger: {
                  type: Notifications.SchedulableTriggerInputTypes.DATE,
                  date: lastThirdStart,
                },
              });
            }

            // Follow-up reminder, only if it lands after the start
            // reminder (guards against very short nights where the
            // "1 hour before Fajr" point would be before last-third
            // even begins).
            if (followupTime > now && followupTime > lastThirdStart) {
              await Notifications.scheduleNotificationAsync({
                identifier: `tahajjud-followup-${i}`,
                content: {
                  title: "🌙 Tahajjud — Last Call",
                  body: "Fajr is approaching soon — a last chance for Tahajjud tonight.",
                  sound: sound as any,
                  ...(isAndroid && { channelId }),
                },
                trigger: {
                  type: Notifications.SchedulableTriggerInputTypes.DATE,
                  date: followupTime,
                },
              });
            }
          }
        }
      }
    } catch (error) {
      console.log("Reminder Error:", error);
    }
  };

  return null;
}
