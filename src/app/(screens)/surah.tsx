import quran from "@/app/utils/quran-complete.json";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
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

type QuranTextMode = "arabic" | "translation" | "both";

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

  const [textMode, setTextMode] = useState<QuranTextMode>("arabic");

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

        <PagerView style={{ flex: 1 }} initialPage={0} layoutDirection="rtl">
          {pages.map((page, pageIndex) => (
            <ScrollView
              key={pageIndex}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.pageContainer}
            >
              <View style={styles.page}>
                <Text style={styles.topLeft}>❁</Text>
                <Text style={styles.topRight}>❁</Text>
                <Text style={styles.bottomLeft}>❁</Text>
                <Text style={styles.bottomRight}>❁</Text>

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

                {pageIndex === 0 &&
                  Number(id) !== 9 &&
                  surah.bismillah_pre !== false && (
                    <Text style={styles.bismillah}>
                      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                    </Text>
                  )}

                <View style={styles.textModeContainer}>
                  {(["arabic", "translation", "both"] as QuranTextMode[]).map(
                    (mode) => {
                      const isActive = textMode === mode;

                      return (
                        <TouchableOpacity
                          key={mode}
                          onPress={() => setTextMode(mode)}
                          style={[
                            styles.textModeButton,
                            isActive && styles.activeTextModeButton,
                          ]}
                        >
                          <Text
                            style={[
                              styles.textModeText,
                              isActive && styles.activeTextModeText,
                            ]}
                          >
                            {mode === "arabic"
                              ? "Arabic"
                              : mode === "translation"
                                ? "Translation"
                                : "Both"}
                          </Text>
                        </TouchableOpacity>
                      );
                    },
                  )}
                </View>

                {textMode === "arabic" && (
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
                )}

                {textMode === "translation" && (
                  <View>
                    {page.map((verse: any) => (
                      <View key={verse.ayah} style={styles.translationVerse}>
                        <Text style={styles.translationOnlyText}>
                          {verse.translations.sahih_international}
                        </Text>
                        <Text style={styles.translationAyahNumber}>
                          {verse.ayah}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
                {textMode === "both" && (
                  <View>
                    {page.map((verse: any) => (
                      <View key={verse.ayah} style={styles.jointVerse}>
                        <Text style={styles.jointArabicText}>
                          {verse.arabic}{" "}
                          <Text style={styles.ayahNumber}>
                            ﴿{toArabicNumber(verse.ayah)}﴾
                          </Text>
                        </Text>

                        <Text style={styles.jointTranslationText}>
                          {verse.translations.sahih_international}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

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

  textModeContainer: {
    flexDirection: "row",
    backgroundColor: "#F8F1E6",
    borderRadius: 18,
    padding: 4,
    marginBottom: 26,
    borderWidth: 1,
    borderColor: "#EFE5D0",
  },

  textModeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  activeTextModeButton: {
    backgroundColor: PRIMARY,
  },

  textModeText: {
    color: PRIMARY,
    fontSize: 13,
    fontWeight: "800",
  },

  activeTextModeText: {
    color: "white",
  },

  quranText: {
    fontSize: 28,
    lineHeight: 82,
    textAlign: "right",
    color: "#111827",
    writingDirection: "rtl",
    fontWeight: "500",
    fontFamily: "AmiriQuran",
  },

  ayahNumber: {
    color: GOLD,
    fontSize: 22,
    fontWeight: "700",
  },

  translationVerse: {
    paddingBottom: 18,
    marginBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#F1E7D0",
    fontFamily: " NotoSansArabic",
  },

  translationOnlyText: {
    color: "#444",
    fontSize: 17,
    lineHeight: 30,
    fontWeight: "500",
    fontFamily: " NotoSansArabic",
  },

  translationAyahNumber: {
    marginTop: 8,
    color: GOLD,
    fontSize: 13,
    fontWeight: "800",
  },

  jointVerse: {
    marginBottom: 28,
  },

  jointArabicText: {
    fontSize: 28,
    lineHeight: 58,
    textAlign: "right",
    color: "#111827",
    writingDirection: "rtl",
    fontWeight: "500",
    fontFamily: "AmiriQuran",
  },

  jointTranslationText: {
    marginTop: 10,
    color: "#555",
    fontSize: 16,
    lineHeight: 28,
    fontWeight: "500",
    fontFamily: " NotoSansArabic",
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
