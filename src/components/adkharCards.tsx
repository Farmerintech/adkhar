import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const PRIMARY = "#4A154B";

const adkhars = [
  {
    title: "Morning",
    icon: "sunny-outline",
    color: "#FFF4D6",
    iconColor: "#E6A700",
    to: "morning",
  },
  {
    title: "Evening",
    icon: "moon-outline",
    color: "#EFE8FF",
    iconColor: "#6B46C1",
    to: "evening",
  },
  {
    title: "Sleep",
    icon: "bed-outline",
    color: "#E8F5FF",
    iconColor: "#0284C7",
    to: "sleep",
  },
  {
    title: "Travel",
    icon: "airplane-outline",
    color: "#EAFBF1",
    iconColor: "#16A34A",
    to: "travel",
  },
  {
    title: "Others",
    icon: "apps-outline",
    color: "#FFEAEA",
    iconColor: "#DC2626",
    to: "others",
  },
];

export const AdkharCard = () => {
  const router = useRouter();
  const goToDesiredScreen = (category: any) => {
    if (category === "others") {
      router.push(`/(tabs)/duas`);
    } else {
      router.push(`/(screens)/adkhar?category=${category}`);
    }
  };
  return (
    <View>
      <Text style={styles.sectionTitle}>Adhkar Categories</Text>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={adkhars}
        keyExtractor={(item) => item.title}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => goToDesiredScreen(item.to)}
            style={[styles.card, { backgroundColor: item.color }]}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: `${item.iconColor}20` },
              ]}
            >
              <Ionicons
                name={item.icon as any}
                size={26}
                color={item.iconColor}
              />
            </View>

            <Text style={styles.title}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: PRIMARY,
    marginBottom: 16,
  },

  listContainer: {
    paddingRight: 20,
  },

  card: {
    width: 120,
    height: 135,
    borderRadius: 24,
    marginRight: 14,
    padding: 18,
    justifyContent: "space-between",

    // shadowColor: "#000",
    // shadowOffset: {
    //   width: 0,
    //   height: 4,
    // },
    // shadowOpacity: 0.08,
    // shadowRadius: 12,
    // elevation: 5,
  },

  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#222",
  },
});
