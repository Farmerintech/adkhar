import { useSettings } from "@/app/context/settingsContext";

import { CalculationMethod, Coordinates, Madhab, PrayerTimes } from "adhan";

import * as Location from "expo-location";
import * as Notifications from "expo-notifications";

import { useEffect, useRef, useState } from "react";

import { ScrollView, StyleSheet, Text, View } from "react-native";

const PRIMARY = "#4A154B";
const GOLD = "#D4AF37";

const CARD_WIDTH = 105;
const CARD_MARGIN = 12;

type Prayer = {
  name: string;
  time: string;
  date: Date;
};

export default function PrayerTimesToday() {
  const scrollRef = useRef<ScrollView>(null);

  const { settings } = useSettings();

  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [nextPrayerIndex, setNextPrayerIndex] = useState(0);
  const [locationName, setLocationName] = useState("");

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

  const updateLocationName = async (latitude: number, longitude: number) => {
    try {
      const places = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      const place = places[0];

      if (!place) return;

      const name =
        place.city || place.subregion || place.region || place.country || "";

      setLocationName(name);
    } catch (error) {
      console.log("Location Name Error:", error);
      setLocationName("");
    }
  };

  const schedulePrayerNotifications = async (prayer: PrayerTimes) => {
    if (!settings.prayerNotification) return;

    const soundMap = {
      alafasy: "adhan11.wav",
      sudais: "adhan22.wav",
      muaiqly: "adhan33.wav",
    };

    await Notifications.cancelAllScheduledNotificationsAsync();

    const notificationPrayers = [
      { name: "Fajr", date: prayer.fajr },
      { name: "Dhuhr", date: prayer.dhuhr },
      { name: "Asr", date: prayer.asr },
      { name: "Maghrib", date: prayer.maghrib },
      { name: "Isha", date: prayer.isha },
    ];

    for (const item of notificationPrayers) {
      if (item.date <= new Date()) continue;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🕌 ${item.name} Prayer`,
          body: `It is time for ${item.name} prayer.`,
          sound: soundMap[settings.adhanVoice] as any,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: item.date,
        },
      });
    }
  };

  const generatePrayerTimes = async (latitude: number, longitude: number) => {
    try {
      const coordinates = new Coordinates(latitude, longitude);

      const params = CalculationMethod.MuslimWorldLeague();
      params.madhab = Madhab.Shafi;

      const prayer = new PrayerTimes(coordinates, new Date(), params);

      const prayerList = buildPrayerList(prayer);

      setPrayers(prayerList);
      findNextPrayer(prayerList);

      await updateLocationName(latitude, longitude);
      await schedulePrayerNotifications(prayer);
    } catch (error) {
      console.log("Prayer Error:", error);
    }
  };

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    const startLocationWatcher = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") return;

      const currentLocation = await Location.getCurrentPositionAsync({});
      await generatePrayerTimes(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude,
      );

      subscription = await Location.watchPositionAsync(
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

    startLocationWatcher();

    return () => {
      subscription?.remove();
    };
  }, [settings.prayerNotification, settings.adhanVoice]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{locationName} Prayer Times Today</Text>

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
