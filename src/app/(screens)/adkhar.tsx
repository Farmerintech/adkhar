import * as data from "@/app/utils/duas.json";
import * as morningEvening from "@/app/utils/morningEveningAdkhar.json";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
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

  let duasData: any = data.data.duas;
  if (category === "morning") {
    duasData = morningEvening.morning;
  }
  if (category === "evening") {
    duasData = morningEvening.evening;
  }
  const realData = useMemo(
    () => duasData.filter((item: any) => item.category === category),
    [category],
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [count, setCount] = useState(0);

  const currentDua = realData[currentIndex];

  // reset counter when changing adhkar
  useEffect(() => {
    setCount(0);
  }, [currentIndex]);

  const repeat = Number(currentDua?.repeat || 0);
  const showCounter = repeat >= 50;

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
    <SafeAreaView
      style={styles.container}
      edges={["left", "right", "top", "bottom"]}
    >
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />
      <View style={{ backgroundColor: BG, flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={22} color="white" />
          </TouchableOpacity>

          <View>
            <Text style={styles.headerTitle}>{title} Adhkar</Text>
            <Text style={styles.headerSubtitle}>
              {currentIndex + 1} of {realData.length}
            </Text>
          </View>
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.card}>
            <Text style={styles.repeat}>Repeat {repeat} times</Text>

            <Text style={styles.arabic}>{currentDua.arabic}</Text>

            <Text style={styles.transliteration}>
              {currentDua.transliteration}
            </Text>

            <Text style={styles.translation}>{currentDua.translation}</Text>

            {/* Tasbih Counter */}
            {showCounter && (
              <View style={styles.tasbihContainer}>
                <Text style={styles.tasbihLabel}>Tasbih Counter</Text>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                    styles.tasbihButton,
                    count >= repeat && styles.tasbihDone,
                  ]}
                  onPress={() => {
                    if (count < repeat) setCount((c) => c + 1);
                  }}
                >
                  <Text style={styles.tasbihCount}>{count}</Text>
                  <Text style={styles.tasbihTarget}>/ {repeat}</Text>
                </TouchableOpacity>

                {count >= repeat && (
                  <Text style={styles.completedText}>Completed ✓</Text>
                )}

                <TouchableOpacity
                  style={styles.resetBtn}
                  onPress={() => setCount(0)}
                >
                  <Text style={styles.resetText}>Reset Counter</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Fixed Bottom Controls */}
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PRIMARY,
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

  scroll: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingBottom: 30,
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
    fontFamily: "NotoSansArabic",
    marginBottom: 24,
  },

  arabic: {
    color: PRIMARY,
    fontSize: 32,
    lineHeight: 80,
    textAlign: "right",
    // fontWeight: "800",
    fontFamily: "AmiriQuran",
  },

  transliteration: {
    marginTop: 28,
    fontSize: 18,
    lineHeight: 32,
    textAlign: "center",
    fontStyle: "italic",
    color: "#374151",
    fontFamily: "NotoSansArabic",
  },

  translation: {
    marginTop: 24,
    fontSize: 18,
    lineHeight: 32,
    textAlign: "center",
    color: "#111827",
    fontFamily: "NotoSansArabic",
  },

  tasbihContainer: {
    marginTop: 30,
    alignItems: "center",
  },

  tasbihLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: PRIMARY,
    marginBottom: 14,
  },

  tasbihButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: PRIMARY,
    justifyContent: "center",
    alignItems: "center",
  },

  tasbihDone: {
    backgroundColor: "#15803D",
  },

  tasbihCount: {
    color: "white",
    fontSize: 38,
    fontWeight: "800",
  },

  tasbihTarget: {
    color: "#E5D6E5",
    fontSize: 16,
    fontWeight: "700",
  },

  completedText: {
    marginTop: 14,
    color: "#15803D",
    fontWeight: "800",
    fontSize: 16,
  },

  resetBtn: {
    marginTop: 16,
    backgroundColor: "#F3ECF5",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },

  resetText: {
    color: PRIMARY,
    fontWeight: "700",
  },

  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: BG,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
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
