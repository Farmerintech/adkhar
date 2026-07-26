import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  AdhanVoice,
  AppSettings,
  DEFAULT_SETTINGS,
  getSettings,
  saveSettings,
} from "@/app/utils/storage";

type SettingsContextType = {
  settings: AppSettings;
  loading: boolean;

  toggleMorningEvening: () => Promise<void>;
  togglePrayerNotification: () => Promise<void>;
  toggleTahajjudReminder: () => Promise<void>;
  toggleAdhkarReminder: () => Promise<void>;

  setAdhanVoice: (voice: AdhanVoice) => Promise<void>;

  updateSetting: <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K],
  ) => Promise<void>;
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Mirrors `settings` synchronously so updateSetting can read the
  // latest value even if called twice before a re-render commits.
  const settingsRef = useRef<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await getSettings();
      const resolved = saved ?? DEFAULT_SETTINGS;
      settingsRef.current = resolved;
      setSettings(resolved);
    } catch (error) {
      console.log(error);
      settingsRef.current = DEFAULT_SETTINGS;
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  };

  const persistSettings = async (newSettings: AppSettings) => {
    settingsRef.current = newSettings;
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  // Reads from settingsRef (always current) instead of the `settings`
  // closure variable, so back-to-back calls (e.g. two toggles tapped
  // quickly) each build on the true latest state instead of a stale
  // snapshot from when the component last rendered.
  const updateSetting = async <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K],
  ) => {
    const updated = {
      ...settingsRef.current,
      [key]: value,
    };

    await persistSettings(updated);
  };

  const toggleMorningEvening = async () => {
    await updateSetting(
      "morningEveningNotification",
      !settingsRef.current.morningEveningNotification,
    );
  };

  const togglePrayerNotification = async () => {
    await updateSetting(
      "prayerNotification",
      !settingsRef.current.prayerNotification,
    );
  };

  const toggleTahajjudReminder = async () => {
    await updateSetting(
      "tahajjudReminder",
      !settingsRef.current.tahajjudReminder,
    );
  };

  const toggleAdhkarReminder = async () => {
    await updateSetting("adhkarReminder", !settingsRef.current.adhkarReminder);
  };

  const setAdhanVoice = async (voice: AdhanVoice) => {
    await updateSetting("adhanVoice", voice);
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        toggleMorningEvening,
        togglePrayerNotification,
        toggleTahajjudReminder,
        toggleAdhkarReminder,
        setAdhanVoice,
        updateSetting,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error("useSettings must be used inside SettingsProvider");
  }

  return context;
};
