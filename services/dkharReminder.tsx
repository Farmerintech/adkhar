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

// How many days ahead to pre-schedule
const DAYS_AHEAD = 7;

// How long before Fajr the follow-up Tahajjud reminder fires
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

  /**
   * Cancel only the notifications created by this component.
   *
   * We use identifiers so that we don't accidentally cancel
   * prayer-time notifications or other notifications from the app.
   */
  const cancelOwnNotifications = async () => {
    if (Platform.OS === "web") return;

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
    // Always remove our previous reminders first.
    // This ensures disabling a setting removes stale notifications.
    await cancelOwnNotifications();

    // Nothing to schedule if both reminders are disabled.
    if (!settings.adhkarReminder && !settings.tahajjudReminder) {
      return;
    }

    // Native Expo notifications are not scheduled here on web.
    if (Platform.OS === "web") {
      return;
    }

    const voice = settings.adhanVoice as keyof typeof ADHAN_SOUND_MAP;

    const sound = ADHAN_SOUND_MAP[voice] ?? ADHAN_SOUND_MAP.alafasy;

    const channelId = ADHAN_CHANNEL_MAP[voice] ?? ADHAN_CHANNEL_MAP.alafasy;

    const isAndroid = Platform.OS === "android";

    try {
      /**
       * Request location permission because prayer times
       * depend on the user's current location.
       */
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        return;
      }

      const location = await Location.getCurrentPositionAsync({});

      const coordinates = new Coordinates(
        location.coords.latitude,
        location.coords.longitude,
      );

      const params = CalculationMethod.MuslimWorldLeague();
      params.madhab = Madhab.Shafi;

      /**
       * IMPORTANT:
       *
       * Do not rely on NotificationProvider to create the
       * notification channel first.
       *
       * On a cold start, this component's effect can run before
       * NotificationProvider's effect.
       *
       * Therefore, guarantee that the channel exists right
       * before any notification is scheduled against it.
       */
      if (isAndroid) {
        await Notifications.setNotificationChannelAsync(channelId, {
          name: `Adhan - ${voice}`,
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#4A154B",
          sound,
        });
      }

      const now = new Date();

      for (let i = 0; i < DAYS_AHEAD; i++) {
        const dayDate = addDays(now, i);
        const nextDayDate = addDays(now, i + 1);

        const prayer = new PrayerTimes(coordinates, dayDate, params);

        const nextDayPrayer = new PrayerTimes(coordinates, nextDayDate, params);

        // =====================================================
        // MORNING / EVENING ADHKAR
        // =====================================================

        if (settings.adhkarReminder) {
          const morningReminder = addHours(prayer.fajr, 1);
          const eveningReminder = addHours(prayer.asr, 1);

          // -------------------------
          // Morning Adhkar
          // -------------------------

          if (morningReminder > now) {
            await Notifications.scheduleNotificationAsync({
              identifier: `morning-adhkar-${i}`,

              content: {
                title: "🌅 Morning Adhkar",
                body: "Don't forget your morning remembrance.",

                // iOS
                sound: sound as any,

                // Android
                ...(isAndroid && {
                  channelId,
                }),
              },

              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: morningReminder,
              },
            });
          }

          // -------------------------
          // Evening Adhkar
          // -------------------------

          if (eveningReminder > now) {
            await Notifications.scheduleNotificationAsync({
              identifier: `evening-adhkar-${i}`,

              content: {
                title: "🌇 Evening Adhkar",
                body: "Don't forget your evening remembrance.",

                // iOS
                sound: sound as any,

                // Android
                ...(isAndroid && {
                  channelId,
                }),
              },

              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: eveningReminder,
              },
            });
          }
        }

        // =====================================================
        // TAHAJJUD
        // =====================================================

        if (settings.tahajjudReminder) {
          /**
           * Night:
           *
           * Maghrib today
           *        ↓
           * Fajr tomorrow
           *
           * Last third begins at:
           *
           * Maghrib + (2/3 × night duration)
           */

          const nightStart = prayer.maghrib;
          const nightEnd = nextDayPrayer.fajr;

          const nightDurationMs = nightEnd.getTime() - nightStart.getTime();

          // Safety check for invalid/negative night duration
          if (nightDurationMs > 0) {
            const lastThirdStart = new Date(
              nightStart.getTime() + (nightDurationMs * 2) / 3,
            );

            /**
             * Follow-up reminder:
             * 60 minutes before Fajr.
             */
            const followupTime = addMinutes(
              nightEnd,
              -FOLLOWUP_MINUTES_BEFORE_FAJR,
            );

            // -------------------------
            // Tahajjud Start
            // -------------------------

            if (lastThirdStart > now) {
              await Notifications.scheduleNotificationAsync({
                identifier: `tahajjud-start-${i}`,

                content: {
                  title: "🌙 Tahajjud Begins",
                  body: "The last third of the night has begun — a blessed time for Tahajjud.",

                  // iOS
                  sound: sound as any,

                  // Android
                  ...(isAndroid && {
                    channelId,
                  }),
                },

                trigger: {
                  type: Notifications.SchedulableTriggerInputTypes.DATE,
                  date: lastThirdStart,
                },
              });
            }

            // -------------------------
            // Tahajjud Follow-up
            // -------------------------

            /**
             * Only schedule this if:
             *
             * 1. It is still in the future.
             * 2. It comes after the beginning of the last third.
             *
             * This prevents strange scheduling on very short nights.
             */
            if (followupTime > now && followupTime > lastThirdStart) {
              await Notifications.scheduleNotificationAsync({
                identifier: `tahajjud-followup-${i}`,

                content: {
                  title: "🌙 Tahajjud — Last Call",
                  body: "Fajr is approaching soon — a last chance for Tahajjud tonight.",

                  // iOS
                  sound: sound as any,

                  // Android
                  ...(isAndroid && {
                    channelId,
                  }),
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
