"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArticleListCard } from "@/components/article-list-card";
import { BottomNav } from "@/components/bottom-nav";
import { CategoryTabs } from "@/components/category-tabs";
import { CountryPickerModal } from "@/components/country-picker-modal";
import { HeaderBar } from "@/components/header-bar";
import { HeroArticleCard } from "@/components/hero-article-card";
import { useAuth } from "@/components/providers/auth-provider";
import { SkeletonCard } from "@/components/skeleton-card";
import { TrendingHorizontalRail } from "@/components/trending-horizontal-rail";
import {
  setStoredCountry,
  getStoredCountry,
  STORAGE_SYNC_EVENT,
  storageKeys,
  StorageSyncEventDetail,
} from "@/lib/storage";
import {
  Article,
  Category,
  CountryCode,
  HOME_CATEGORIES,
  CATEGORY_LABELS,
} from "@/lib/types";
import { cn } from "@/lib/utils";

type NewsResponse = {
  country: CountryCode;
  category: Category;
  items: Article[];
};

const PULL_MAX_DISTANCE = 132;
const PULL_REFRESH_THRESHOLD = 78;

function getPageScrollTop(): number {
  if (typeof window === "undefined") {
    return 0;
  }

  return (
    window.scrollY ||
    window.pageYOffset ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0
  );
}

export function HomeFeed(): JSX.Element {
  const router = useRouter();
  const { user } = useAuth();
  const [country, setCountry] = useState<CountryCode>("US");
  const [category, setCategory] = useState<Category>("Top");
  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isPulling, setIsPulling] = useState<boolean>(false);
  const [pullDistance, setPullDistance] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [countryModalOpen, setCountryModalOpen] = useState<boolean>(false);
  const pullStartYRef = useRef<number | null>(null);
  const canPullRef = useRef<boolean>(false);
  const itemsCountRef = useRef<number>(0);

  useEffect(() => {
    setCountry(getStoredCountry("US"));
  }, []);

  useEffect(() => {
    const handleStorageSync = (event: Event): void => {
      const customEvent = event as CustomEvent<StorageSyncEventDetail>;
      const detail = customEvent.detail;
      if (!detail?.keys.includes(storageKeys.country)) {
        return;
      }

      const nextCountry = getStoredCountry("US");
      setCountry((current) => (current === nextCountry ? current : nextCountry));
    };

    window.addEventListener(STORAGE_SYNC_EVENT, handleStorageSync as EventListener);
    return () => {
      window.removeEventListener(STORAGE_SYNC_EVENT, handleStorageSync as EventListener);
    };
  }, []);

  useEffect(() => {
    itemsCountRef.current = items.length;
  }, [items.length]);

  const loadNews = useCallback(
    async (
      activeCountry: CountryCode,
      activeCategory: Category,
      options?: { background?: boolean }
    ) => {
      const background = options?.background ?? false;
      if (background) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
        setError(null);
      }

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
        if (!background) {
          setError(null);
        }
      } catch {
        if (background) {
          if (!itemsCountRef.current) {
            setItems([]);
            setError("Unable to load feed right now. Please try again.");
          }
          return;
        }

        setItems([]);
        setError("Unable to load feed right now. Please try again.");
      } finally {
        if (background) {
          setIsRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    void loadNews(country, category);
  }, [country, category, loadNews]);

  const resetPullGesture = useCallback((): void => {
    pullStartYRef.current = null;
    canPullRef.current = false;
    setIsPulling(false);
    setPullDistance(0);
  }, []);

  const triggerPullRefresh = useCallback((): void => {
    if (loading || isRefreshing) {
      return;
    }

    void loadNews(country, category, { background: true });
  }, [category, country, isRefreshing, loadNews, loading]);

  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLDivElement>): void => {
      if (event.touches.length !== 1 || loading || isRefreshing) {
        return;
      }

      pullStartYRef.current = event.touches[0]?.clientY ?? null;
      canPullRef.current = getPageScrollTop() <= 1;
    },
    [isRefreshing, loading]
  );

  const handleTouchMove = useCallback(
    (event: React.TouchEvent<HTMLDivElement>): void => {
      if (!canPullRef.current || pullStartYRef.current === null) {
        return;
      }

      const activeY = event.touches[0]?.clientY;
      if (typeof activeY !== "number") {
        return;
      }

      const delta = activeY - pullStartYRef.current;
      if (delta <= 0 || getPageScrollTop() > 1) {
        if (isPulling) {
          setIsPulling(false);
          setPullDistance(0);
        }
        return;
      }

      if (event.cancelable) {
        event.preventDefault();
      }

      const nextDistance = Math.min(PULL_MAX_DISTANCE, delta * 0.42);
      setIsPulling(true);
      setPullDistance(nextDistance);
    },
    [isPulling]
  );

  const handleTouchEnd = useCallback((): void => {
    if (!isPulling) {
      resetPullGesture();
      return;
    }

    const shouldRefresh = pullDistance >= PULL_REFRESH_THRESHOLD;
    resetPullGesture();

    if (shouldRefresh) {
      triggerPullRefresh();
    }
  }, [isPulling, pullDistance, resetPullGesture, triggerPullRefresh]);

  const handleTouchCancel = useCallback((): void => {
    resetPullGesture();
  }, [resetPullGesture]);

  const pullProgress = Math.min(1, pullDistance / PULL_REFRESH_THRESHOLD);
  const showPullIndicator = isPulling || isRefreshing;
  const mainShiftY = isPulling ? pullDistance : isRefreshing ? 24 : 0;

  const hero = items[0];
  const latestItems = useMemo(() => items.slice(1), [items]);

  return (
    <div
      className="app-page-shell"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
    >
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

      <div
        aria-live="polite"
        className={cn(
          "pointer-events-none sticky top-[calc(var(--safe-area-top)+6.5rem)] z-20 flex justify-center transition-opacity duration-200",
          showPullIndicator ? "opacity-100" : "opacity-0"
        )}
      >
        <div
          className="mt-1 w-[min(19rem,92vw)] rounded-2xl border border-border-light bg-background-light/95 px-3 py-2 shadow-soft backdrop-blur dark:border-[#223148] dark:bg-[#10192c]/95"
          style={{
            transform: isPulling
              ? `translateY(${Math.min(18, pullDistance * 0.3)}px)`
              : undefined,
          }}
        >
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-text-main dark:text-[#ebf2ff]">
            <span
              className={cn("spinner-ring", isRefreshing ? "opacity-100" : "opacity-80")}
              style={
                isRefreshing
                  ? undefined
                  : { transform: `rotate(${Math.round(pullProgress * 290)}deg)` }
              }
            />
            <span>
              {isRefreshing
                ? "Refreshing feed..."
                : pullDistance >= PULL_REFRESH_THRESHOLD
                  ? "Release to refresh"
                  : "Pull to refresh"}
            </span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-primary/15 dark:bg-[#1a2b44]">
            <div
              className="h-full rounded-full bg-primary transition-all duration-100"
              style={{ width: `${Math.round(pullProgress * 100)}%` }}
            />
          </div>
        </div>
      </div>

      <main
        className="app-content-container space-y-5 py-4 transition-transform duration-200 lg:space-y-6 lg:py-6"
        style={{
          transform: mainShiftY ? `translateY(${mainShiftY}px)` : undefined,
        }}
      >
        {loading ? (
          <>
            <div className="grid gap-4 xl:grid-cols-[1.35fr_0.95fr]">
              <SkeletonCard hero />
              <SkeletonCard hero />
            </div>
            <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
              {Array.from({ length: 9 }).map((_, index) => (
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
            <section className="grid gap-4 xl:grid-cols-[1.35fr_0.95fr]">
              <div className="min-w-0 animate-riseIn">
                <HeroArticleCard article={hero} />
              </div>
              <div className="min-w-0 animate-riseIn [animation-delay:100ms]">
                <TrendingHorizontalRail items={items} />
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-end justify-between">
                <h2 className="text-xl font-bold text-text-main dark:text-[#edf3ff]">
                  Latest News
                </h2>
                <span className="text-xs font-medium text-text-muted dark:text-[#8ea6cf]">
                  {country} . {CATEGORY_LABELS[category]}
                </span>
              </div>

              <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
                {latestItems.map((article, index) => (
                  <div
                    key={article.id}
                    className="animate-riseIn"
                    style={{ animationDelay: `${Math.min(index, 12) * 45}ms` }}
                  >
                    <ArticleListCard article={article} />
                  </div>
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

        <footer className="animate-riseIn rounded-3xl border border-border-light bg-background-light p-5 shadow-soft dark:border-[#223148] dark:bg-[#10192c]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                App Purpose
              </p>
              <h2 className="mt-1 text-xl font-bold text-text-main dark:text-[#edf3ff]">
                Startup News Worldwide helps you follow global startup, tech, and business news in one place.
              </h2>
              <p className="mt-2 text-sm leading-6 text-text-muted dark:text-[#8ea6cf]">
                We aggregate headlines from trusted public sources by region and category,
                and provide reader-friendly browsing, search, and bookmarking.
              </p>
            </div>
            {!user ? (
              <Link
                href="/profile"
                className="focus-ring inline-flex items-center justify-center rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95"
              >
                Sign in to sync
              </Link>
            ) : null}
          </div>

          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-text-muted dark:text-[#8ea6cf]">
            <li>Read worldwide startup and technology updates by country and category.</li>
            <li>Save articles and personalize your region, theme, and reader text size.</li>
            <li>
              If you sign in with Google or email, we use your account only for authentication and optional cloud sync of your preferences.
            </li>
          </ul>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Link
              href="/privacy"
              className="focus-ring inline-flex items-center justify-center rounded-full border border-border-light px-3 py-1.5 text-xs font-semibold text-text-main transition hover:border-primary/40 dark:border-[#2b3953] dark:text-[#e7eefc]"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="focus-ring inline-flex items-center justify-center rounded-full border border-border-light px-3 py-1.5 text-xs font-semibold text-text-main transition hover:border-primary/40 dark:border-[#2b3953] dark:text-[#e7eefc]"
            >
              Terms of Service
            </Link>
          </div>
        </footer>
      </main>

      <BottomNav />
    </div>
  );
}
