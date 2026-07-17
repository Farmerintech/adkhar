import { Ionicons } from "@expo/vector-icons";
import { CalculationMethod, Coordinates, Madhab, PrayerTimes } from "adhan";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const PRIMARY = "#4A154B";
const GOLD = "#D4AF37";
const LIGHT = "#F8F5FA";

type Props = {
  visible: boolean;
  onClose: () => void;
};

type PrayerRow = {
  date: string;
  day: number;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
};

export default function PrayerCalendarModal({ visible, onClose }: Props) {
  const today = new Date();

  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());

  const [loading, setLoading] = useState(true);

  const [data, setData] = useState<PrayerRow[]>([]);

  useEffect(() => {
    if (visible) {
      generatePrayerTimes();
    }
  }, [selectedMonth, selectedYear, visible]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const previousMonth = () => {
    if (selectedYear === today.getFullYear() - 10 && selectedMonth === 0)
      return;

    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const nextMonth = () => {
    if (selectedYear === today.getFullYear() + 10 && selectedMonth === 11)
      return;

    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  const generatePrayerTimes = async () => {
    try {
      setLoading(true);

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});

      const coordinates = new Coordinates(
        location.coords.latitude,
        location.coords.longitude,
      );

      const params = CalculationMethod.MuslimWorldLeague();

      params.madhab = Madhab.Shafi;

      const daysInMonth = new Date(
        selectedYear,
        selectedMonth + 1,
        0,
      ).getDate();

      const prayerRows: PrayerRow[] = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(selectedYear, selectedMonth, day);

        const prayers = new PrayerTimes(coordinates, date, params);

        prayerRows.push({
          date: date.toISOString(),
          day,
          fajr: formatTime(prayers.fajr),
          sunrise: formatTime(prayers.sunrise),
          dhuhr: formatTime(prayers.dhuhr),
          asr: formatTime(prayers.asr),
          maghrib: formatTime(prayers.maghrib),
          isha: formatTime(prayers.isha),
        });
      }

      setData(prayerRows);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const monthName = new Date(selectedYear, selectedMonth).toLocaleString(
    "default",
    {
      month: "long",
    },
  );

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.topHeader}>
            <Text style={styles.title}>Prayer Timetable</Text>

            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color={PRIMARY} />
            </TouchableOpacity>
          </View>

          {/* Month Navigation */}
          <View style={styles.navigation}>
            <TouchableOpacity style={styles.arrow} onPress={previousMonth}>
              <Ionicons name="chevron-back" size={24} color={PRIMARY} />
            </TouchableOpacity>

            <View style={{ alignItems: "center" }}>
              <Text style={styles.month}>{monthName}</Text>

              <Text style={styles.year}>{selectedYear}</Text>
            </View>

            <TouchableOpacity style={styles.arrow} onPress={nextMonth}>
              <Ionicons name="chevron-forward" size={24} color={PRIMARY} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loader}>
              <ActivityIndicator color={PRIMARY} size="large" />
            </View>
          ) : (
            <ScrollView horizontal>
              <View>
                {/* Header */}
                <View style={styles.header}>
                  <Text style={styles.headerText}>Day</Text>
                  <Text style={styles.headerText}>Fajr</Text>
                  <Text style={styles.headerText}>Sunrise</Text>
                  <Text style={styles.headerText}>Dhuhr</Text>
                  <Text style={styles.headerText}>Asr</Text>
                  <Text style={styles.headerText}>Maghrib</Text>
                  <Text style={styles.headerText}>Isha</Text>
                </View>

                <FlatList
                  data={data}
                  showsVerticalScrollIndicator={false}
                  keyExtractor={(item) => item.day.toString()}
                  renderItem={({ item }) => {
                    const isToday =
                      item.day === today.getDate() &&
                      selectedMonth === today.getMonth() &&
                      selectedYear === today.getFullYear();

                    return (
                      <View style={[styles.row, isToday && styles.todayRow]}>
                        <Text style={[styles.day, isToday && styles.todayText]}>
                          {item.day}
                        </Text>

                        <Text style={styles.time}>{item.fajr}</Text>

                        <Text style={styles.time}>{item.sunrise}</Text>

                        <Text style={styles.time}>{item.dhuhr}</Text>

                        <Text style={styles.time}>{item.asr}</Text>

                        <Text style={styles.time}>{item.maghrib}</Text>

                        <Text style={styles.time}>{item.isha}</Text>
                      </View>
                    );
                  }}
                />
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },

  modal: {
    height: "90%",
    backgroundColor: "white",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 18,
    paddingTop: 12,
  },

  handle: {
    width: 60,
    height: 6,
    borderRadius: 10,
    backgroundColor: "#DDD",
    alignSelf: "center",
    marginBottom: 15,
  },

  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: PRIMARY,
  },

  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 25,
  },

  arrow: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: LIGHT,
    justifyContent: "center",
    alignItems: "center",
  },

  month: {
    fontSize: 22,
    fontWeight: "800",
    color: PRIMARY,
  },

  year: {
    color: "#777",
    marginTop: 4,
    fontWeight: "600",
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    backgroundColor: PRIMARY,
    paddingVertical: 14,
    borderRadius: 18,
    marginBottom: 10,
  },

  headerText: {
    width: 75,
    color: "white",
    fontWeight: "700",
    textAlign: "center",
    fontSize: 12,
  },

  row: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingVertical: 15,
    marginBottom: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#F1EAF3",
    elevation: 2,
  },

  todayRow: {
    backgroundColor: "#F7EFF8",
    borderColor: GOLD,
    borderWidth: 1.5,
  },

  day: {
    width: 75,
    textAlign: "center",
    color: PRIMARY,
    fontWeight: "800",
  },

  time: {
    width: 75,
    textAlign: "center",
    color: "#666",
    fontSize: 12,
  },

  todayText: {
    color: GOLD,
  },
});
