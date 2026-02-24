"use client";

import Link from "next/link";
import { useNavigationLoader } from "@/components/providers/navigation-loader-provider";
import { getDisplayImageUrl } from "@/lib/image";
import { Article } from "@/lib/types";
import { buildArticleHref, formatDate, formatRelativeTime } from "@/lib/utils";

type HeroArticleCardProps = {
  article: Article;
};

export function HeroArticleCard({ article }: HeroArticleCardProps): JSX.Element {
  const imageSrc = getDisplayImageUrl(article.imageUrl, article.title);
  const { handleArticleClick } = useNavigationLoader();

  return (
    <Link
      href={buildArticleHref(article)}
      onClick={handleArticleClick}
      className="group block overflow-hidden rounded-3xl border border-border-light bg-background-light shadow-soft transition duration-300 hover:-translate-y-0.5 hover:shadow-card dark:border-[#1f2a40] dark:bg-[#10192c]"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-3xl bg-gradient-to-br from-primary/20 via-primary-light to-background-subtle dark:from-[#1a2d47] dark:via-[#101c30] dark:to-[#0d1728]">
        <img
          src={imageSrc}
          alt={article.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
          loading="lazy"
        />

        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
          <span className="rounded-full bg-[#ff4b55] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            Breaking
          </span>
          <span className="rounded-full bg-black/35 px-2 py-1 text-[11px] font-medium text-white backdrop-blur">
            {formatDate(article.publishedAt)}
          </span>
        </div>
      </div>

      <div className="space-y-3 p-4 sm:p-5">
        <h2 className="line-clamp-3 text-xl font-bold leading-tight text-text-main transition group-hover:text-primary dark:text-[#edf3ff]">
          {article.title}
        </h2>
        {article.excerpt ? (
          <p className="line-clamp-2 text-sm leading-6 text-text-muted dark:text-[#9eb4dd]">
            {article.excerpt}
          </p>
        ) : null}

        <div className="flex items-center justify-between text-xs text-text-muted dark:text-[#8ca5cf]">
          <span>{article.source}</span>
          <span>{formatRelativeTime(article.publishedAt)}</span>
        </div>
      </div>
    </Link>
  );
}
