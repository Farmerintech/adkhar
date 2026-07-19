import asma from "@/app/utils/asmaullah.json";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import {
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const PRIMARY = "#4A154B";
const GOLD = "#D4AF37";
const PAPER = "#FFFDF8";

const WIDTH = Dimensions.get("window").width;

const toArabicNumber = (num: number | string) => {
  const arabic = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

  return String(num)
    .split("")
    .map((d) => arabic[Number(d)] ?? d)
    .join("");
};

export default function AsmaulHusnaSection() {
  const names = useMemo(() => asma?.data?.names || [], []);

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      {/* Number Badge */}
      <View style={styles.numberBadge}>
        <Text style={styles.number}>{toArabicNumber(item.number)}</Text>
      </View>

      {/* Decorative Top */}
      <View style={styles.topDecoration}>
        <Ionicons name="sparkles-outline" size={16} color={GOLD} />
      </View>

      {/* Arabic Name */}
      <Text style={styles.arabic}>{item.arabic}</Text>

      {/* Transliteration */}
      <Text style={styles.transliteration}>{item.transliteration}</Text>

      {/* English */}
      <Text style={styles.english}>{item.english}</Text>

      {/* Meaning */}
      <Text numberOfLines={4} style={styles.meaning}>
        {item.meaning}
      </Text>

      {/* Footer */}
      <TouchableOpacity style={styles.learnBtn}>
        <Ionicons name="book-outline" size={18} color="white" />

        <Text style={styles.learnText}>Reflect</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Asma-ul Husna</Text>

          <Text style={styles.subtitle}>The 99 Beautiful Names of Allah</Text>
        </View>

        <View style={styles.countBadge}>
          <Text style={styles.countText}>99</Text>
        </View>
      </View>

      <FlatList
        data={names}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={WIDTH - 65}
        decelerationRate="fast"
        keyExtractor={(item) => item.number.toString()}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
    paddingHorizontal: 4,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: PRIMARY,
  },

  subtitle: {
    marginTop: 4,
    color: "#6B7280",
  },

  countBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: PRIMARY,
    justifyContent: "center",
    alignItems: "center",
  },

  countText: {
    color: "white",
    fontWeight: "800",
    fontSize: 18,
  },

  card: {
    width: WIDTH - 80,
    backgroundColor: PAPER,
    borderRadius: 30,
    padding: 24,
    marginRight: 16,
    borderWidth: 1,
    borderColor: "#EFE3C8",
    // elevation: 5,
    // shadowColor: "#000",
    // shadowOpacity: 0.08,
    // shadowRadius: 10,
    minHeight: 340,
  },

  topDecoration: {
    alignItems: "center",
    marginBottom: 10,
  },

  numberBadge: {
    position: "absolute",
    top: 18,
    right: 18,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PRIMARY,
    justifyContent: "center",
    alignItems: "center",
  },

  number: {
    color: "white",
    fontWeight: "800",
    fontSize: 16,
  },

  arabic: {
    fontSize: 42,
    textAlign: "center",
    color: PRIMARY,
    marginTop: 25,
    writingDirection: "rtl",
  },

  transliteration: {
    textAlign: "center",
    marginTop: 14,
    fontSize: 18,
    color: GOLD,
    fontWeight: "700",
  },

  english: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 24,
    color: "#111827",
    fontWeight: "700",
  },

  meaning: {
    marginTop: 18,
    textAlign: "center",
    lineHeight: 28,
    color: "#6B7280",
    fontSize: 15,
  },

  learnBtn: {
    marginTop: "auto",
    alignSelf: "center",
    backgroundColor: PRIMARY,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
  },

  learnText: {
    color: "white",
    fontWeight: "700",
  },
});
