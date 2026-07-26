import quran from "@/app/utils/quran-complete.json";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PRIMARY = "#4A154B";
const BACKGROUND = "#F8F5FA";

export default function QuranScreen() {
  const router = useRouter();

  const [search, setSearch] = useState("");

  const surahs = (quran as any[]).map((item: any) => item.data.surah);

  const filteredSurahs = surahs.filter(
    (surah: any) =>
      surah.name_english.toLowerCase().includes(search.toLowerCase()) ||
      surah.name_translation.toLowerCase().includes(search.toLowerCase()) ||
      surah.name_arabic.includes(search),
  );

  const openSurah = (number: number) => {
    router.push(`/(screens)/surah?id=${number}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "top"]}>
      {/* Header */}
      <StatusBar barStyle={"light-content"} backgroundColor={PRIMARY} />
      <View style={{ backgroundColor: BACKGROUND }}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={22} color="white" />
          </TouchableOpacity>

          <View>
            <Text style={styles.headerTitle}>Holy Quran</Text>

            <Text style={styles.headerSubtitle}>114 Surahs</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#8B8B8B" />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search Surah..."
            placeholderTextColor="#999"
            style={styles.searchInput}
          />
        </View>

        {/* Surahs */}
        <FlatList
          data={filteredSurahs}
          keyExtractor={(item: any) => item.number.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 80,
          }}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.card}
              onPress={() => openSurah(item.number)}
            >
              {/* Number */}
              <View style={styles.numberBadge}>
                <Text style={styles.numberText}>{item.number}</Text>
              </View>

              {/* Names */}
              <View style={styles.info}>
                <Text style={styles.englishName}>{item.name_english}</Text>

                <Text style={styles.translation}>{item.name_translation}</Text>

                <View style={styles.metaRow}>
                  <Ionicons name="bookmark-outline" size={12} color="#7B7284" />

                  <Text style={styles.metaText}>
                    {item.revelation_place} • {item.total_verses} verses
                  </Text>
                </View>
              </View>

              {/* Arabic */}
              <View style={styles.rightSection}>
                <Text style={styles.arabicName}>{item.name_arabic}</Text>

                <Ionicons name="chevron-forward" size={20} color={PRIMARY} />
              </View>
            </TouchableOpacity>
          )}
        />
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
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  headerTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "800",
  },

  headerSubtitle: {
    color: "#DCC7DD",
    marginTop: 4,
  },

  searchContainer: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginTop: -18,
    borderRadius: 18,
    paddingHorizontal: 18,
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 20,
  },

  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },

  card: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 18,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },

  numberBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F3ECF5",
    justifyContent: "center",
    alignItems: "center",
  },

  numberText: {
    color: PRIMARY,
    fontWeight: "800",
    fontSize: 16,
  },

  info: {
    flex: 1,
    marginLeft: 15,
  },

  englishName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    fontFamily: " NotoSansArabic",
  },

  translation: {
    marginTop: 3,
    color: "#7B7284",
    fontSize: 14,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 5,
  },

  metaText: {
    color: "#7B7284",
    fontSize: 12,
  },

  rightSection: {
    alignItems: "center",
    justifyContent: "space-between",
    height: 55,
    flexDirection: "row",
  },

  arabicName: {
    fontSize: 24,
    color: PRIMARY,
    // fontWeight: "700",
    fontFamily: "AmiriQuran",
  },
});
