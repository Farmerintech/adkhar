import * as SecureStore from "expo-secure-store";

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
   GENERIC HELPERS
========================= */

const setItem = async (key: string, value: any) => {
  try {
    await SecureStore.setItemAsync(key, JSON.stringify(value));
  } catch (error) {
    console.error("Storage set error:", error);
  }
};

const getItem = async <T>(key: string): Promise<T | null> => {
  try {
    const value = await SecureStore.getItemAsync(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch (error) {
    console.error("Storage get error:", error);
    return null;
  }
};

const removeItem = async (key: string) => {
  try {
    await SecureStore.deleteItemAsync(key);
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
  try {
    await SecureStore.setItemAsync(KEYS.ONBOARDING, "true");
  } catch (error) {
    console.error("Onboarding set error:", error);
  }
};

export const hasSeenOnboarding = async (): Promise<boolean> => {
  try {
    const value = await SecureStore.getItemAsync(KEYS.ONBOARDING);
    return value === "true";
  } catch (error) {
    console.error("Onboarding get error:", error);
    return false;
  }
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

    // Merge with defaults so new fields are added automatically
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
   OPTIONAL FULL RESET
========================= */

export const clearAllStorage = async () => {
  try {
    await SecureStore.deleteItemAsync(KEYS.USER);
    await SecureStore.deleteItemAsync(KEYS.ONBOARDING);
    await SecureStore.deleteItemAsync(KEYS.SETTINGS);
  } catch (error) {
    console.error("Clear storage error:", error);
  }
};
