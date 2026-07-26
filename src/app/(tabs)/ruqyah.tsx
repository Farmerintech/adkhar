import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    CATEGORY_LABELS,
    getCategoryKeys,
    getTopicsForCategory,
} from "../utils/ruqyah";

const PRIMARY = "#4A154B";
const BG = "#F8F5FA";

export default function Ruqyah() {
  const router = useRouter();
  const categoryKeys = getCategoryKeys("en");

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "top"]}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="white" />
        </TouchableOpacity>

        <View>
          <Text style={styles.headerTitle}>Ruqyah Shariah</Text>
          <Text style={styles.headerSubtitle}>Choose a topic to explore</Text>
        </View>
      </View>

      <FlatList
        data={categoryKeys}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const topicCount = getTopicsForCategory(item, "en").length;

          return (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.card}
              onPress={() => router.push(`/(screens)/ruqyah?category=${item}`)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>
                  {CATEGORY_LABELS[item] ?? item}
                </Text>
                <Text style={styles.cardSubtitle}>{topicCount} articles</Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
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
  headerTitle: { color: "white", fontSize: 22, fontWeight: "800" },
  headerSubtitle: { color: "#E5D6E5", marginTop: 4 },
  list: { padding: 20 },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EFE3C8",
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  cardSubtitle: { marginTop: 4, color: "#6B7280", fontSize: 13 },
});
