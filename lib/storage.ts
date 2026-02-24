import {
  Article,
  COUNTRY_CODES,
  CountryCode,
  ThemePreference,
} from "@/lib/types";

const SAVED_KEY = "newshub_saved";
const COUNTRY_KEY = "newshub_country";
const THEME_KEY = "newshub_theme";
const READER_SIZE_KEY = "newshub_reader_text_size";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function parseJson<T>(value: string | null, fallback: T): T {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function getSavedArticles(): Article[] {
  if (!canUseStorage()) {
    return [];
  }

  const parsed = parseJson<Article[]>(localStorage.getItem(SAVED_KEY), []);
  return Array.isArray(parsed) ? parsed : [];
}

export function isSavedArticle(articleId: string): boolean {
  return getSavedArticles().some((item) => item.id === articleId);
}

export function setSavedArticles(items: Article[]): void {
  if (!canUseStorage()) {
    return;
  }

  localStorage.setItem(SAVED_KEY, JSON.stringify(items));
}

export function toggleSavedArticle(article: Article): boolean {
  const current = getSavedArticles();
  const exists = current.some((item) => item.id === article.id);

  if (exists) {
    setSavedArticles(current.filter((item) => item.id !== article.id));
    return false;
  }

  setSavedArticles([article, ...current]);
  return true;
}

export function removeSavedArticle(articleId: string): void {
  const current = getSavedArticles();
  setSavedArticles(current.filter((item) => item.id !== articleId));
}

export function getStoredCountry(defaultCountry: CountryCode = "US"): CountryCode {
  if (!canUseStorage()) {
    return defaultCountry;
  }

  const value = localStorage.getItem(COUNTRY_KEY);
  if (!value) {
    return defaultCountry;
  }

  return COUNTRY_CODES.includes(value as CountryCode)
    ? (value as CountryCode)
    : defaultCountry;
}

export function setStoredCountry(country: CountryCode): void {
  if (!canUseStorage()) {
    return;
  }

  localStorage.setItem(COUNTRY_KEY, country);
}

export function getStoredTheme(): ThemePreference {
  if (!canUseStorage()) {
    return "system";
  }

  const value = localStorage.getItem(THEME_KEY);
  if (value === "light" || value === "dark" || value === "system") {
    return value;
  }

  return "system";
}

export function setStoredTheme(theme: ThemePreference): void {
  if (!canUseStorage()) {
    return;
  }

  localStorage.setItem(THEME_KEY, theme);
}

export function getReaderTextSize(): number {
  if (!canUseStorage()) {
    return 1;
  }

  const value = Number(localStorage.getItem(READER_SIZE_KEY));
  if (Number.isFinite(value) && value >= 0 && value <= 2) {
    return value;
  }

  return 1;
}

export function setReaderTextSize(size: number): void {
  if (!canUseStorage()) {
    return;
  }

  localStorage.setItem(READER_SIZE_KEY, String(Math.max(0, Math.min(2, size))));
}

export const storageKeys = {
  saved: SAVED_KEY,
  country: COUNTRY_KEY,
  theme: THEME_KEY,
  readerSize: READER_SIZE_KEY,
} as const;

