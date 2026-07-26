import { getTopicBySubId } from "@/app/utils/ruqyah";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
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

export default function RuqyahTopicScreen() {
  const router = useRouter();
  const { category, subId } = useLocalSearchParams<{
    category: string;
    subId: string;
  }>();

  const topic = getTopicBySubId(category ?? "", Number(subId), "en");

  if (!topic) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Text>Topic not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "top"]}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="white" />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={2}>
          {topic.section_title}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {topic.content.map((block, index) => {
          switch (block.type) {
            case "header":
              return (
                <Text key={index} style={styles.blockHeader}>
                  {block.content}
                </Text>
              );
            case "arabic":
              return (
                <Text key={index} style={styles.blockArabic}>
                  {block.content}
                </Text>
              );
            case "transliteration":
              return (
                <Text key={index} style={styles.blockTransliteration}>
                  {block.content}
                </Text>
              );
            case "translation":
              return (
                <Text key={index} style={styles.blockTranslation}>
                  {block.content}
                </Text>
              );
            default:
              return (
                <Text key={index} style={styles.blockText}>
                  {block.content}
                </Text>
              );
          }
        })}

        {topic.content.length === 0 && (
          <Text style={styles.blockText}>
            No content available for this topic yet.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
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
  headerTitle: { flex: 1, color: "white", fontSize: 18, fontWeight: "800" },
  content: { padding: 20, paddingBottom: 40 },
  blockHeader: {
    fontSize: 17,
    fontWeight: "800",
    color: PRIMARY,
    marginTop: 18,
    marginBottom: 8,
  },
  blockArabic: {
    fontSize: 24,
    lineHeight: 44,
    textAlign: "right",
    color: PRIMARY,
    marginBottom: 12,
    fontFamily: "AmiriQuran",
  },
  blockTransliteration: {
    fontSize: 15,
    fontStyle: "italic",
    color: "#374151",
    marginBottom: 8,
    lineHeight: 24,
  },
  blockTranslation: {
    fontSize: 15,
    color: "#111827",
    marginBottom: 12,
    lineHeight: 24,
  },
  blockText: {
    fontSize: 15,
    color: "#374151",
    marginBottom: 14,
    lineHeight: 24,
  },
});
