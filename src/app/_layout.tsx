// import  AnimatedSplashOverlay  from "@/components/animated-icon";
import * as Notifications from "expo-notifications";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar, useColorScheme } from "react-native";
import { NotificationProvider } from "./context/notificationsContext";
import { SettingsProvider } from "./context/settingsContext";
import { AuthProvider } from "./context/userContext";

SplashScreen.preventAutoHideAsync();
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <NotificationProvider>
          <SettingsProvider>
            {/* <AnimatedSplashOverlay /> */}
            <StatusBar barStyle={"light-content"} />
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="(screens)" />
            </Stack>
          </SettingsProvider>
          {/* <AppTabs /> */}
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
