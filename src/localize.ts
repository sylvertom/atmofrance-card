import * as en from "./translations/en.json";
import * as fr from "./translations/fr.json";

const translations: Record<string, any> = { en, fr };

export function localize(key: string, language?: string): string {
  const lang = language?.startsWith("fr") ? "fr" : "en";
  const keys = key.split(".");
  let result: any = translations[lang];
  for (const k of keys) {
    result = result?.[k];
  }
  if (result === undefined) {
    // Fallback to English
    result = translations["en"];
    for (const k of keys) {
      result = result?.[k];
    }
  }
  return result ?? key;
}
