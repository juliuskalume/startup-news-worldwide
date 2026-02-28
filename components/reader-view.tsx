"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/material-icon";
import { useNavigationLoader } from "@/components/providers/navigation-loader-provider";
import { buildPlaceholderUrl, getDisplayImageUrl } from "@/lib/image";
import {
  getReaderTextSize,
  isSavedArticle,
  STORAGE_SYNC_EVENT,
  storageKeys,
  StorageSyncEventDetail,
  setReaderTextSize,
  toggleSavedArticle,
} from "@/lib/storage";
import { Article } from "@/lib/types";
import { buildArticleHref, cn, formatDate } from "@/lib/utils";

type ReaderViewProps = {
  article: Article;
  related: Article[];
};

const BODY_SIZE_CLASSES = [
  "text-[17px] leading-8",
  "text-[19px] leading-9",
  "text-[21px] leading-10",
] as const;

function buildParagraphs(article: Article): string[] {
  const excerpt = article.excerpt?trim();

  if (!excerpt) {
    return [
      `${article.title} is one of the latest stories in startup and technology news across ${article.country ?? "global markets"}.`,
      `This reader view is optimized for quick scanning, saved bookmarks, and sharing. Open the source link for full original reporting and context from ${article.source}.`,
      `As more publishers are added to the feed map, this page can surface richer story text, insights, and related recommendations.`
    ];
  }

  const firstChunk = excerpt;
  return [
    firstChunk,
    `Published by ${article.source} on ${formatDate(article.publishedAt)}, this story highlights current developments in ${article.category ?? "startup"} news.`,
    "For complete details, factual nuance, and updates, continue reading on the original publisher website through the source link."
  ];
}

export function ReaderView({ article, related }: ReaderViewProps): JSX.Element {
  const router = useRouter();
  const { handleArticleClick, startLoading, stopLoading } = useNavigationLoader();
  const [textSize, setTextSize] = useState<number>(getReaderTextSize());
  const [saved, setSaved] = useState<boolean>(isSavedArticle(article.id));
  const [shareHint, setShareHint] = useState<string>("");
  const sourceLoadTimeoutRef = useRef<number | null>(null);

  const paragraphs = useMemo(() => buildParagraphs(article), [article]);
  const imageSrc = getDisplayImageUrl(article.imageUrl, article.title);
  const fallbackImage = buildPlaceholderUrl(article.title);

  useEffect(() => {
    return () => {
      if (sourceLoadTimeoutRef.current) {
        window.clearTimeout(sourceLoadTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleStorageSync = (event: Event): void => {
      const customEvent = event as CustomEvent<StorageSyncEventDetail>;
      const detail = customEvent.detail;
      if (!detail) {
        return;
      }

      if (detail.keys.includes(storageKeys.readerSize)) {
        setTextSize(getReaderTextSize());
      }

      if (detail.keys.includes(storageKeys.saved)) {
        setSaved(isSavedArticle(article.id));
      }
    };

    window.addEventListener(STORAGE_SYNC_EVENT, handleStorageSync as EventListener);
    return () => {
      window.removeEventListener(STORAGE_SYNC_EVENT, handleStorageSync as EventListener);
    };
  }, [article.id]);

  const onIncreaseSize = (): void => {
    setTextSize((current) => {
      const next = Math.min(2, current + 1);
      setReaderTextSize(next);
      return next;
    });
  };

  const onDecreaseSize = (): void => {
    setTextSize((current) => {
      const next = Math.max(0, current - 1);
      setReaderTextSize(next);
      return next;
    });
  };

  const onToggleBookmark = (): void => {
    const next = toggleSavedArticle(article);
    setSaved(next);
  };

  const onShare = async (): Promise<void> => {
    try {
      const shareUrl = typeof window !== "undefined" ? window.location.href : article.link;

      if (navigator.share) {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: shareUrl,
        });
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      setShareHint("Link copied");
      setTimeout(() => setShareHint(""), 2000);
    } catch {
      setShareHint("Share unavailable");
      setTimeout(() => setShareHint(""), 2000);
    }
  };

  const onOpenOriginalSource = (): void => {
    startLoading();

    if (sourceLoadTimeoutRef.current) {
      window.clearTimeout(sourceLoadTimeoutRef.current);
    }

    sourceLoadTimeoutRef.current = window.setTimeout(() => {
      stopLoading();
      sourceLoadTimeoutRef.current = null;
    }, 1800);
  };

  return (
    <div className="app-page-shell app-page-shell-reader bg-background-light dark:bg-[#070f1c]">
      <header className="sticky top-0 z-30 border-b border-border-light bg-background-light/90 backdrop-blur dark:border-[#1d283d] dark:bg-[#081120]/90">
        <div className="app-content-container safe-top-container flex items-center justify-between">
          <button
            type="button"
            aria-label="Go back"
            onClick={() => router.back()}
            className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border-light text-text-main dark:border-[#233249] dark:text-[#e7eefc]"
          >
            <MaterialIcon name="arrow_back" className="text-[20px]" />
          </button>
          <p className="text-sm font-semibold text-text-muted dark:text-[#8fa8d2]">Reader View</p>
          <button
            type="button"
            aria-label="More options"
            className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border-light text-text-main dark:border-[#233249] dark:text-[#e7eefc]"
          >
            <MaterialIcon name="more_horiz" className="text-[20px]" />
          </button>
        </div>
      </header>

      <main className="app-content-container grid gap-6 py-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)] xl:items-start xl:py-6">
        <article className="overflow-hidden rounded-3xl border border-border-light bg-background-light shadow-soft dark:border-[#223148] dark:bg-[#10192c]">
          <div className="aspect-[16/9] w-full overflow-hidden bg-background-subtle dark:bg-[#17233a]">
            <img
              src={imageSrc}
              alt={article.title}
              className="h-full w-full object-cover"
              onError={(event) => {
                if (event.currentTarget.dataset.fallbackApplied === "true") {
                  return;
                }
                event.currentTarget.dataset.fallbackApplied = "true";
                event.currentTarget.src = fallbackImage;
              }}
            />
          </div>

          <div className="space-y-4 p-5">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-text-muted dark:text-[#8ea6cf]">
              <span className="rounded-full bg-primary-light px-2 py-1 text-primary dark:bg-[#132845]">
                {article.category ?? "Top"}
              </span>
              <span>{article.source}</span>
              <span>-</span>
              <span>{formatDate(article.publishedAt)}</span>
            </div>

            <h1 className="text-3xl font-bold leading-tight text-text-main dark:text-[#edf4ff]">
              {article.title}
            </h1>

            <div className={cn("font-serif text-[#17233a] dark:text-[#d8e5fb]", BODY_SIZE_CLASSES[textSize])}>
              {paragraphs.map((paragraph, index) => (
                <p
                  key={`${article.id}-${index}`}
                  className={cn("mt-4", index === 0 ? "drop-cap" : "")}
                >
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <span className="rounded-full border border-border-light px-3 py-1 text-xs text-text-muted dark:border-[#2b3953] dark:text-[#94abd4]">
                #{article.category ?? "Top"}
              </span>
              {article.country ? (
                <span className="rounded-full border border-border-light px-3 py-1 text-xs text-text-muted dark:border-[#2b3953] dark:text-[#94abd4]">
                  #{article.country}
                </span>
              ) : null}
              <a
                href={article.link}
                target="_blank"
                rel="noreferrer"
                onClick={onOpenOriginalSource}
                className="focus-ring rounded-full border border-border-light px-3 py-1 text-xs font-semibold text-primary dark:border-[#2b3953]"
              >
                Original source
              </a>
            </div>
          </div>
        </article>

        <section className="xl:sticky xl:top-28">
          <h2 className="mb-3 text-lg font-semibold text-text-main dark:text-[#ebf2ff]">
            Read next
          </h2>
          <div className="space-y-3">
            {related.map((nextArticle) => (
              <Link
                key={nextArticle.id}
                href={buildArticleHref(nextArticle)}
                onClick={handleArticleClick}
                className="block rounded-2xl border border-border-light bg-background-light p-3 shadow-soft transition hover:border-primary/50 dark:border-[#223148] dark:bg-[#10192c]"
              >
                <p className="line-clamp-2 text-sm font-semibold text-text-main dark:text-[#e8f0ff]">
                  {nextArticle.title}
                </p>
                <p className="mt-2 text-xs text-text-muted dark:text-[#8ea6cf]">
                  {nextArticle.source}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <div className="safe-bottom-floating fixed inset-x-0 bottom-0 z-40 px-4">
        <div className="mx-auto flex w-full max-w-md items-center justify-between rounded-2xl border border-border-light bg-background-light/95 px-3 py-2 shadow-soft backdrop-blur dark:border-[#223148] dark:bg-[#0d1728]/95">
          <button
            type="button"
            aria-label="Toggle bookmark"
            onClick={onToggleBookmark}
            className={cn(
              "focus-ring inline-flex h-10 w-10 items-center justify-center rounded-xl transition",
              saved ? "bg-primary-light text-primary dark:bg-[#132845]" : "text-text-main dark:text-[#dce8ff]"
            )}
          >
            <MaterialIcon name={saved ? "bookmark" : "bookmark_add"} className="text-[20px]" />
          </button>

          <div className="inline-flex items-center rounded-xl border border-border-light px-1 dark:border-[#243147]">
            <button
              type="button"
              aria-label="Decrease text size"
              onClick={onDecreaseSize}
              className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold text-text-main dark:text-[#dce8ff]"
            >
              A-
            </button>
            <button
              type="button"
              aria-label="Increase text size"
              onClick={onIncreaseSize}
              className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold text-text-main dark:text-[#dce8ff]"
            >
              A+
            </button>
          </div>

          <button
            type="button"
            aria-label="Share article"
            onClick={() => void onShare()}
            className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-xl text-text-main dark:text-[#dce8ff]"
          >
            <MaterialIcon name="share" className="text-[20px]" />
          </button>

          <button
            type="button"
            aria-label="Comments"
            className="focus-ring relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-text-main dark:text-[#dce8ff]"
          >
            <MaterialIcon name="chat" className="text-[20px]" />
            <span className="hidden absolute -right-1 -top-1 h-4 min-w-4 items-center justify-center rounded-full bg-[#ff4b55] px-1 text-[10px] font-semibold text-white">
              0
            </span>
          </button>
        </div>
        {shareHint ? (
          <p className="mt-2 text-center text-xs font-medium text-text-muted dark:text-[#8ea6cf]">
            {shareHint}
          </p>
        ) : null}
      </div>
    </div>
  );
}
