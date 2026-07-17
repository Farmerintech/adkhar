import { Ionicons } from "@expo/vector-icons";
import moment from "moment-hijri";
import { useState } from "react";
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const PRIMARY = "#4A154B";
const GOLD = "#D4AF37";
const LIGHT_BG = "#F8F5FA";

const WIDTH = Dimensions.get("window").width;
const CELL_SIZE = (WIDTH - 52) / 7;

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function PremiumIslamicCalendar() {
  const today = moment();

  const [currentMonth, setCurrentMonth] = useState(moment().startOf("iMonth"));

  const hijriYear = currentMonth.iYear();
  const hijriMonth = currentMonth.iMonth() + 1;

  const monthStart = currentMonth.clone().startOf("iMonth");

  const daysInMonth = monthStart.clone().endOf("iMonth").iDate();

  const firstDay = (monthStart.day() + 6) % 7;

  const canGoBack = hijriYear >= today.iYear() - 10;
  const canGoForward = hijriYear <= today.iYear() + 10;

  const goPrevious = () => {
    if (canGoBack) {
      setCurrentMonth((prev) => prev.clone().subtract(1, "iMonth"));
    }
  };

  const goNext = () => {
    if (canGoForward) {
      setCurrentMonth((prev) => prev.clone().add(1, "iMonth"));
    }
  };

  const cells = [];

  for (let i = 0; i < firstDay; i++) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = moment(`${hijriYear}/${hijriMonth}/${day}`, "iYYYY/iM/iD");

    cells.push({
      hijri: day,
      gregorian: date.format("D"),
      isToday: date.format("iYYYY-iMM-iDD") === today.format("iYYYY-iMM-iDD"),
    });
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.arrowButton} onPress={goPrevious}>
          <Ionicons name="chevron-back" size={22} color={PRIMARY} />
        </TouchableOpacity>

        <View style={styles.monthContainer}>
          <Text style={styles.month}>{currentMonth.format("iMMMM")}</Text>

          <Text style={styles.year}>{hijriYear} AH</Text>

          <Text style={styles.gregorian}>{monthStart.format("MMMM YYYY")}</Text>
        </View>

        <TouchableOpacity style={styles.arrowButton} onPress={goNext}>
          <Ionicons name="chevron-forward" size={22} color={PRIMARY} />
        </TouchableOpacity>
      </View>

      {/* Week Header */}
      <View style={styles.weekRow}>
        {weekDays.map((day) => (
          <View key={day} style={styles.weekCell}>
            <Text style={styles.weekText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.grid}>
        {cells.map((cell, index) => {
          if (!cell) {
            return <View key={`empty-${index}`} style={styles.emptyCell} />;
          }

          return (
            <View
              key={index}
              style={[styles.cell, cell.isToday && styles.todayCell]}
            >
              <Text
                style={[styles.hijriDay, cell.isToday && styles.todayHijri]}
              >
                {cell.hijri}
              </Text>

              <Text
                style={[
                  styles.gregorianDay,
                  cell.isToday && styles.todayGregorian,
                ]}
              >
                {cell.gregorian}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },

  arrowButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: LIGHT_BG,
    justifyContent: "center",
    alignItems: "center",
  },

  monthContainer: {
    alignItems: "center",
    flex: 1,
  },

  month: {
    fontSize: 24,
    fontWeight: "800",
    color: PRIMARY,
  },

  year: {
    fontSize: 16,
    fontWeight: "700",
    color: PRIMARY,
    marginTop: 2,
  },

  gregorian: {
    marginTop: 4,
    fontSize: 12,
    color: "#8E8E93",
  },

  weekRow: {
    flexDirection: "row",
    marginBottom: 12,
  },

  weekCell: {
    width: CELL_SIZE,
    alignItems: "center",
  },

  weekText: {
    color: "#7C7285",
    fontSize: 12,
    fontWeight: "700",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  emptyCell: {
    width: CELL_SIZE,
    height: 54,
  },

  cell: {
    width: CELL_SIZE,
    height: 54,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: LIGHT_BG,
    marginBottom: 8,
  },

  todayCell: {
    backgroundColor: PRIMARY,
    shadowColor: PRIMARY,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },

  hijriDay: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
  },

  gregorianDay: {
    marginTop: 2,
    fontSize: 10,
    color: "#7C7285",
  },

  todayHijri: {
    color: "#fff",
  },

  todayGregorian: {
    color: "#E9D5FF",
  },
});
