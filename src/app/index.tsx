import { Redirect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ImageBackground, StyleSheet, View } from "react-native";

import { useAuth } from "./context/userContext";

const PRIMARY = "#4A154B";

function LoadingScreen() {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("@/assets/masjidl-aqsoh.jpg")}
        style={styles.background}
        resizeMode="cover"
      >
        <StatusBar style="light" />
      </ImageBackground>
    </View>
  );
}

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return <Redirect href={user ? "/(tabs)" : "/(onboarding)"} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PRIMARY,
  },

  background: {
    flex: 1,
    backgroundColor: PRIMARY,
  },
});
