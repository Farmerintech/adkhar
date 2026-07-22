import { default as masjid2 } from "@/assets/masjidl-aqsoh.jpg";
import { default as masjid1 } from "@/assets/msjd.jpg";

import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Animated, { FadeInUp, ZoomIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/userContext";

const PRIMARY = "#4A154B";
const translation = "What would you like us to call you...?";

export default function OnboardingScreen() {
  const [typedText, setTypedText] = useState("");
  const [name, setName] = useState({ name: "" });

  const { login } = useAuth();
  const router = useRouter();

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

  const handleChange = (value: string) => {
    setName({ name: value });
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();

    if (!name.name.trim()) return;

    await login(name);
    router.replace("/(tabs)");
  };

  // Content render to prevent duplicating code
  const renderContent = () => (
    <ScrollView
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      showsVerticalScrollIndicator={false}
    >
      {/* Cluster Section */}
      <Animated.View
        entering={ZoomIn.duration(900)}
        style={styles.clusterContainer}
      >
        {/* Back image */}
        <Image source={masjid1} style={styles.largeRight} />

        {/* Front image */}
        <Image source={masjid2} style={styles.smallTop} />

        {/* Floating Chips */}
        <View style={styles.topChip}>
          <Text style={styles.chipText}>☀ Morning Adhkar</Text>
        </View>

        <View style={styles.bottomChip}>
          <Text style={styles.chipText}>🌙 Evening Adhkar</Text>
        </View>
      </Animated.View>

      {/* Name Input */}
      <View style={styles.translationContainer}>
        <TextInput
          placeholder={typedText}
          placeholderTextColor="#9A7B9B"
          style={styles.input}
          value={name.name}
          onChangeText={handleChange}
          autoCorrect={false}
          autoCapitalize="words"
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />
      </View>

      {/* Continue Button */}
      <Animated.View
        entering={FadeInUp.delay(700).duration(800)}
        style={styles.buttonContainer}
      >
        <Pressable style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Continue</Text>
        </Pressable>
      </Animated.View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <StatusBar style="dark" />

        {/* Avoid wrapping with TouchableWithoutFeedback on Web */}
        {Platform.OS === "web" ? (
          renderContent()
        ) : (
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            {renderContent()}
          </TouchableWithoutFeedback>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FCECF5",
  },
  scroll: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 30,
  },
  clusterContainer: {
    width: 320,
    height: 380,
    position: "relative",
    marginBottom: 30,
  },
  largeRight: {
    width: "100%",
    height: 370,
    borderRadius: 28,
    borderWidth: 6,
    borderColor: "#fff",
    zIndex: 1,
    transform: [{ rotate: "5deg" }],
  },
  smallTop: {
    position: "absolute",
    width: "100%",
    height: 350,
    borderRadius: 28,
    top: 18,
    left: 5,
    borderWidth: 6,
    borderColor: "#fff",
    zIndex: 5,
    transform: [{ rotate: "-4deg" }],
  },
  topChip: {
    position: "absolute",
    right: -10,
    top: 90,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    zIndex: 10,
  },
  bottomChip: {
    position: "absolute",
    left: 20,
    bottom: 40,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 30,
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
    fontFamily: "NotoSansArabic",
  },
  translationContainer: {
    width: "100%",
    marginTop: 20,
    marginBottom: 30,
  },
  input: {
    width: "100%",
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderWidth: 2,
    borderColor: PRIMARY,
    borderRadius: 25,
    fontSize: 16,
    color: PRIMARY,
    backgroundColor: "#fff",
  },
  buttonContainer: {
    width: "100%",
  },
  button: {
    backgroundColor: PRIMARY,
    paddingVertical: 18,
    borderRadius: 999,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
