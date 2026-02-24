import Parser from "rss-parser";
import {
  findArticleInFeeds,
  getCachedArticle,
  getCachedFeed,
  getCountryArticles,
  hasCountryCache,
  setCachedFeed,
} from "@/lib/cache";
import { getFeedsFor } from "@/lib/feeds";
import { normalizeRssItem } from "@/lib/normalize";
import { Article, Category, CountryCode } from "@/lib/types";

const parser = new Parser<Record<string, never>, Record<string, unknown>>({
  customFields: {
    item: [
      ["media:content", "media:content", { keepArray: true }],
      ["media:thumbnail", "media:thumbnail", { keepArray: true }],
      ["dc:creator", "dc:creator"],
    ],
  },
  headers: {
    "User-Agent": "StartupNewsWorldwide/1.0",
  },
});

const FETCH_TIMEOUT_MS = 12_000;
const MAX_ITEMS = 60;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeoutId: NodeJS.Timeout | undefined;

  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error("RSS request timed out"));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  });
}

function dedupeAndSort(items: Article[]): Article[] {
  const uniqueByLink = new Map<string, Article>();

  for (const article of items) {
    if (!uniqueByLink.has(article.link)) {
      uniqueByLink.set(article.link, article);
      continue;
    }

    const existing = uniqueByLink.get(article.link)!;
    if (
      new Date(article.publishedAt).getTime() >
      new Date(existing.publishedAt).getTime()
    ) {
      uniqueByLink.set(article.link, article);
    }
  }

  return [...uniqueByLink.values()]
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
    .slice(0, MAX_ITEMS);
}

async function fetchFeedArticles(
  url: string,
  country: CountryCode,
  category: Category
): Promise<Article[]> {
  try {
    const parsed = await withTimeout(parser.parseURL(url), FETCH_TIMEOUT_MS);
    const rawItems = parsed.items ?? [];

    const normalized = rawItems
      .map((item) => normalizeRssItem(item, { country, category }))
      .filter((item): item is Article => Boolean(item));

    return normalized;
  } catch {
    return [];
  }
}

export async function getNews(
  country: CountryCode,
  category: Category
): Promise<Article[]> {
  const cached = getCachedFeed(country, category);
  if (cached) {
    return cached;
  }

  const feeds = getFeedsFor(country, category);
  const results = await Promise.all(feeds.map((url) => fetchFeedArticles(url, country, category)));
  const merged = dedupeAndSort(results.flat());

  setCachedFeed(country, category, merged);
  return merged;
}

type ArticleLookupInput = {
  id: string;
  country?: CountryCode;
  category?: Category;
};

export async function getArticleById({
  id,
  country,
  category,
}: ArticleLookupInput): Promise<Article | null> {
  const fromArticleCache = getCachedArticle(id);
  if (fromArticleCache) {
    return fromArticleCache;
  }

  const fromFeedCache = findArticleInFeeds(id);
  if (fromFeedCache) {
    return fromFeedCache;
  }

  if (country && category) {
    const categoryItems = await getNews(country, category);
    const categoryHit = categoryItems.find((article) => article.id === id);
    if (categoryHit) {
      return categoryHit;
    }
  }

  if (country) {
    const categoriesToProbe: Category[] = [
      "Top",
      "Technology",
      "Business",
      "World",
      "Science",
      "Health",
    ];

    for (const categoryToProbe of categoriesToProbe) {
      const batch = await getNews(country, categoryToProbe);
      const hit = batch.find((article) => article.id === id);
      if (hit) {
        return hit;
      }
    }
  }

  return null;
}

function scoreArticle(article: Article, terms: string[]): number {
  const title = article.title.toLowerCase();
  const excerpt = article.excerpt?.toLowerCase() ?? "";
  const source = article.source.toLowerCase();

  let score = 0;
  for (const term of terms) {
    if (title.includes(term)) {
      score += 8;
    }
    if (excerpt.includes(term)) {
      score += 4;
    }
    if (source.includes(term)) {
      score += 1;
    }
  }

  return score;
}

export async function searchNews(
  query: string,
  country: CountryCode
): Promise<Article[]> {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery.length) {
    return [];
  }

  if (!hasCountryCache(country)) {
    await Promise.all([
      getNews(country, "Top"),
      getNews(country, "Technology"),
      getNews(country, "Business"),
    ]);
  }

  const terms = cleanQuery.split(/\s+/).filter(Boolean);
  const pool = getCountryArticles(country);

  return pool
    .map((article) => ({ article, score: scoreArticle(article, terms) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return (
        new Date(b.article.publishedAt).getTime() -
        new Date(a.article.publishedAt).getTime()
      );
    })
    .slice(0, 60)
    .map((entry) => entry.article);
}
