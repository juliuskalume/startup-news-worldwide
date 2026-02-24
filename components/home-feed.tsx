"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArticleListCard } from "@/components/article-list-card";
import { BottomNav } from "@/components/bottom-nav";
import { CategoryTabs } from "@/components/category-tabs";
import { CountryPickerModal } from "@/components/country-picker-modal";
import { HeaderBar } from "@/components/header-bar";
import { HeroArticleCard } from "@/components/hero-article-card";
import { SkeletonCard } from "@/components/skeleton-card";
import { TrendingHorizontalRail } from "@/components/trending-horizontal-rail";
import { setStoredCountry, getStoredCountry } from "@/lib/storage";
import {
  Article,
  Category,
  CountryCode,
  HOME_CATEGORIES,
  CATEGORY_LABELS,
} from "@/lib/types";

type NewsResponse = {
  country: CountryCode;
  category: Category;
  items: Article[];
};

export function HomeFeed(): JSX.Element {
  const router = useRouter();
  const [country, setCountry] = useState<CountryCode>("US");
  const [category, setCategory] = useState<Category>("Top");
  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [countryModalOpen, setCountryModalOpen] = useState<boolean>(false);

  useEffect(() => {
    setCountry(getStoredCountry("US"));
  }, []);

  const loadNews = useCallback(
    async (activeCountry: CountryCode, activeCategory: Category) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/news?country=${activeCountry}&category=${activeCategory}`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error("Failed to load news feed");
        }

        const data = (await response.json()) as NewsResponse;
        setItems(data.items);
      } catch {
        setItems([]);
        setError("Unable to load feed right now. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    void loadNews(country, category);
  }, [country, category, loadNews]);

  const hero = items[0];
  const latestItems = useMemo(() => items.slice(1), [items]);

  return (
    <div className="relative min-h-screen pb-24">
      <HeaderBar
        country={country}
        onCountryClick={() => setCountryModalOpen(true)}
        onSearchClick={() => router.push("/search")}
      />
      <CategoryTabs
        categories={HOME_CATEGORIES}
        active={category}
        onChange={setCategory}
      />

      <CountryPickerModal
        open={countryModalOpen}
        selected={country}
        onClose={() => setCountryModalOpen(false)}
        onSelect={(nextCountry) => {
          setCountry(nextCountry);
          setStoredCountry(nextCountry);
        }}
      />

      <main className="mx-auto w-full max-w-3xl space-y-5 px-4 py-4 sm:px-6">
        {loading ? (
          <>
            <SkeletonCard hero />
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          </>
        ) : null}

        {!loading && error ? (
          <section className="rounded-3xl border border-border-light bg-background-light p-6 text-center shadow-soft dark:border-[#223148] dark:bg-[#10192c]">
            <h2 className="mb-2 text-lg font-semibold text-text-main dark:text-[#ebf2ff]">
              Feed unavailable
            </h2>
            <p className="mb-4 text-sm text-text-muted dark:text-[#8da5ce]">{error}</p>
            <button
              type="button"
              onClick={() => void loadNews(country, category)}
              className="focus-ring inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:brightness-95"
            >
              Retry
            </button>
          </section>
        ) : null}

        {!loading && !error && hero ? (
          <>
            <HeroArticleCard article={hero} />

            <TrendingHorizontalRail items={items} />

            <section>
              <div className="mb-3 flex items-end justify-between">
                <h2 className="text-xl font-bold text-text-main dark:text-[#edf3ff]">
                  Latest News
                </h2>
                <span className="text-xs font-medium text-text-muted dark:text-[#8ea6cf]">
                  {country} . {CATEGORY_LABELS[category]}
                </span>
              </div>

              <div className="space-y-3">
                {latestItems.map((article) => (
                  <ArticleListCard key={article.id} article={article} />
                ))}
              </div>
            </section>
          </>
        ) : null}

        {!loading && !error && !hero ? (
          <section className="rounded-3xl border border-border-light bg-background-light p-6 text-center shadow-soft dark:border-[#223148] dark:bg-[#10192c]">
            <h2 className="text-lg font-semibold text-text-main dark:text-[#edf3ff]">
              No stories yet
            </h2>
            <p className="mt-2 text-sm text-text-muted dark:text-[#8ea6cf]">
              Try another category or region.
            </p>
          </section>
        ) : null}
      </main>

      <BottomNav />
    </div>
  );
}
