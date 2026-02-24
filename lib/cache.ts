import { Article, Category, CountryCode } from "@/lib/types";

type FeedEntry = {
  key: string;
  country: CountryCode;
  category: Category;
  items: Article[];
  expiresAt: number;
};

type ArticleEntry = {
  item: Article;
  expiresAt: number;
};

type CountryEntry = {
  item: Article;
  touchedAt: number;
};

const FEED_TTL_MS = 5 * 60 * 1000;
const ARTICLE_TTL_MS = 90 * 60 * 1000;
const MAX_FEED_KEYS = 72;
const MAX_ARTICLES = 2000;

const feedCache = new Map<string, FeedEntry>();
const articleCache = new Map<string, ArticleEntry>();
const countryIndex = new Map<CountryCode, Map<string, CountryEntry>>();

function feedKey(country: CountryCode, category: Category): string {
  return `${country}:${category}`;
}

function trimMap<T>(map: Map<string, T>, maxSize: number): void {
  while (map.size > maxSize) {
    const oldestKey = map.keys().next().value;
    if (!oldestKey) {
      break;
    }
    map.delete(oldestKey);
  }
}

function touchFeed(entry: FeedEntry): void {
  feedCache.delete(entry.key);
  feedCache.set(entry.key, entry);
}

function touchArticle(id: string, entry: ArticleEntry): void {
  articleCache.delete(id);
  articleCache.set(id, entry);
}

function indexCountryArticle(country: CountryCode, article: Article): void {
  const now = Date.now();
  const existing = countryIndex.get(country) ?? new Map<string, CountryEntry>();
  existing.set(article.id, { item: article, touchedAt: now });

  if (existing.size > MAX_ARTICLES) {
    const sorted = [...existing.entries()].sort((a, b) => a[1].touchedAt - b[1].touchedAt);
    for (const [entryId] of sorted.slice(0, sorted.length - MAX_ARTICLES)) {
      existing.delete(entryId);
    }
  }

  countryIndex.set(country, existing);
}

export function getCachedFeed(country: CountryCode, category: Category): Article[] | null {
  const key = feedKey(country, category);
  const entry = feedCache.get(key);
  if (!entry) {
    return null;
  }

  if (entry.expiresAt < Date.now()) {
    feedCache.delete(key);
    return null;
  }

  touchFeed(entry);
  return entry.items;
}

export function setCachedFeed(country: CountryCode, category: Category, items: Article[]): void {
  const key = feedKey(country, category);
  const expiresAt = Date.now() + FEED_TTL_MS;
  const entry: FeedEntry = { key, country, category, items, expiresAt };
  touchFeed(entry);

  for (const article of items) {
    setCachedArticle(article);
    if (article.country) {
      indexCountryArticle(article.country, article);
    }
  }

  trimMap(feedCache, MAX_FEED_KEYS);
}

export function setCachedArticle(article: Article): void {
  const expiresAt = Date.now() + ARTICLE_TTL_MS;
  const entry: ArticleEntry = { item: article, expiresAt };
  touchArticle(article.id, entry);

  if (article.country) {
    indexCountryArticle(article.country, article);
  }

  trimMap(articleCache, MAX_ARTICLES);
}

export function getCachedArticle(id: string): Article | null {
  const entry = articleCache.get(id);
  if (!entry) {
    return null;
  }

  if (entry.expiresAt < Date.now()) {
    articleCache.delete(id);
    return null;
  }

  touchArticle(id, entry);
  return entry.item;
}

export function findArticleInFeeds(id: string): Article | null {
  const now = Date.now();

  for (const [key, entry] of feedCache.entries()) {
    if (entry.expiresAt < now) {
      feedCache.delete(key);
      continue;
    }

    const found = entry.items.find((item) => item.id === id);
    if (found) {
      setCachedArticle(found);
      return found;
    }
  }

  return null;
}

export function getCountryArticles(country: CountryCode): Article[] {
  const items = countryIndex.get(country);
  if (!items) {
    return [];
  }

  const cutoff = Date.now() - ARTICLE_TTL_MS;
  for (const [id, entry] of items.entries()) {
    if (entry.touchedAt < cutoff) {
      items.delete(id);
    }
  }

  return [...items.values()]
    .map((entry) => entry.item)
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
}

export function hasCountryCache(country: CountryCode): boolean {
  return getCountryArticles(country).length > 0;
}

