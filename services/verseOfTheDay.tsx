import quran from "@/app/utils/quran-complete.json";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const PRIMARY = "#4A154B";
const GOLD = "#D4AF37";
const PAPER = "#FFFDF8";

const CARD_WIDTH = Dimensions.get("window").width - 76;

const toArabicNumber = (num?: number | string) => {
  const arabic = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

  if (num === undefined || num === null) return "";

  return String(num)
    .split("")
    .map((n) => arabic[Number(n)] ?? n)
    .join("");
};

export default function VerseOfTheDay() {
  const [verse, setVerse] = useState<any>(null);
  const scrollRef = useRef<ScrollView>(null);

  const getRandomVerse = () => {
    const surahs = Object.values(quran) as any[];

    const randomSurah = surahs[Math.floor(Math.random() * surahs.length)];

    const verses = randomSurah?.data?.verses ?? [];

    const randomVerse = verses[Math.floor(Math.random() * verses.length)];

    return {
      arabic: randomVerse?.arabic ?? "",
      translation:
        randomVerse?.translations?.sahih_international ??
        randomVerse?.translations?.yusuf_ali ??
        "",
      ayahNumber: randomVerse?.ayah ?? "",
      surahNumber: randomSurah?.data?.surah?.number ?? "",
      surahArabic: randomSurah?.data?.surah?.name_arabic ?? "",
      surahEnglish: randomSurah?.data?.surah?.name_english ?? "",
    };
  };

  const loadVerse = async () => {
    try {
      const savedVerse = await SecureStore.getItemAsync("daily_quran_verse");

      const savedDate = await SecureStore.getItemAsync(
        "daily_quran_verse_date",
      );

      const today = new Date().toISOString().split("T")[0];

      if (savedVerse && savedDate === today) {
        setVerse(JSON.parse(savedVerse));
        return;
      }

      const newVerse = getRandomVerse();

      await SecureStore.setItemAsync(
        "daily_quran_verse",
        JSON.stringify(newVerse),
      );

      await SecureStore.setItemAsync("daily_quran_verse_date", today);

      setVerse(newVerse);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadVerse();
  }, []);

  const handleShare = async () => {
    if (!verse) return;

    const shareText = `
${verse.arabic}

﴿ ${toArabicNumber(verse.ayahNumber)} ﴾

${verse.translation}

${verse.surahEnglish}
(${verse.surahNumber}:${verse.ayahNumber})

Shared from Adkhar 🌙
`;

    try {
      await Share.share({
        message: shareText,
      });
    } catch (error) {
      console.log(error);
    }
  };

  if (!verse) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="small" color={PRIMARY} />
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.badge}>✨ Verse of the Day</Text>

        <View style={styles.dayChip}>
          <Ionicons name="time-outline" size={14} color={GOLD} />

          <Text style={styles.dayText}>24 Hours</Text>
        </View>
      </View>

      {/* Swipe Card */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.slider}
      >
        {/* Arabic */}
        <View style={styles.slide}>
          <Text style={styles.slideTitle}>Arabic</Text>

          <Text style={styles.arabic}>{verse.arabic}</Text>

          <Text style={styles.reference}>
            ﴿ {toArabicNumber(verse.ayahNumber)} ﴾
          </Text>
        </View>

        {/* Translation */}
        <View style={styles.slide}>
          <Text style={styles.slideTitle}>Translation</Text>

          <Text style={styles.translation}>{verse.translation}</Text>

          <Text style={styles.reference}>
            {verse.surahEnglish} ({verse.surahNumber}:{verse.ayahNumber})
          </Text>
        </View>
      </ScrollView>

      {/* Indicator */}
      <View style={styles.indicatorContainer}>
        <View style={styles.activeDot} />
        <View style={styles.dot} />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={{ flex: 1 }}>
          <Text style={styles.surahArabic}>{verse.surahArabic}</Text>

          <Text style={styles.surahEnglish}>
            {verse.surahEnglish} • {verse.surahNumber}:{verse.ayahNumber}
          </Text>
        </View>

        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Ionicons name="share-social" size={22} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loader: {
    paddingVertical: 50,
    alignItems: "center",
  },

  card: {
    backgroundColor: PAPER,
    borderRadius: 28,
    padding: 20,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: "#EFE3C8",
    elevation: 5,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  badge: {
    color: PRIMARY,
    fontWeight: "800",
    fontSize: 16,
  },

  dayChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  dayText: {
    color: GOLD,
    fontWeight: "700",
    fontSize: 12,
  },

  slider: {
    marginTop: 18,
  },

  slide: {
    width: CARD_WIDTH,
    minHeight: 160,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },

  slideTitle: {
    color: PRIMARY,
    fontWeight: "700",
    marginBottom: 14,
    fontSize: 13,
  },

  arabic: {
    fontSize: 22,
    lineHeight: 48,
    textAlign: "center",
    writingDirection: "rtl",
    color: "#111827",
    fontFamily: "AmiriQuran",
  },

  translation: {
    fontSize: 15,
    lineHeight: 28,
    color: "#4B5563",
    textAlign: "center",
    fontStyle: "italic",
    fontFamily: " NotoSansArabic",
  },

  reference: {
    marginTop: 16,
    color: GOLD,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },

  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    gap: 6,
  },

  activeDot: {
    width: 24,
    height: 8,
    borderRadius: 20,
    backgroundColor: PRIMARY,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 10,
    backgroundColor: "#D1D5DB",
  },

  footer: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  surahArabic: {
    color: PRIMARY,
    fontSize: 22,
    fontWeight: "700",
  },

  surahEnglish: {
    marginTop: 4,
    color: "#6B7280",
    fontSize: 14,
  },

  shareBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: PRIMARY,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 15,
  },
});
