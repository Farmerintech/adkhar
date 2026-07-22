import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

/* =========================
   TYPES
========================= */

export type User = {
  name: string;
};

export type AdhanVoice = "alafasy" | "sudais" | "muaiqly";

export type AppSettings = {
  morningEveningNotification: boolean;
  prayerNotification: boolean;
  tahajjudReminder: boolean;
  adhkarReminder: boolean;
  adhanVoice: AdhanVoice;
};

/* =========================
   KEYS
========================= */

const KEYS = {
  USER: "auth_user",
  ONBOARDING: "has_seen_onboarding",
  SETTINGS: "app_settings",
};

/* =========================
   DEFAULT SETTINGS
========================= */

export const DEFAULT_SETTINGS: AppSettings = {
  morningEveningNotification: true,
  prayerNotification: true,
  tahajjudReminder: true,
  adhkarReminder: true,
  adhanVoice: "alafasy",
};

/* =========================
   LOW LEVEL STORAGE HELPERS
========================= */

const storage = {
  async set(key: string, value: string) {
    if (Platform.OS === "web") {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },

  async get(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      return localStorage.getItem(key);
    }

    return await SecureStore.getItemAsync(key);
  },

  async remove(key: string) {
    if (Platform.OS === "web") {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

/* =========================
   GENERIC HELPERS
========================= */

const setItem = async (key: string, value: any) => {
  try {
    await storage.set(key, JSON.stringify(value));
  } catch (error) {
    console.error("Storage set error:", error);
  }
};

const getItem = async <T>(key: string): Promise<T | null> => {
  try {
    const value = await storage.get(key);

    if (!value) return null;

    return JSON.parse(value) as T;
  } catch (error) {
    console.error("Storage get error:", error);
    return null;
  }
};

const removeItem = async (key: string) => {
  try {
    await storage.remove(key);
  } catch (error) {
    console.error("Storage remove error:", error);
  }
};

/* =========================
   USER STORAGE
========================= */

export const saveUser = async (user: User) => {
  await setItem(KEYS.USER, user);
};

export const getUser = async (): Promise<User | null> => {
  return await getItem<User>(KEYS.USER);
};

export const removeUser = async () => {
  await removeItem(KEYS.USER);
};

/* =========================
   ONBOARDING STORAGE
========================= */

export const setOnboardingSeen = async () => {
  await setItem(KEYS.ONBOARDING, true);
};

export const hasSeenOnboarding = async (): Promise<boolean> => {
  const seen = await getItem<boolean>(KEYS.ONBOARDING);
  return seen ?? false;
};

/* =========================
   SETTINGS STORAGE
========================= */

export const saveSettings = async (settings: AppSettings) => {
  await setItem(KEYS.SETTINGS, settings);
};

export const getSettings = async (): Promise<AppSettings> => {
  try {
    const settings = await getItem<AppSettings>(KEYS.SETTINGS);

    if (!settings) {
      await saveSettings(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }

    return {
      ...DEFAULT_SETTINGS,
      ...settings,
    };
  } catch (error) {
    console.error("Settings get error:", error);
    return DEFAULT_SETTINGS;
  }
};

export const resetSettings = async () => {
  await saveSettings(DEFAULT_SETTINGS);
};

/* =========================
   CLEAR EVERYTHING
========================= */

export const clearAllStorage = async () => {
  try {
    await removeItem(KEYS.USER);
    await removeItem(KEYS.ONBOARDING);
    await removeItem(KEYS.SETTINGS);
  } catch (error) {
    console.error("Clear storage error:", error);
  }
};
