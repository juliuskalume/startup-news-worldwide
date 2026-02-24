"use client";

import Link from "next/link";
import { MaterialIcon } from "@/components/material-icon";
import { useNavigationLoader } from "@/components/providers/navigation-loader-provider";
import { buildPlaceholderUrl, getDisplayImageUrl } from "@/lib/image";
import { Article } from "@/lib/types";
import { buildArticleHref, formatRelativeTime } from "@/lib/utils";

type ArticleListCardProps = {
  article: Article;
  onRemove?: (articleId: string) => void;
};

export function ArticleListCard({
  article,
  onRemove,
}: ArticleListCardProps): JSX.Element {
  const imageSrc = getDisplayImageUrl(article.imageUrl, article.title);
  const fallbackImage = buildPlaceholderUrl(article.title);
  const { handleArticleClick } = useNavigationLoader();

  return (
    <article className="group rounded-3xl border border-border-light bg-background-light p-3 shadow-soft transition duration-300 hover:-translate-y-0.5 hover:shadow-card dark:border-[#1f2a40] dark:bg-[#10192c]">
      <div className="flex gap-3">
        <Link
          href={buildArticleHref(article)}
          onClick={handleArticleClick}
          className="focus-ring flex min-w-0 flex-1 gap-3 rounded-2xl"
        >
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-primary">
              <span>{article.source}</span>
              <span className="h-1 w-1 rounded-full bg-text-muted/40" />
              <span className="text-text-muted dark:text-[#8fa8d3]">
                {formatRelativeTime(article.publishedAt)}
              </span>
            </div>

            <h3 className="line-clamp-3 text-[15px] font-semibold leading-6 text-text-main transition group-hover:text-primary dark:text-[#edf3ff]">
              {article.title}
            </h3>

            <div className="mt-2 flex items-center gap-2 text-xs text-text-muted dark:text-[#8fa8d3]">
              {article.readTimeMin ? <span>{article.readTimeMin} min read</span> : null}
              {article.category ? (
                <span className="rounded-full bg-primary-light px-2 py-0.5 text-[11px] font-medium text-primary dark:bg-[#132845]">
                  {article.category}
                </span>
              ) : null}
            </div>
          </div>

          <div className="h-[92px] w-[108px] flex-shrink-0 overflow-hidden rounded-2xl bg-background-subtle dark:bg-[#17233a]">
            <img
              src={imageSrc}
              alt={article.title}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={(event) => {
                if (event.currentTarget.dataset.fallbackApplied === "true") {
                  return;
                }
                event.currentTarget.dataset.fallbackApplied = "true";
                event.currentTarget.src = fallbackImage;
              }}
            />
          </div>
        </Link>

        {onRemove ? (
          <details className="relative self-start">
            <summary className="focus-ring inline-flex h-9 w-9 list-none items-center justify-center rounded-xl border border-border-light text-text-muted transition hover:border-primary/50 hover:text-primary dark:border-[#243147] dark:text-[#95abd1]">
              <MaterialIcon name="more_vert" className="text-[19px]" />
            </summary>
            <button
              type="button"
              onClick={() => onRemove(article.id)}
              aria-label="Remove saved article"
              className="focus-ring absolute right-0 z-10 mt-2 inline-flex min-w-[120px] items-center gap-2 rounded-xl border border-border-light bg-background-light px-3 py-2 text-xs font-semibold text-text-main shadow-soft dark:border-[#243147] dark:bg-[#0e1728] dark:text-[#e7eefc]"
            >
              <MaterialIcon name="delete" className="text-[16px]" />
              Remove
            </button>
          </details>
        ) : null}
      </div>
    </article>
  );
}
