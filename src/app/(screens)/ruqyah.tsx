import { CATEGORY_LABELS, getTopicsForCategory } from "@/app/utils/ruqyah";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PRIMARY = "#4A154B";
const LIGHT_BG = "#F8F5FA";

export default function RuqyahCategoryScreen() {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category: string }>();

  const topics = getTopicsForCategory(category ?? "", "en");
  const title = CATEGORY_LABELS[category ?? ""] ?? "Ruqyah";

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "top"]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={22} color="white" />
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{title}</Text>

          <Text style={styles.headerSubtitle}>{topics.length} articles</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <FlatList
          data={topics}
          keyExtractor={(item) => String(item.sub_id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.card}
              onPress={() =>
                router.push(
                  `/(screens)/ruqyahTopic?category=${
                    category ?? ""
                  }&subId=${String(item.sub_id)}`,
                )
              }
            >
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {item.title}
                </Text>

                <Text style={styles.cardSubtitle} numberOfLines={1}>
                  {item.section_title}
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /**
   * SafeAreaView uses the same color as the tab bar.
   */
  container: {
    flex: 1,
    backgroundColor: PRIMARY,
  },

  /**
   * Top header also uses the primary/tab bar color.
   */
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

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "800",
  },

  headerSubtitle: {
    color: "#E5D6E5",
    marginTop: 4,
    fontSize: 13,
  },

  /**
   * Main page area uses the light background.
   */
  content: {
    flex: 1,
    backgroundColor: LIGHT_BG,
  },

  list: {
    padding: 20,
    paddingBottom: 30,
  },

  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EFE3C8",
  },

  cardContent: {
    flex: 1,
    paddingRight: 12,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },

  cardSubtitle: {
    marginTop: 4,
    color: "#6B7280",
    fontSize: 13,
  },
});
