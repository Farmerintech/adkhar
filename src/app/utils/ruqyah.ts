import ruqyahData from "@/app/utils/ruqyah.json";

export type RuqyahContentBlock = {
  type: "text" | "header" | "arabic" | "translation" | "transliteration";
  content: string;
};

export type RuqyahTopic = {
  sub_id: number;
  title: string;
  section_title: string;
  category: string;
  content: RuqyahContentBlock[];
  id: number;
};

type Language = "en" | "ar";

// Friendly display names for each category slug in the JSON.
export const CATEGORY_LABELS: Record<string, string> = {
  "introduction-to-ruqyah": "Introduction to Ruqyah",
  "protect-yourself-from-jinn": "Protect Yourself From Jinn",
  "black-magic-sihr": "Black Magic (Sihr)",
  "evil-eye-and-envy": "Evil Eye & Envy",
  "about-raqi": "About Raqi",
  "types-of-hijamah-bloodletting": "Types of Hijamah",
  "ruqyah-materials": "Ruqyah Materials",
  "7-day-detoxification-program": "7-Day Detox Program",
  "waswasah-whisperings": "Waswasah (Whisperings)",
  "the-ruqyah-bath-against-sihr": "The Ruqyah Bath Against Sihr",
  "other-diseases": "Other Diseases",
  "treatment-for-general-problems": "General Problems",
  "full-ruqyah-program": "Full Ruqyah Program",
};

export const getCategoryKeys = (language: Language = "en"): string[] => {
  return Object.keys((ruqyahData as any)[language] ?? {});
};

export const getTopicsForCategory = (
  categoryKey: string,
  language: Language = "en",
): RuqyahTopic[] => {
  return (ruqyahData as any)[language]?.[categoryKey] ?? [];
};

export const getTopicBySubId = (
  categoryKey: string,
  subId: number,
  language: Language = "en",
): RuqyahTopic | undefined => {
  return getTopicsForCategory(categoryKey, language).find(
    (topic) => topic.sub_id === subId,
  );
};
