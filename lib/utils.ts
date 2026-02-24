import { Article } from "@/lib/types";

export function cn(...classes: Array<string | undefined | null | false>): string {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(dateIso: string): string {
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatRelativeTime(dateIso: string): string {
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }

  const now = Date.now();
  const diffMs = date.getTime() - now;
  const absMinutes = Math.round(Math.abs(diffMs) / 60_000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (absMinutes < 60) {
    return rtf.format(Math.round(diffMs / 60_000), "minute");
  }

  const absHours = Math.round(absMinutes / 60);
  if (absHours < 24) {
    return rtf.format(Math.round(diffMs / 3_600_000), "hour");
  }

  return rtf.format(Math.round(diffMs / 86_400_000), "day");
}

export function stripHtml(input: string): string {
  return input.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function buildArticleHref(article: Article): string {
  const payload = JSON.stringify({
    id: article.id,
    title: article.title,
    link: article.link,
    source: article.source,
    publishedAt: article.publishedAt,
    author: article.author,
    excerpt: article.excerpt,
    imageUrl: article.imageUrl,
    category: article.category,
    country: article.country,
    readTimeMin: article.readTimeMin,
  });

  const query = new URLSearchParams();
  if (article.country) {
    query.set("country", article.country);
  }
  if (article.category) {
    query.set("category", article.category);
  }
  query.set("payload", payload);

  return `/article/${article.id}?${query.toString()}`;
}

export function initials(name: string): string {
  const chunks = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() ?? "");

  return chunks.join("") || "SN";
}

