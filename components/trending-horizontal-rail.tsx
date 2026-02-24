"use client";

import Link from "next/link";
import { useNavigationLoader } from "@/components/providers/navigation-loader-provider";
import { Article } from "@/lib/types";
import { buildArticleHref, formatRelativeTime } from "@/lib/utils";

type TrendingHorizontalRailProps = {
  items: Article[];
};

export function TrendingHorizontalRail({
  items,
}: TrendingHorizontalRailProps): JSX.Element | null {
  const { handleArticleClick } = useNavigationLoader();

  if (!items.length) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-[#263247] bg-[#0e1728] p-4 text-[#e6edfc] shadow-soft">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#78c9ff]">
          Trending
        </h2>
        <span className="text-xs text-[#90a7ce]">Dark mode rail</span>
      </div>

      <div className="flex snap-x gap-3 overflow-x-auto pb-1 xl:grid xl:grid-cols-1 xl:overflow-visible xl:pb-0">
        {items.slice(0, 8).map((article, index) => (
          <Link
            key={article.id}
            href={buildArticleHref(article)}
            onClick={handleArticleClick}
            className="group min-w-[210px] snap-start rounded-2xl border border-[#23334d] bg-[#121f34] p-3 transition hover:border-primary/60 xl:min-w-0 animate-riseIn"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-[#e9f1ff] group-hover:text-[#88d6ff]">
              {article.title}
            </h3>
            <div className="mt-3 flex items-center justify-between text-[11px] text-[#8ea6cf]">
              <span className="max-w-[110px] truncate">{article.source}</span>
              <span>{formatRelativeTime(article.publishedAt)}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
