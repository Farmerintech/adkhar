import { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  ZoomIn,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import masjid4 from "@/assets/ilorinmosque.jpg";
import masjid3 from "@/assets/masjid-nabawy.jpg";
import masjid2 from "@/assets/masjid-sherif.jpg";
import { default as masjid } from "@/assets/masjidl-aqsoh.jpg";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

const PRIMARY = "#4A154B";

const translation =
  "And glorify Him (Allah) in the morning and in the evening.";

export default function OnboardingScreen() {
  const [typedText, setTypedText] = useState("");

  useEffect(() => {
    let index = 0;

    const interval = setInterval(() => {
      setTypedText(translation.slice(0, index + 1));

      index++;

      if (index === translation.length) {
        clearInterval(interval);
      }
    }, 35);

    return () => clearInterval(interval);
  }, []);

  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <Animated.Text
          entering={FadeInDown.duration(800)}
          style={styles.arabic}
        >
          Adkhar
        </Animated.Text>
        {/* Cluster Section */}
        <Animated.View
          entering={ZoomIn.duration(900)}
          style={styles.clusterContainer}
        >
          {/* Pink background blob */}
          <View style={styles.blob} />

          {/* Large Left */}
          <Image source={masjid} style={styles.largeLeft} />

          {/* Large Right */}
          <Image source={masjid2} style={styles.largeRight} />

          {/* Small Top */}
          <Image source={masjid3} style={styles.smallTop} />

          {/* Small Bottom */}
          <Image source={masjid4} style={styles.smallBottom} />

          {/* Floating Chips */}
          <View style={styles.topChip}>
            <Text style={styles.chipText}>☀ Morning Adhkar</Text>
          </View>

          <View style={styles.bottomChip}>
            <Text style={styles.chipText}>🌙 Evening Adhkar</Text>
          </View>
        </Animated.View>

        <Animated.Text
          entering={FadeInDown.duration(800)}
          style={styles.arabic}
        >
          وَسَبِّحُوهُ بُكْرَةً وَأَصِيلًا
        </Animated.Text>
        {/* Translation */}
        <View style={styles.translationContainer}>
          <Text style={styles.translation}>
            {typedText}
            <Text style={styles.cursor}>|</Text>
          </Text>
        </View>

        {/* Continue Button */}
        <Animated.View entering={FadeInUp.delay(700).duration(800)}>
          <Pressable
            style={styles.button}
            onPress={() => router.push("/welcome")}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const LARGE = 170;
const SMALL = 105;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fcecf5",
    paddingTop: 30,
  },

  scroll: {
    alignItems: "center",
    paddingTop: 30,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },

  logo: {
    color: PRIMARY,
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 5,
  },

  clusterContainer: {
    width: 340,
    height: 340,
    position: "relative",
    marginBottom: 20,
  },

  blob: {
    position: "absolute",
    width: 320,
    height: 260,

    borderRadius: 160,
    alignSelf: "center",
    top: 20,
  },

  largeLeft: {
    position: "absolute",
    width: LARGE,
    height: LARGE,
    borderRadius: LARGE / 2,
    left: 25,
    top: 95,
    borderWidth: 6,
    borderColor: "#fff",
    zIndex: 2,
  },

  largeRight: {
    position: "absolute",
    width: LARGE,
    height: LARGE,
    borderRadius: LARGE / 2,
    right: 25,
    top: 40,
    borderWidth: 6,
    borderColor: "#fff",
    zIndex: 1,
  },

  smallTop: {
    position: "absolute",
    width: SMALL,
    height: SMALL,
    borderRadius: SMALL / 2,
    top: 5,
    left: 95,
    borderWidth: 6,
    borderColor: "#fff",
    zIndex: 5,
  },

  smallBottom: {
    position: "absolute",
    width: SMALL,
    height: SMALL,
    borderRadius: SMALL / 2,
    right: 65,
    bottom: 45,
    borderWidth: 6,
    borderColor: "#fff",
    zIndex: 4,
  },

  topChip: {
    position: "absolute",
    right: -5,
    top: 85,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    zIndex: 10,
  },

  bottomChip: {
    position: "absolute",
    left: 40,
    bottom: 50,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    zIndex: 10,
  },

  chipText: {
    color: PRIMARY,
    fontWeight: "600",
    fontSize: 12,
  },

  arabic: {
    color: PRIMARY,
    fontSize: 31,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 56,
    marginBottom: 5,
    marginTop: -10,
    fontFamily: "AmiriQuran",
  },

  translationContainer: {
    minHeight: 80,
    justifyContent: "center",
    marginBottom: 35,
  },

  translation: {
    color: "#7A697A",
    textAlign: "center",
    fontSize: 17,
    lineHeight: 30,
    paddingHorizontal: 10,
    fontFamily: "NotoSansArabic",
  },

  cursor: {
    color: PRIMARY,
    fontWeight: "700",
  },

  button: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 120,
    paddingVertical: 18,
    borderRadius: 999,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
