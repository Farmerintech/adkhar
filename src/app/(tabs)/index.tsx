import { AdkharCard } from "@/components/adkharCards";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AsmaulHusnaSection from "../../../services/asmaullah";
import PremiumIslamicCalendar from "../../../services/monthly-calender";
import PrayerCalendarModal from "../../../services/prayerTime";
// import PrayerTimesToday from "../../../services/prayerTimeToday";
import TodayDateCard from "../../../services/today";
import VerseOfTheDay from "../../../services/verseOfTheDay";

const PRIMARY = "#4A154B";
const GOLD = "#D4AF37";
const BG = "#F7F4F8";

export default function Index() {
  const [isVisible, setIsVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);

  const handleVisible = () => {
    setCalendarVisible((prev) => !prev);
  };
  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <StatusBar barStyle={"light-content"} backgroundColor={PRIMARY} />

      <View style={styles.fixedTop}>
        <TodayDateCard handleVisible={() => setIsVisible(true)} />

        <TouchableOpacity style={styles.profileBtn} onPress={handleVisible}>
          <Ionicons name="time-outline" size={24} color={PRIMARY} />
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      <ScrollView
        style={styles.main}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AdkharCard />
        <VerseOfTheDay />
        {/* <PrayerTimesToday /> */}
        <AsmaulHusnaSection />
      </ScrollView>

      {/* CALENDAR BOTTOM SHEET */}
      <PrayerCalendarModal visible={calendarVisible} onClose={handleVisible} />
      <Modal
        visible={isVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setIsVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsVisible(false)}
        >
          <Pressable style={styles.modalCard}>
            <View style={styles.dragHandle} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Islamic Calendar</Text>

              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setIsVisible(false)}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <PremiumIslamicCalendar />
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },

  fixedTop: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 20,
    paddingVertical: 20,
    height: 120,
    flexDirection: "row",
    // alignItems: "center",
    justifyContent: "space-between",
  },

  profileBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: GOLD,
    justifyContent: "center",
    alignItems: "center",
  },

  main: {
    flex: 1,
    marginTop: -25,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: BG,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.55)",
  },

  modalCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
    maxHeight: "85%",
  },

  dragHandle: {
    width: 60,
    height: 5,
    borderRadius: 10,
    backgroundColor: "#D1D5DB",
    alignSelf: "center",
    marginBottom: 20,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: PRIMARY,
  },

  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
});
