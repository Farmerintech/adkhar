import {
  ADHAN_CHANNEL_MAP,
  ADHAN_SOUND_MAP,
} from "@/app/context/notificationsContext";
import { useSettings } from "@/app/context/settingsContext";

import { CalculationMethod, Coordinates, Madhab, PrayerTimes } from "adhan";

import * as Location from "expo-location";
import * as Notifications from "expo-notifications";

import { useEffect, useRef, useState } from "react";

import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";

const PRIMARY = "#4A154B";
const GOLD = "#D4AF37";

const CARD_WIDTH = 105;
const CARD_MARGIN = 12;

// How many days ahead to pre-schedule notifications for.
// This is what lets Subh (and everything else) fire even if
// the user never opens the app in between.
const DAYS_AHEAD = 7;

type Prayer = {
  name: string;
  time: string;
  date: Date;
};

type UserCoordinates = {
  latitude: number;
  longitude: number;
};

export default function PrayerTimesToday() {
  const scrollRef = useRef<ScrollView>(null);
  const webNotificationTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const lastWebLocation = useRef<UserCoordinates | null>(null);

  const { settings } = useSettings();

  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [nextPrayerIndex, setNextPrayerIndex] = useState(0);
  const [locationName, setLocationName] = useState("");

  const title = locationName
    ? `${locationName} Prayer Times Today`
    : "Prayer Times Today";

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const buildPrayerList = (prayer: PrayerTimes): Prayer[] => [
    { name: "Subh", time: formatTime(prayer.fajr), date: prayer.fajr },
    { name: "Sunrise", time: formatTime(prayer.sunrise), date: prayer.sunrise },
    { name: "Zuhr", time: formatTime(prayer.dhuhr), date: prayer.dhuhr },
    { name: "Asr", time: formatTime(prayer.asr), date: prayer.asr },
    { name: "Maghrib", time: formatTime(prayer.maghrib), date: prayer.maghrib },
    { name: "Isha", time: formatTime(prayer.isha), date: prayer.isha },
  ];

  const findNextPrayer = (prayerList: Prayer[]) => {
    const now = new Date();

    const validPrayers = prayerList.filter(
      (prayer) => prayer.name !== "Sunrise",
    );

    let nextPrayer = validPrayers.find(
      (prayer) => prayer.date.getTime() > now.getTime(),
    );

    if (!nextPrayer) {
      nextPrayer = validPrayers[0];
    }

    const index = prayerList.findIndex(
      (prayer) => prayer.name === nextPrayer?.name,
    );

    setNextPrayerIndex(index);

    setTimeout(() => {
      scrollRef.current?.scrollTo({
        x: index * (CARD_WIDTH + CARD_MARGIN),
        animated: true,
      });
    }, 300);
  };

  const getDistanceInMeters = (
    first: UserCoordinates,
    second: UserCoordinates,
  ) => {
    const earthRadius = 6371000;
    const toRadians = (value: number) => (value * Math.PI) / 180;

    const lat1 = toRadians(first.latitude);
    const lat2 = toRadians(second.latitude);
    const deltaLat = toRadians(second.latitude - first.latitude);
    const deltaLon = toRadians(second.longitude - first.longitude);

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(deltaLon / 2) *
        Math.sin(deltaLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadius * c;
  };

  const updateLocationName = async (latitude: number, longitude: number) => {
    try {
      const places = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      const place = places[0];

      const name =
        place?.city ||
        place?.subregion ||
        place?.region ||
        place?.country ||
        "";

      setLocationName(name);
    } catch (error) {
      console.log("Location Name Error:", error);
      setLocationName(Platform.OS === "web" ? "Current Location" : "");
    }
  };

  const clearWebNotifications = () => {
    webNotificationTimers.current.forEach((timer) => clearTimeout(timer));
    webNotificationTimers.current = [];
  };

  const requestWebNotificationPermission = async () => {
    const BrowserNotification = (globalThis as any).Notification;

    if (!BrowserNotification) return false;

    if (BrowserNotification.permission === "granted") return true;
    if (BrowserNotification.permission === "denied") return false;

    const permission = await BrowserNotification.requestPermission();

    return permission === "granted";
  };

  const scheduleWebNotification = async ({
    title,
    body,
    date,
  }: {
    title: string;
    body: string;
    date: Date;
  }) => {
    if (date <= new Date()) return;

    const hasPermission = await requestWebNotificationPermission();

    if (!hasPermission) return;

    const BrowserNotification = (globalThis as any).Notification;
    const delay = date.getTime() - Date.now();

    // Web has no true background scheduling — this timer only
    // fires if the tab stays open, which is a browser limitation,
    // not something we can fix in app code.
    const timer = setTimeout(() => {
      new BrowserNotification(title, {
        body,
      });
    }, delay);

    webNotificationTimers.current.push(timer);
  };

  // Builds the 5 notification-worthy prayers (no Sunrise) for a
  // single day's PrayerTimes object.
  const buildNotificationPrayers = (prayer: PrayerTimes) => [
    { name: "Fajr", date: prayer.fajr },
    { name: "Dhuhr", date: prayer.dhuhr },
    { name: "Asr", date: prayer.asr },
    { name: "Maghrib", date: prayer.maghrib },
    { name: "Isha", date: prayer.isha },
  ];

  // Schedules notifications for TODAY plus the next DAYS_AHEAD-1 days,
  // all in one pass. This is what makes Subh (and everything else)
  // reliable even if the user doesn't open the app tomorrow, or the
  // day after — those notifications are already queued in the OS.
  const scheduleUpcomingPrayerNotifications = async (
    latitude: number,
    longitude: number,
  ) => {
    if (Platform.OS === "web") {
      clearWebNotifications();
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }

    if (!settings.prayerNotification) return;

    const coordinates = new Coordinates(latitude, longitude);
    const params = CalculationMethod.MuslimWorldLeague();
    params.madhab = Madhab.Shafi;

    const voice = settings.adhanVoice as keyof typeof ADHAN_SOUND_MAP;
    const sound = ADHAN_SOUND_MAP[voice] ?? ADHAN_SOUND_MAP.alafasy;
    const channelId = ADHAN_CHANNEL_MAP[voice] ?? ADHAN_CHANNEL_MAP.alafasy;

    // Guarantee the channel exists before we ever try to schedule against
    // it — don't rely on NotificationProvider's setup effect having run
    // first, since effect order between a parent provider and a deeply
    // nested child is NOT guaranteed on initial mount. This call is cheap
    // and idempotent; Android just no-ops if the channel already exists
    // with the same id.
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync(channelId, {
        name: `Adhan - ${voice}`,
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#4A154B",
        sound,
      });
    }

    for (let dayOffset = 0; dayOffset < DAYS_AHEAD; dayOffset++) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + dayOffset);

      const prayer = new PrayerTimes(coordinates, targetDate, params);
      const notificationPrayers = buildNotificationPrayers(prayer);

      for (const item of notificationPrayers) {
        if (item.date <= new Date()) continue;

        const notifTitle = `🕌 ${item.name} Prayer`;
        const body = `It is time for ${item.name} prayer.`;

        if (Platform.OS === "web") {
          await scheduleWebNotification({
            title: notifTitle,
            body,
            date: item.date,
          });

          continue;
        }

        await Notifications.scheduleNotificationAsync({
          content: {
            title: notifTitle,
            body,
            sound: sound as any, // used on iOS
            ...(Platform.OS === "android" && { channelId }),
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: item.date,
          },
        });
      }
    }
  };

  const generatePrayerTimes = async (latitude: number, longitude: number) => {
    try {
      const coordinates = new Coordinates(latitude, longitude);

      const params = CalculationMethod.MuslimWorldLeague();
      params.madhab = Madhab.Shafi;

      // Today's times, just for the on-screen card display.
      const prayer = new PrayerTimes(coordinates, new Date(), params);

      const prayerList = buildPrayerList(prayer);

      setPrayers(prayerList);
      findNextPrayer(prayerList);

      await updateLocationName(latitude, longitude);

      // Separately, (re)schedule the full week of notifications.
      await scheduleUpcomingPrayerNotifications(latitude, longitude);
    } catch (error) {
      console.log("Prayer Error:", error);
    }
  };

  const getWebCurrentPosition = () => {
    return new Promise<UserCoordinates>((resolve, reject) => {
      const navigatorObject = (globalThis as any).navigator;

      if (!navigatorObject?.geolocation) {
        reject(new Error("Geolocation is not supported in this browser."));
        return;
      }

      navigatorObject.geolocation.getCurrentPosition(
        (position: any) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        reject,
        {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 60000,
        },
      );
    });
  };

  useEffect(() => {
    let nativeSubscription: Location.LocationSubscription | null = null;
    let webWatchId: number | null = null;
    let active = true;

    const startNativeLocationWatcher = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") return;

      const currentLocation = await Location.getCurrentPositionAsync({});

      if (!active) return;

      await generatePrayerTimes(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude,
      );

      nativeSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 1000,
          timeInterval: 60000,
        },
        async (newLocation) => {
          await generatePrayerTimes(
            newLocation.coords.latitude,
            newLocation.coords.longitude,
          );
        },
      );
    };

    const startWebLocationWatcher = async () => {
      try {
        const currentLocation = await getWebCurrentPosition();

        if (!active) return;

        lastWebLocation.current = currentLocation;

        await generatePrayerTimes(
          currentLocation.latitude,
          currentLocation.longitude,
        );

        const navigatorObject = (globalThis as any).navigator;

        if (!navigatorObject?.geolocation?.watchPosition) return;

        webWatchId = navigatorObject.geolocation.watchPosition(
          async (position: any) => {
            const nextLocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };

            const previousLocation = lastWebLocation.current;

            if (
              previousLocation &&
              getDistanceInMeters(previousLocation, nextLocation) < 1000
            ) {
              return;
            }

            lastWebLocation.current = nextLocation;

            await generatePrayerTimes(
              nextLocation.latitude,
              nextLocation.longitude,
            );
          },
          (error: any) => {
            console.log("Web Location Watch Error:", error);
          },
          {
            enableHighAccuracy: false,
            timeout: 15000,
            maximumAge: 60000,
          },
        );
      } catch (error) {
        console.log("Web Location Error:", error);
      }
    };

    if (Platform.OS === "web") {
      startWebLocationWatcher();
    } else {
      startNativeLocationWatcher();
    }

    return () => {
      active = false;

      nativeSubscription?.remove();

      if (Platform.OS === "web" && webWatchId !== null) {
        const navigatorObject = (globalThis as any).navigator;
        navigatorObject?.geolocation?.clearWatch(webWatchId);
        clearWebNotifications();
      }
    };
  }, [settings.prayerNotification, settings.adhanVoice]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>

        <Text style={styles.subtitle}>Next prayer highlighted</Text>
      </View>

      <ScrollView
        horizontal
        ref={scrollRef}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {prayers.map((prayer, index) => {
          const isNext = index === nextPrayerIndex;

          return (
            <View
              key={prayer.name}
              style={[styles.card, isNext && styles.nextPrayerCard]}
            >
              {isNext && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>NEXT</Text>
                </View>
              )}

              <Text style={[styles.prayerName, isNext && styles.nextText]}>
                {prayer.name}
              </Text>

              <Text style={[styles.prayerTime, isNext && styles.nextText]}>
                {prayer.time}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },

  header: {
    marginBottom: 15,
    paddingHorizontal: 5,
  },

  title: {
    fontSize: 18,
    fontWeight: "800",
    color: PRIMARY,
  },

  subtitle: {
    marginTop: 4,
    color: "#7C7285",
    fontSize: 12,
  },

  scrollContainer: {
    paddingRight: 20,
  },

  card: {
    width: CARD_WIDTH,
    height: 110,
    borderRadius: 22,
    backgroundColor: "white",
    marginRight: CARD_MARGIN,
    justifyContent: "center",
    alignItems: "center",
    transform: [
      {
        scale: 0.905,
      },
    ],
  },

  nextPrayerCard: {
    backgroundColor: PRIMARY,
    transform: [
      {
        scale: 0.905,
      },
    ],
    shadowColor: PRIMARY,
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 10,
  },

  badge: {
    position: "absolute",
    top: 12,
    backgroundColor: GOLD,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  badgeText: {
    color: PRIMARY,
    fontWeight: "800",
    fontSize: 10,
  },

  prayerName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#222",
  },

  prayerTime: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },

  nextText: {
    color: "white",
  },
});
