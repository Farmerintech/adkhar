import * as data from "@/app/utils/duas.json";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PRIMARY = "#4A154B";
const BG = "#F8F5FA";

export default function Adkhar() {
  const router = useRouter();

  const { category } = useLocalSearchParams();

  const duasData = data.data.duas;

  const realData = useMemo(
    () => duasData.filter((item: any) => item.category === category),
    [category],
  );

  const [currentIndex, setCurrentIndex] = useState(0);

  const currentDua = realData[currentIndex];

  const title =
    typeof category === "string"
      ? category.charAt(0).toUpperCase() + category.slice(1)
      : "Adhkar";

  if (!currentDua) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Text>No adhkar found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <StatusBar barStyle={"light-content"} backgroundColor={PRIMARY} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="white" />
        </TouchableOpacity>

        <View>
          <Text style={styles.headerTitle}>{title} Adhkar</Text>

          <Text style={styles.headerSubtitle}>
            {currentIndex + 1} of {realData.length}
          </Text>
        </View>
      </View>

      {/* Dua Card */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.card}>
          <Text style={styles.repeat}>Repeat {currentDua.repeat} times</Text>

          <Text style={styles.arabic}>{currentDua.arabic}</Text>

          <Text style={styles.transliteration}>
            {currentDua.transliteration}
          </Text>

          <Text style={styles.translation}>{currentDua.translation}</Text>
        </View>
      </ScrollView>

      {/* Bottom Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          disabled={currentIndex === 0}
          style={[
            styles.navButton,
            currentIndex === 0 && styles.disabledButton,
          ]}
          onPress={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
        >
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>

        <View style={styles.counter}>
          <Text style={styles.counterText}>{currentIndex + 1}</Text>
        </View>

        <TouchableOpacity
          disabled={currentIndex === realData.length - 1}
          style={[
            styles.navButton,
            currentIndex === realData.length - 1 && styles.disabledButton,
          ]}
          onPress={() =>
            setCurrentIndex((prev) => Math.min(prev + 1, realData.length - 1))
          }
        >
          <Ionicons name="arrow-forward" size={22} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },

  header: {
    backgroundColor: PRIMARY,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  headerTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "800",
  },

  headerSubtitle: {
    color: "#E5D6E5",
    marginTop: 4,
  },

  content: {
    padding: 20,
    flexGrow: 1,
  },

  card: {
    backgroundColor: "white",
    borderRadius: 28,
    padding: 25,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },

  repeat: {
    alignSelf: "center",
    backgroundColor: "#F3ECF5",
    color: PRIMARY,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 30,
    fontWeight: "700",
    marginBottom: 24,
  },

  arabic: {
    color: PRIMARY,
    fontSize: 32,
    lineHeight: 60,
    textAlign: "right",
    fontWeight: "800",
  },

  transliteration: {
    marginTop: 28,
    fontSize: 18,
    lineHeight: 32,
    textAlign: "center",
    fontStyle: "italic",
    color: "#374151",
  },

  translation: {
    marginTop: 24,
    fontSize: 18,
    lineHeight: 32,
    textAlign: "center",
    color: "#111827",
  },

  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    alignItems: "center",
  },

  navButton: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: PRIMARY,
    justifyContent: "center",
    alignItems: "center",
  },

  disabledButton: {
    opacity: 0.4,
  },

  counter: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#F3ECF5",
    justifyContent: "center",
    alignItems: "center",
  },

  counterText: {
    fontSize: 24,
    fontWeight: "800",
    color: PRIMARY,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
