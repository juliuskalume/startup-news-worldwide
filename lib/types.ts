export type CountryCode =
  | "US"
  | "UK"
  | "DE"
  | "FR"
  | "TR"
  | "IN"
  | "NG"
  | "KE"
  | "BR"
  | "CA"
  | "AU"
  | "JP";

export type Category =
  | "Top"
  | "World"
  | "Technology"
  | "Business"
  | "Science"
  | "Health"
  | "Funding"
  | "Startups";

export type Article = {
  id: string;
  title: string;
  link: string;
  source: string;
  publishedAt: string;
  author?: string;
  excerpt?: string;
  imageUrl?: string;
  category?: Category;
  country?: CountryCode;
  readTimeMin?: number;
};

export type ThemePreference = "light" | "dark" | "system";

export const COUNTRY_CODES = [
  "US",
  "UK",
  "DE",
  "FR",
  "TR",
  "IN",
  "NG",
  "KE",
  "BR",
  "CA",
  "AU",
  "JP",
] as const satisfies readonly CountryCode[];

export const CATEGORIES = [
  "Top",
  "World",
  "Technology",
  "Business",
  "Science",
  "Health",
  "Funding",
  "Startups",
] as const satisfies readonly Category[];

export const HOME_CATEGORIES: readonly Category[] = [
  "Top",
  "World",
  "Technology",
  "Business",
  "Science",
  "Health",
];

export const COUNTRY_META: Record<CountryCode, { name: string; flag: string }> = {
  US: { name: "United States", flag: "US" },
  UK: { name: "United Kingdom", flag: "GB" },
  DE: { name: "Germany", flag: "DE" },
  FR: { name: "France", flag: "FR" },
  TR: { name: "Turkiye", flag: "TR" },
  IN: { name: "India", flag: "IN" },
  NG: { name: "Nigeria", flag: "NG" },
  KE: { name: "Kenya", flag: "KE" },
  BR: { name: "Brazil", flag: "BR" },
  CA: { name: "Canada", flag: "CA" },
  AU: { name: "Australia", flag: "AU" },
  JP: { name: "Japan", flag: "JP" },
};

export const CATEGORY_LABELS: Record<Category, string> = {
  Top: "Top Stories",
  World: "World",
  Technology: "Technology",
  Business: "Business",
  Science: "Science",
  Health: "Health",
  Funding: "Funding",
  Startups: "Startups",
};
