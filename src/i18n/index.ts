import { en } from "./en";
import { zh } from "./zh";

type TranslationShape<T> = {
  readonly [Key in keyof T]: T[Key] extends string
    ? string
    : TranslationShape<T[Key]>;
};

export type Translation = TranslationShape<typeof en>;
export type Language = "en" | "zh";

export const LANGUAGE_STORAGE_KEY = "d4-calculator-language";

export const translations: Record<Language, Translation> = {
  en,
  zh,
};

export function getInitialLanguage(): Language {
  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return isLanguage(saved) ? saved : "en";
}

export function saveLanguage(language: Language): void {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
}

export function isLanguage(value: unknown): value is Language {
  return value === "en" || value === "zh";
}
