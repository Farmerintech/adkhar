import { Ionicons } from "@expo/vector-icons";
import moment from "moment-hijri";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const PRIMARY = "#4A154B";

type Props = {
  handleVisible: () => void;
};

export default function TodayDateCard({ handleVisible }: Props) {
  const gregorian = moment().format("dddd, D MMMM YYYY");
  const hijri = moment().format("iD iMMMM iYYYY [AH]");

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Ionicons name="calendar-outline" size={22} color="white" />

        <View style={styles.textContainer}>
          <View style={styles.hijriRow}>
            <Text style={styles.hijri}>{hijri}</Text>

            <TouchableOpacity
              onPress={handleVisible}
              style={styles.expandButton}
            >
              <Ionicons name="chevron-down" size={18} color="white" />
            </TouchableOpacity>
          </View>

          <Text style={styles.gregorian}>{gregorian}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  textContainer: {
    marginLeft: 12,
  },

  hijriRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  hijri: {
    color: "white",
    fontSize: 22,
    fontWeight: "800",
  },

  gregorian: {
    fontSize: 13,
    color: "#E9DDF0",
    marginTop: 4,
  },

  expandButton: {
    marginLeft: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
});
