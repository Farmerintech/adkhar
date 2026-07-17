import quran from "@/app/utils/quran-complete.json";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import {
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PagerView from "react-native-pager-view";
import { SafeAreaView } from "react-native-safe-area-context";

const PRIMARY = "#4A154B";
const GOLD = "#D4AF37";
const PAPER = "#FFFDF7";
const DECORATION = "#EADDC3";

const WIDTH = Dimensions.get("window").width;

const toArabicNumber = (num?: number | string) => {
  const arabic = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

  if (num === undefined || num === null) {
    return "";
  }

  return String(num)
    .split("")
    .map((d) => arabic[Number(d)] ?? d)
    .join("");
};

export default function SurahReader() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const quranData = Object.values(quran) as any[];

  const surahData = quranData.find(
    (item) => item?.data?.surah?.number === Number(id),
  );

  if (!surahData) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Surah not found</Text>
      </SafeAreaView>
    );
  }

  const surah = surahData.data.surah;
  const verses = surahData.data.verses;

  // Split into mushaf-like pages
  const pages = useMemo(() => {
    const MAX_CHARS = 950;

    const result = [];
    let currentPage: any = [];
    let currentLength = 0;

    verses.forEach((verse: any) => {
      const verseLength = verse.arabic.length;

      if (currentLength + verseLength > MAX_CHARS && currentPage.length > 0) {
        result.push(currentPage);
        currentPage = [];
        currentLength = 0;
      }

      currentPage.push(verse);
      currentLength += verseLength;
    });

    if (currentPage.length > 0) {
      result.push(currentPage);
    }

    return result;
  }, [verses]);

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "top"]}>
      <View style={{ backgroundColor: PAPER, flex: 1, paddingBottom: 50 }}>
        <StatusBar barStyle={"light-content"} backgroundColor={PRIMARY} />

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text style={styles.surahTitle}>{surah.name_english}</Text>
            <Text style={styles.surahSubtitle}>{surah.name_translation}</Text>
          </View>

          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="bookmark-outline" size={22} color="white" />
          </TouchableOpacity>
        </View>

        {/* PAGES */}
        <PagerView style={{ flex: 1 }} initialPage={0} layoutDirection="rtl">
          {pages.map((page, pageIndex) => (
            <ScrollView
              key={pageIndex}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.pageContainer}
            >
              <View style={styles.page}>
                {/* Decorative Corners */}
                <Text style={styles.topLeft}>❁</Text>
                <Text style={styles.topRight}>❁</Text>
                <Text style={styles.bottomLeft}>❁</Text>
                <Text style={styles.bottomRight}>❁</Text>

                {/* Surah Card */}
                {pageIndex === 0 && (
                  <View style={styles.surahCard}>
                    <Text style={styles.arabicTitle}>{surah.name_arabic}</Text>

                    <Text style={styles.translation}>
                      {surah.name_translation}
                    </Text>

                    <Text style={styles.meta}>
                      {surah.revelation_place.toUpperCase()} •{" "}
                      {surah.verses_count} Ayat
                    </Text>
                  </View>
                )}

                {/* Bismillah */}
                {pageIndex === 0 &&
                  Number(id) !== 9 &&
                  surah.bismillah_pre !== false && (
                    <Text style={styles.bismillah}>
                      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                    </Text>
                  )}

                {/* Quran Text */}
                <Text style={styles.quranText}>
                  {page.map((verse: any) => (
                    <Text key={verse.ayah}>
                      {verse.arabic}{" "}
                      <Text style={styles.ayahNumber}>
                        ﴿{toArabicNumber(verse.ayah)}﴾
                      </Text>{" "}
                    </Text>
                  ))}
                </Text>

                {/* Footer */}
                <View style={styles.footer}>
                  <View style={styles.line} />

                  <Text style={styles.pageNumber}>
                    ﴿{toArabicNumber(pageIndex + 1)}﴾
                  </Text>

                  <View style={styles.line} />
                </View>
              </View>
            </ScrollView>
          ))}
        </PagerView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PRIMARY,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    color: PRIMARY,
    fontSize: 18,
    fontWeight: "700",
  },

  header: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
  },

  headerButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },

  surahTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },

  surahSubtitle: {
    color: "#EBDCF4",
    marginTop: 3,
    textAlign: "center",
    fontSize: 13,
  },

  pageContainer: {
    padding: 18,
  },

  page: {
    backgroundColor: PAPER,
    borderRadius: 32,
    paddingHorizontal: 24,
    paddingVertical: 30,
    minHeight: 720,
    borderWidth: 1,
    borderColor: "#EFE5D0",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },

  surahCard: {
    alignItems: "center",
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F1E7D0",
  },

  arabicTitle: {
    fontSize: 38,
    color: PRIMARY,
    fontWeight: "700",
  },

  translation: {
    marginTop: 8,
    color: "#666",
    fontSize: 14,
  },

  meta: {
    marginTop: 8,
    color: "#999",
    fontSize: 12,
    letterSpacing: 1,
  },

  bismillah: {
    textAlign: "center",
    fontSize: 34,
    color: PRIMARY,
    marginBottom: 35,
    lineHeight: 70,
    fontWeight: "700",
  },

  quranText: {
    fontSize: 28,
    lineHeight: 82,
    textAlign: "right",
    color: "#111827",
    writingDirection: "rtl",
    fontWeight: "500",
    fontFamily: "san serif",
  },

  ayahNumber: {
    color: GOLD,
    fontSize: 22,
    fontWeight: "700",
  },

  footer: {
    marginTop: 40,
    flexDirection: "row",
    alignItems: "center",
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: DECORATION,
  },

  pageNumber: {
    marginHorizontal: 14,
    color: PRIMARY,
    fontWeight: "700",
    fontSize: 16,
  },

  topLeft: {
    position: "absolute",
    top: 20,
    left: 20,
    color: DECORATION,
    fontSize: 26,
  },

  topRight: {
    position: "absolute",
    top: 20,
    right: 20,
    color: DECORATION,
    fontSize: 26,
  },

  bottomLeft: {
    position: "absolute",
    bottom: 20,
    left: 20,
    color: DECORATION,
    fontSize: 26,
  },

  bottomRight: {
    position: "absolute",
    bottom: 20,
    right: 20,
    color: DECORATION,
    fontSize: 26,
  },
});
