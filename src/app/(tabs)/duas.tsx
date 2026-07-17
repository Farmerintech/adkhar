import * as data from "@/app/utils/duas.json";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PRIMARY = "#4A154B";
const LIGHT_BG = "#F8F5FA";

const icons = [
  "sunny-outline",
  "moon-outline",
  "bed-outline",
  "airplane-outline",
  "restaurant-outline",
  "home-outline",
  "people-outline",
  "heart-outline",
  "book-outline",
  "shield-outline",
];

export default function DuaScreen() {
  const router = useRouter();

  const duasData = data.data.categories;

  const moveToAdkharPage = (category: string) => {
    router.push(`/(screens)/adkhar?category=${category}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <StatusBar barStyle={"light-content"} backgroundColor={PRIMARY} />

      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="white" />
        </Pressable>

        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Duas & Adhkar</Text>

          <Text style={styles.headerSubtitle}>
            Supplications for every moment
          </Text>
        </View>
      </View>

      {/* Content */}
      <FlatList
        data={duasData}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() => moveToAdkharPage(item.id)}
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed,
            ]}
          >
            <View style={styles.leftSection}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name={icons[index % icons.length] as any}
                  size={24}
                  color={PRIMARY}
                />
              </View>

              <View>
                <Text style={styles.title}>{item.name}</Text>

                <Text style={styles.subtitle}>
                  Tap to explore supplications
                </Text>
              </View>
            </View>

            <View style={styles.arrowContainer}>
              <Ionicons name="chevron-forward" size={18} color={PRIMARY} />
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_BG,
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

  listContent: {
    padding: 20,
    marginTop: -18,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: "white",
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
  },

  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },

  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#F3ECF5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 12,
    color: "#8E8E93",
  },

  arrowContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F7F4F8",
    justifyContent: "center",
    alignItems: "center",
  },
});
