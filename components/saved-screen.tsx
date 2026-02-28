"use client";

import { useEffect, useState } from "react";
import { ArticleListCard } from "@/components/article-list-card";
import { BottomNav } from "@/components/bottom-nav";
import {
  getSavedArticles,
  removeSavedArticle,
  STORAGE_SYNC_EVENT,
  storageKeys,
  StorageSyncEventDetail,
} from "@/lib/storage";
import { Article } from "@/lib/types";

export function SavedScreen(): JSX.Element {
  const [items, setItems] = useState<Article[]>([]);

  useEffect(() => {
    setItems(getSavedArticles());

    const sync = (): void => {
      setItems(getSavedArticles());
    };

    const syncFromStorageEvent = (event: Event): void => {
      const customEvent = event as CustomEvent<StorageSyncEventDetail>;
      const detail = customEvent.detail;
      if (!detail?.keys.includes(storageKeys.saved)) {
        return;
      }

      sync();
    };

    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);
    window.addEventListener(STORAGE_SYNC_EVENT, syncFromStorageEvent as EventListener);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
      window.removeEventListener(STORAGE_SYNC_EVENT, syncFromStorageEvent as EventListener);
    };
  }, []);

  const handleRemove = (articleId: string): void => {
    removeSavedArticle(articleId);
    setItems((current) => current.filter((item) => item.id !== articleId));
  };

  return (
    <div className="app-page-shell">
      <header className="sticky top-0 z-30 border-b border-border-light bg-background-light/90 backdrop-blur dark:border-[#1d283d] dark:bg-[#081120]/90">
        <div className="app-content-container safe-top-container">
          <h1 className="text-xl font-bold text-text-main dark:text-[#ebf2ff]">Saved Articles</h1>
          <p className="mt-1 text-sm text-text-muted dark:text-[#8fa8d2]">
            Stored on this device ({items.length})
          </p>
        </div>
      </header>

      <main className="app-content-container py-4 lg:py-6">
        {items.length ? (
          <section className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
            {items.map((article) => (
              <ArticleListCard
                key={article.id}
                article={article}
                onRemove={handleRemove}
              />
            ))}
          </section>
        ) : (
          <section className="rounded-3xl border border-border-light bg-background-light p-6 text-center shadow-soft dark:border-[#223148] dark:bg-[#10192c]">
            <h2 className="text-base font-semibold text-text-main dark:text-[#ebf2ff]">
              No saved stories yet
            </h2>
            <p className="mt-2 text-sm text-text-muted dark:text-[#8ea6cf]">
              Bookmark articles from feed or reader view and they will appear here.
            </p>
          </section>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
