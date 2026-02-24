import { createHash } from "crypto";
import { Article, Category, CountryCode } from "@/lib/types";
import { stripHtml } from "@/lib/utils";

type RawEnclosure =
  | {
      url?: string;
      link?: string;
      href?: string;
      $?: {
        url?: string;
      };
    }
  | undefined;

type RawItem = Record<string, unknown> & {
  title?: string;
  link?: string;
  guid?: string;
  isoDate?: string;
  pubDate?: string;
  creator?: string;
  author?: string;
  content?: string;
  contentSnippet?: string;
  summary?: string;
  description?: string;
  enclosure?: RawEnclosure | RawEnclosure[];
  source?: {
    title?: string;
    value?: string;
  };
};

const IMG_REGEX = /<img[^>]+src=["']([^"']+)["'][^>]*>/i;

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&amp;/gi, "&")
    .replace(/&#0*38;/gi, "&")
    .replace(/&#x0*26;/gi, "&");
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length ? value.trim() : undefined;
}

function normalizeUrl(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  try {
    return new URL(decodeHtmlEntities(value)).toString();
  } catch {
    return undefined;
  }
}

function toIsoDate(dateInput?: string): string {
  if (!dateInput) {
    return new Date().toISOString();
  }

  const parsed = new Date(dateInput);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }

  return parsed.toISOString();
}

function hostnameFromUrl(link: string): string {
  try {
    const hostname = new URL(link).hostname.replace(/^www\./, "");
    const [primary] = hostname.split(".");
    return primary
      ?.split("-")
      .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
      .join(" ") || hostname;
  } catch {
    return "Unknown Source";
  }
}

function extractMediaUrl(mediaCandidate: unknown): string | undefined {
  if (!mediaCandidate) {
    return undefined;
  }

  if (Array.isArray(mediaCandidate)) {
    for (const entry of mediaCandidate) {
      const extracted = extractMediaUrl(entry);
      if (extracted) {
        return extracted;
      }
    }
    return undefined;
  }

  if (typeof mediaCandidate === "string") {
    return normalizeUrl(mediaCandidate);
  }

  if (typeof mediaCandidate === "object") {
    const record = mediaCandidate as Record<string, unknown>;
    const direct = asString(record.url) ?? asString(record.href) ?? asString(record.link);
    const nested =
      record.$ && typeof record.$ === "object"
        ? asString((record.$ as Record<string, unknown>).url)
        : undefined;

    return normalizeUrl(direct ?? nested);
  }

  return undefined;
}

function extractImageUrl(item: RawItem): string | undefined {
  const enclosureCandidate = extractMediaUrl(item.enclosure);
  if (enclosureCandidate) {
    return enclosureCandidate;
  }

  const mediaContent = extractMediaUrl(item["media:content"]);
  if (mediaContent) {
    return mediaContent;
  }

  const mediaThumbnail = extractMediaUrl(item["media:thumbnail"]);
  if (mediaThumbnail) {
    return mediaThumbnail;
  }

  const combinedHtml = [item.content, item.description, item.summary]
    .map((value) => asString(value) ?? "")
    .join(" ");

  const encodedHtml = asString(item["content:encoded"]);
  const fullHtml = encodedHtml ? `${combinedHtml} ${encodedHtml}` : combinedHtml;

  const match = fullHtml.match(IMG_REGEX);
  if (!match?.[1]) {
    return undefined;
  }

  return normalizeUrl(match[1]);
}

function extractSource(item: RawItem, link: string): { source: string; title: string } {
  let title = asString(item.title) ?? "Untitled";
  const sourceFromObject = asString(item.source?.title) ?? asString(item.source?.value);

  const isGoogleNewsLink = link.includes("news.google.com");
  if (isGoogleNewsLink && title.includes(" - ")) {
    const parts = title.split(" - ");
    const maybeSource = parts.pop();
    const maybeTitle = parts.join(" - ").trim();

    if (maybeSource && maybeTitle) {
      title = maybeTitle;
      return { source: maybeSource.trim(), title };
    }
  }

  const source = sourceFromObject ?? hostnameFromUrl(link);
  return { source, title };
}

function cleanExcerpt(item: RawItem): string | undefined {
  const candidate =
    asString(item.contentSnippet) ??
    asString(item.summary) ??
    asString(item.description) ??
    asString(item.content);

  if (!candidate) {
    return undefined;
  }

  const plain = stripHtml(candidate);
  if (!plain.length) {
    return undefined;
  }

  return plain.slice(0, 280);
}

function estimateReadTime(item: RawItem): number | undefined {
  const text = [item.content, item.description, item.summary, item.contentSnippet]
    .map((value) => asString(value) ?? "")
    .join(" ");
  const clean = stripHtml(text);
  if (!clean.length) {
    return undefined;
  }

  const wordCount = clean.split(/\s+/).filter(Boolean).length;
  if (!wordCount) {
    return undefined;
  }

  return Math.max(1, Math.round(wordCount / 220));
}

export function hashLink(link: string): string {
  return createHash("sha1").update(link).digest("hex").slice(0, 18);
}

export function normalizeRssItem(
  rawItem: RawItem,
  context: { category: Category; country: CountryCode }
): Article | undefined {
  const linkCandidate =
    asString(rawItem.link) ??
    asString(rawItem.guid) ??
    asString(rawItem["id"]) ??
    asString(rawItem["url"]);

  const link = normalizeUrl(linkCandidate);
  if (!link) {
    return undefined;
  }

  const { source, title } = extractSource(rawItem, link);
  const publishedAt = toIsoDate(asString(rawItem.isoDate) ?? asString(rawItem.pubDate));

  return {
    id: hashLink(link),
    title,
    link,
    source,
    publishedAt,
    author:
      asString(rawItem.author) ??
      asString(rawItem.creator) ??
      asString(rawItem["dc:creator"]),
    excerpt: cleanExcerpt(rawItem),
    imageUrl: extractImageUrl(rawItem),
    category: context.category,
    country: context.country,
    readTimeMin: estimateReadTime(rawItem),
  };
}
