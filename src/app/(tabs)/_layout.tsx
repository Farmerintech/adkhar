import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Pressable } from "react-native";

const PRIMARY = "#4A154B";

function TabButton(props: any) {
  const { children, onPress, accessibilityState } = props;

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: "transparent" }}
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        opacity: 1,
      }}
    >
      {children}
    </Pressable>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: PRIMARY,
        tabBarInactiveTintColor: "#999",

        tabBarStyle: {
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: "#F2F2F2",
          elevation: 10,
          shadowOpacity: 0.08,
          backgroundColor: "white",
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },

        tabBarButton: (props) => <TabButton {...props} />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="quran"
        options={{
          title: "Quran",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="duas"
        options={{
          title: "Duas",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="moon" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
