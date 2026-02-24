"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArticleListCard } from "@/components/article-list-card";
import { BottomNav } from "@/components/bottom-nav";
import { MaterialIcon } from "@/components/material-icon";
import { Article, CountryCode } from "@/lib/types";
import { getStoredCountry } from "@/lib/storage";

type SearchResponse = {
  country: CountryCode;
  query: string;
  items: Article[];
};

export function SearchScreen(): JSX.Element {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState<CountryCode>("US");
  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCountry(getStoredCountry("US"));
  }, []);

  useEffect(() => {
    const cleanQuery = query.trim();
    if (cleanQuery.length < 2) {
      setItems([]);
      setLoading(false);
      setError(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(cleanQuery)}&country=${country}`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error("Search request failed");
        }

        const data = (await response.json()) as SearchResponse;
        setItems(data.items);
      } catch {
        setError("Search is currently unavailable. Please retry.");
        setItems([]);
      } finally {
        setLoading(false);
      }
    }, 260);

    return () => clearTimeout(timeoutId);
  }, [query, country]);

  const resultLabel = useMemo(() => {
    if (!query.trim()) {
      return "Type at least 2 characters to search global startup news";
    }

    if (loading) {
      return "Searching across recent feeds...";
    }

    if (error) {
      return error;
    }

    return `${items.length} result${items.length === 1 ? "" : "s"} in ${country}`;
  }, [query, loading, error, items.length, country]);

  return (
    <div className="relative min-h-screen pb-24">
      <header className="sticky top-0 z-30 border-b border-border-light bg-background-light/90 backdrop-blur dark:border-[#1d283d] dark:bg-[#081120]/90">
        <div className="mx-auto w-full max-w-3xl px-4 py-3 sm:px-6">
          <div className="mb-3 flex items-center justify-between">
            <h1 className="text-xl font-bold text-text-main dark:text-[#eaf2ff]">Search</h1>
            <Link
              href="/region"
              className="focus-ring inline-flex items-center gap-1 rounded-full border border-border-light bg-background-light px-3 py-1 text-xs font-semibold text-text-main dark:border-[#243147] dark:bg-[#0f1728] dark:text-[#d6e4fc]"
            >
              <MaterialIcon name="public" className="text-[16px]" />
              {country}
            </Link>
          </div>

          <label className="flex items-center gap-2 rounded-2xl border border-border-light bg-background-subtle px-3 py-2 dark:border-[#253247] dark:bg-[#101a2d]">
            <MaterialIcon name="search" className="text-text-muted dark:text-[#8fa8d2]" />
            <input
              aria-label="Search news"
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search startup, funding, technology"
              className="w-full bg-transparent text-sm text-text-main outline-none placeholder:text-text-muted dark:text-[#edf3ff] dark:placeholder:text-[#8fa8d2]"
            />
          </label>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl space-y-4 px-4 py-4 sm:px-6">
        <p className="text-sm text-text-muted dark:text-[#8fa8d2]">{resultLabel}</p>

        <section className="space-y-3">
          {items.map((article) => (
            <ArticleListCard key={article.id} article={article} />
          ))}
        </section>

        {!loading && query.trim().length >= 2 && !error && !items.length ? (
          <section className="rounded-3xl border border-border-light bg-background-light p-6 text-center shadow-soft dark:border-[#223148] dark:bg-[#10192c]">
            <h2 className="text-base font-semibold text-text-main dark:text-[#ebf2ff]">
              No matches found
            </h2>
            <p className="mt-2 text-sm text-text-muted dark:text-[#8ea6cf]">
              Try broader keywords like AI, funding, startup, or venture.
            </p>
          </section>
        ) : null}
      </main>

      <BottomNav />
    </div>
  );
}
