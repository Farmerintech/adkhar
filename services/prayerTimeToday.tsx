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
      hour12: false,
    });
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

      const today = new Date();

      const prayer = new PrayerTimes(coordinates, today, params);

      const prayerList: Prayer[] = [
        {
          name: "Subh",
          time: formatTime(prayer.fajr),
        },
        {
          name: "Sunrise",
          time: formatTime(prayer.sunrise),
        },
        {
          name: "Zuhr",
          time: formatTime(prayer.dhuhr),
        },
        {
          name: "Asr",
          time: formatTime(prayer.asr),
        },
        {
          name: "Maghrib",
          time: formatTime(prayer.maghrib),
        },
        {
          name: "Isha",
          time: formatTime(prayer.isha),
        },
      ];

      setPrayers(prayerList);

      await schedulePrayerNotifications(prayer);

      findNextPrayer(prayerList);
    } catch (error) {
      console.log(error);
    }
  };

  const findNextPrayer = (prayerList: Prayer[]) => {
    const now = new Date();

    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    let nextIndex = prayerList.findIndex((prayer) => {
      const [hour, minute] = prayer.time.split(":").map(Number);

      const prayerMinutes = hour * 60 + minute;

      return prayerMinutes > currentMinutes;
    });

    if (nextIndex === -1) {
      nextIndex = 0;
    }

    setNextPrayerIndex(nextIndex);

    setTimeout(() => {
      scrollRef.current?.scrollTo({
        x: nextIndex * (CARD_WIDTH + CARD_MARGIN),
        animated: true,
      });
    }, 300);
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

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🕌 ${item.name} Prayer`,
          body: `It is time for ${item.name} prayer.`,
          sound: soundMap[settings.adhanVoice],
        },
        trigger: item.date as any,
      });
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
