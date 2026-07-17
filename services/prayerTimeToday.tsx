import { useSettings } from "@/app/context/settingsContext";
// import adhan1 from "@/assets/audio/adhan1.mp3";
// import adhan2 from "@/assets/audio/adhan2.mp3";
// import adhan3 from "@/assets/audio/adhan3.mp3";

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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const buildPrayerList = (prayer: PrayerTimes): Prayer[] => [
    {
      name: "Subh",
      time: formatTime(prayer.fajr),
      date: prayer.fajr,
    },
    {
      name: "Sunrise",
      time: formatTime(prayer.sunrise),
      date: prayer.sunrise,
    },
    {
      name: "Zuhr",
      time: formatTime(prayer.dhuhr),
      date: prayer.dhuhr,
    },
    {
      name: "Asr",
      time: formatTime(prayer.asr),
      date: prayer.asr,
    },
    {
      name: "Maghrib",
      time: formatTime(prayer.maghrib),
      date: prayer.maghrib,
    },
    {
      name: "Isha",
      time: formatTime(prayer.isha),
      date: prayer.isha,
    },
  ];

  const findNextPrayer = (prayerList: Prayer[]) => {
    const now = new Date();

    const validPrayers = prayerList.filter(
      (prayer) => prayer.name !== "Sunrise",
    );

    let nextPrayer = validPrayers.find(
      (prayer) => prayer.date.getTime() > now.getTime(),
    );

    // all today's prayers have passed
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

    console.log("Current:", now.toString());

    console.log("Next Prayer:", nextPrayer?.name, nextPrayer?.date.toString());
  };

  const schedulePrayerNotifications = async (prayer: PrayerTimes) => {
    if (!settings.prayerNotification) return;

    const soundMap = {
      alafasy: "adhan1.mp3",
      sudais: "adhan2.mp3",
      muaiqly: "adhan3.mp3",
    };

    await Notifications.cancelAllScheduledNotificationsAsync();

    const notificationPrayers = [
      // ✅ Test notification (fires in 1 minute)
      // {
      //   name: "TEST",
      //   date: new Date(Date.now() + 60 * 1000),
      // },

      // Actual prayer notifications
      {
        name: "Fajr",
        date: prayer.fajr,
      },
      {
        name: "Dhuhr",
        date: prayer.dhuhr,
      },
      {
        name: "Asr",
        date: prayer.asr,
      },
      {
        name: "Maghrib",
        date: prayer.maghrib,
      },
      {
        name: "Isha",
        date: prayer.isha,
      },
    ];

    for (const item of notificationPrayers) {
      if (item.date <= new Date()) continue;

      console.log(
        `Scheduling ${item.name} at ${item.date.toLocaleTimeString()}`,
      );

      await Notifications.scheduleNotificationAsync({
        content: {
          title:
            item.name === "TEST"
              ? "🧪 Test Notification"
              : `🕌 ${item.name} Prayer`,
          body:
            item.name === "TEST"
              ? "If you can hear the adhan, notifications are working!"
              : `It is time for ${item.name} prayer.`,
          sound: soundMap[settings.adhanVoice] as any,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: item.date,
        },
      });
    }
  };
  const generatePrayerTimes = async () => {
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

      const prayer = new PrayerTimes(coordinates, new Date(), params);

      const prayerList = buildPrayerList(prayer);

      setPrayers(prayerList);

      findNextPrayer(prayerList);

      await schedulePrayerNotifications(prayer);
    } catch (error) {
      console.log("Prayer Error:", error);
    }
  };

  useEffect(() => {
    generatePrayerTimes();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Prayer Times</Text>

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
  },

  nextPrayerCard: {
    backgroundColor: PRIMARY,
    transform: [
      {
        scale: 1.05,
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
