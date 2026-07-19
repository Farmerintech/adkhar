import { Ionicons } from "@expo/vector-icons";
import { createAudioPlayer, setAudioModeAsync } from "expo-audio";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSettings } from "../context/settingsContext";
import { useAuth } from "../context/userContext";

const PRIMARY = "#4A154B";
const GOLD = "#D4AF37";
const PAPER = "#FFFDF8";
const LIGHT = "#F8F5FA";
const BORDER = "#EFE3C8";
const LIGHT_BG = "#F8F5FA";

export default function SettingsScreen() {
  const {
    settings,
    toggleMorningEvening,
    togglePrayerNotification,
    toggleTahajjudReminder,
    setAdhanVoice,
  } = useSettings();

  const { user } = useAuth() || { user: { name: "yakub" } };
  const router = useRouter();

  // Audio State Management
  const [player, setPlayer] = useState<any>(null);
  const [playingVoiceKey, setPlayingVoiceKey] = useState<string | null>(null);
  const [loadingVoiceKey, setLoadingVoiceKey] = useState<string | null>(null);

  const voices = useMemo(
    () => [
      {
        key: "alafasy",
        title: "Mishary Rashid Alafasy",
        subtitle: "Calm and beautiful recitation",
        // Replace with your real audio file paths or remote URLs
        uri: require("@/assets/audio/adhan1.mp3"),
      },
      {
        key: "sudais",
        title: "Abdul Rahman Al Sudais",
        subtitle: "Masjid Al Haram style",
        uri: require("@/assets/audio/adhan2.mp3"),
      },
      {
        key: "muaiqly",
        title: "Maher Al Muaiqly",
        subtitle: "Soft and modern voice",
        uri: require("@/assets/audio/adhan3.mp3"),
      },
    ],
    [],
  );

  // Clean up sound on unmount
  useEffect(() => {
    return () => {
      if (player) {
        player.release();
      }
    };
  }, [player]);

  const playAdhanSample = async (voiceKey: string, source: any) => {
    try {
      if (player) {
        player.pause();
        player.release();
        setPlayer(null);

        if (playingVoiceKey === voiceKey) {
          setPlayingVoiceKey(null);
          return;
        }
      }

      setLoadingVoiceKey(voiceKey);

      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: false,
      });

      const newPlayer = createAudioPlayer(source);

      setPlayer(newPlayer);
      setPlayingVoiceKey(voiceKey);
      setLoadingVoiceKey(null);

      newPlayer.play();
    } catch (error) {
      console.log("Error playing preview audio", error);
      setLoadingVoiceKey(null);
    }
  };

  const SettingRow = ({ icon, title, subtitle, value, onPress }: any) => (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.settingCard}
      onPress={onPress}
    >
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={22} color={PRIMARY} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
      </View>

      <View style={[styles.switchContainer, value && styles.switchActive]}>
        <View style={[styles.switchKnob, value && styles.switchKnobActive]} />
        {value && (
          <Ionicons
            name="checkmark"
            size={12}
            color="white"
            style={styles.switchCheck}
          />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: PRIMARY }}
      edges={["left", "right", "top"]}
    >
      <View style={{ backgroundColor: LIGHT_BG }}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color="white" />
          </Pressable>

          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>{user?.name}</Text>
            <Text style={styles.headerSubtitle}>
              Personalize your Adkhar experience
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* NOTIFICATIONS */}
        <Text style={styles.sectionTitle}>Notifications</Text>

        <SettingRow
          icon="sunny-outline"
          title="Morning & Evening Adhkar"
          subtitle="Receive daily adhkar reminders"
          value={settings.morningEveningNotification}
          onPress={toggleMorningEvening}
        />

        <SettingRow
          icon="notifications-outline"
          title="Prayer Time Notifications"
          subtitle="Receive notifications for each prayer"
          value={settings.prayerNotification}
          onPress={togglePrayerNotification}
        />

        <SettingRow
          icon="moon-outline"
          title="Tahajjud Reminder"
          subtitle="Reminder before the last third of the night"
          value={settings.tahajjudReminder}
          onPress={toggleTahajjudReminder}
        />

        {/* ADHAN VOICES */}
        <Text style={styles.sectionTitle}>Adhan Voice</Text>

        {voices.map((voice: any) => {
          const selected = settings.adhanVoice === voice.key;
          const isPlaying = playingVoiceKey === voice.key;
          const isLoading = loadingVoiceKey === voice.key;

          return (
            <TouchableOpacity
              key={voice.key}
              activeOpacity={0.8}
              style={[styles.voiceCard, selected && styles.voiceSelected]}
              onPress={() => setAdhanVoice(voice.key as any)}
            >
              {/* Play / Pause Auditory Sample Action Button */}
              <TouchableOpacity
                style={styles.playButton}
                onPress={() => playAdhanSample(voice.key, voice.uri)}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={PRIMARY} />
                ) : (
                  <Ionicons
                    name={isPlaying ? "pause-circle" : "play-circle"}
                    size={32}
                    color={isPlaying ? GOLD : PRIMARY}
                  />
                )}
              </TouchableOpacity>

              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text
                  style={[
                    styles.voiceTitle,
                    selected && styles.voiceTitleSelected,
                  ]}
                >
                  {voice.title}
                </Text>
                <Text style={styles.voiceSubtitle}>{voice.subtitle}</Text>
              </View>

              <View
                style={[
                  styles.radioOuter,
                  selected && styles.radioOuterSelected,
                ]}
              >
                {selected && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          );
        })}

        {/* APP INFO */}
        <Text style={styles.sectionTitle}>About Adkhar</Text>
        <View style={styles.infoCard}>
          <Ionicons name="moon" size={28} color={GOLD} />
          <Text style={styles.appName}>Adkhar</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
          <Text style={styles.infoText}>
            Your companion for Quran, Adhkar, Prayer Times and Islamic
            reminders.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PAPER,
    paddingHorizontal: 20,
  },
  header: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 35,
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
    color: "#E6D7E7",
    marginTop: 4,
    fontSize: 13,
  },
  sectionTitle: {
    color: PRIMARY,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 16,
    marginTop: 10,
  },
  settingCard: {
    backgroundColor: LIGHT,
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: PAPER,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  settingTitle: {
    color: "#111827",
    fontWeight: "700",
    fontSize: 16,
  },
  settingSubtitle: {
    color: "#6B7280",
    marginTop: 4,
    fontSize: 13,
  },
  switchContainer: {
    width: 58,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#D1D5DB",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  switchActive: {
    backgroundColor: PRIMARY,
  },
  switchKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "white",
  },
  switchKnobActive: {
    alignSelf: "flex-end",
  },
  switchCheck: {
    position: "absolute",
    left: 10,
  },
  voiceCard: {
    backgroundColor: LIGHT,
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: "row",
    alignItems: "center",
  },
  voiceSelected: {
    borderColor: GOLD,
    borderWidth: 2,
    backgroundColor: "#FFF8E6",
  },
  playButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 36,
    height: 36,
  },
  voiceTitle: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
  },
  voiceTitleSelected: {
    color: PRIMARY,
  },
  voiceSubtitle: {
    marginTop: 4,
    color: "#6B7280",
    fontSize: 13,
  },
  radioOuter: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
  },
  radioOuterSelected: {
    borderColor: GOLD,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: GOLD,
  },
  infoCard: {
    backgroundColor: LIGHT,
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER,
  },
  appName: {
    marginTop: 12,
    color: PRIMARY,
    fontSize: 24,
    fontWeight: "800",
  },
  version: {
    marginTop: 4,
    color: GOLD,
    fontWeight: "700",
  },
  infoText: {
    marginTop: 12,
    textAlign: "center",
    color: "#6B7280",
    lineHeight: 24,
  },
});
