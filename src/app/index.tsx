import { Redirect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ImageBackground } from "react-native";
import { useAuth } from "./context/userContext";

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <ImageBackground
        source={require("@/assets/masjidl-aqsoh.jpg")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <StatusBar style="light" />
      </ImageBackground>
    );
  }

  return <Redirect href={user ? "/(tabs)" : "/(onboarding)"} />;
}
