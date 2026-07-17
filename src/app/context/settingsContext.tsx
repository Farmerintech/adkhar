import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
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

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await getSettings();
      setSettings(saved ?? DEFAULT_SETTINGS);
    } catch (error) {
      console.log(error);
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  };

  const persistSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const updateSetting = async <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K],
  ) => {
    const updated = {
      ...settings,
      [key]: value,
    };

    await persistSettings(updated);
  };

  const toggleMorningEvening = async () => {
    await updateSetting(
      "morningEveningNotification",
      !settings.morningEveningNotification,
    );
  };

  const togglePrayerNotification = async () => {
    await updateSetting("prayerNotification", !settings.prayerNotification);
  };

  const toggleTahajjudReminder = async () => {
    await updateSetting("tahajjudReminder", !settings.tahajjudReminder);
  };

  const toggleAdhkarReminder = async () => {
    await updateSetting("adhkarReminder", !settings.adhkarReminder);
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
