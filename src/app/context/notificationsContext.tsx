import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configure how notifications behave when received
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Single source of truth for adhan voice -> sound file.
// Import this from wherever you schedule notifications too,
// so the channelId/sound always match.
export const ADHAN_SOUND_MAP = {
  alafasy: "adhan11.wav",
  sudais: "adhan22.wav",
  muaiqly: "adhan33.wav",
} as const;

// Android channel id per voice. Channels are immutable once created,
// so each voice needs its own permanent channel id (don't reuse "default").
export const ADHAN_CHANNEL_MAP = {
  alafasy: "prayer-alafasy",
  sudais: "prayer-sudais",
  muaiqly: "prayer-muaiqly",
} as const;

type NotificationContextType = {
  notification: Notifications.Notification | null;
};

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

type Props = {
  children: ReactNode;
};

export function NotificationProvider({ children }: Props) {
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);

  const notificationListener = useRef<Notifications.EventSubscription | null>(
    null,
  );

  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    const setupNotifications = async () => {
      try {
        // Detect Expo Go
        const isExpoGo = Constants.executionEnvironment === "storeClient";

        // Skip push notification initialization in Expo Go on Android
        if (Platform.OS === "android" && isExpoGo) {
          console.log("Skipping push notification setup in Expo Go");
          return;
        }

        const { status } = await Notifications.requestPermissionsAsync();

        if (status !== "granted") {
          console.log("Notification permission denied");
          return;
        }

        if (Platform.OS === "android") {
          // Create one channel per adhan voice, each with its sound
          // baked in at creation time. Do this for ALL voices up front
          // (not just the currently selected one) so switching voices
          // later doesn't require a fresh channel that never gets created.
          for (const voice of Object.keys(
            ADHAN_SOUND_MAP,
          ) as (keyof typeof ADHAN_SOUND_MAP)[]) {
            await Notifications.setNotificationChannelAsync(
              ADHAN_CHANNEL_MAP[voice],
              {
                name: `Adhan - ${voice}`,
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: "#4A154B",
                sound: ADHAN_SOUND_MAP[voice],
              },
            );
          }
        }
      } catch (error) {
        console.log("Error setting up notifications:", error);
      }
    };

    setupNotifications();

    // Notification received while app is open
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    // User tapped notification
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification tapped:", response);
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ notification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotification must be used inside NotificationProvider");
  }

  return context;
}
