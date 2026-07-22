import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import {
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

import AdhkarReminder from "../../services/dkharReminder";
import { NotificationProvider } from "./context/notificationsContext";
import { SettingsProvider } from "./context/settingsContext";
import { AuthProvider, useAuth } from "./context/userContext";

const PRIMARY = "#4A154B";

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

let globalFontApplied = false;

const applyGlobalFont = () => {
  if (globalFontApplied) return;

  const TextComponent = Text as any;

  TextComponent.defaultProps = TextComponent.defaultProps || {};
  TextComponent.defaultProps.style = [
    TextComponent.defaultProps.style,
    {
      fontFamily: "NotoSansArabic",
    },
  ];

  globalFontApplied = true;
};

function LoadingScreen() {
  return (
    <View style={styles.loadingRoot}>
      <ImageBackground
        source={require("@/assets/masjidl-aqsoh.jpg")}
        style={styles.loadingBackground}
        resizeMode="cover"
      >
        <StatusBar style="light" />
      </ImageBackground>
    </View>
  );
}

function RootNavigator() {
  const colorScheme = useColorScheme();
  const { loading } = useAuth();
  useEffect(() => {
    if (Platform.OS === "web" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js");
    }
  }, []);
  const [fontsLoaded] = useFonts({
    NotoSansArabic: require("../../assets/fonts/NotoSansArabic.ttf"),
    AmiriQuran: require("../../assets/fonts/AmiriQuran-Regular.ttf"),
  });

  const appReady = !loading && fontsLoaded;

  useEffect(() => {
    if (fontsLoaded) {
      applyGlobalFont();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (appReady) {
      setTimeout(() => {
        SplashScreen.hideAsync().catch(() => {});
      }, 100);
    }
  }, [appReady]);

  if (!appReady) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <NotificationProvider>
        <SettingsProvider>
          {/* {!loading && <AnimatedSplashOverlay />} */}

          <StatusBar style="light" />

          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: {
                backgroundColor: PRIMARY,
              },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(screens)" />
          </Stack>
          {Platform.OS !== "web" && <AdhkarReminder />}
        </SettingsProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <View style={styles.root}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: PRIMARY,
  },

  loadingRoot: {
    flex: 1,
    backgroundColor: PRIMARY,
  },

  loadingBackground: {
    flex: 1,
    backgroundColor: PRIMARY,
  },
});
