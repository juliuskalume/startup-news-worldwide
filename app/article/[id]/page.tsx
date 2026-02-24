import { notFound } from "next/navigation";
import { z } from "zod";
import { ReaderView } from "@/components/reader-view";
import { getArticleById, getNews } from "@/lib/news-service";
import { ArticleSchema } from "@/lib/schemas";
import {
  CATEGORIES,
  COUNTRY_CODES,
  type Article,
  type Category,
  type CountryCode,
} from "@/lib/types";

const SearchParamsSchema = z.object({
  country: z.enum(COUNTRY_CODES).optional(),
  category: z.enum(CATEGORIES).optional(),
  payload: z.string().optional(),
});

type ArticlePageProps = {
  params: {
    id: string;
  };
  searchParams: Record<string, string | string[] | undefined>;
};

export const dynamic = "force-dynamic";

function parsePayload(payload?: string): Article | null {
  if (!payload) {
    return null;
  }

  try {
    const parsed = JSON.parse(payload);
    return ArticleSchema.parse(parsed);
  } catch {
    try {
      const decoded = decodeURIComponent(payload);
      const parsed = JSON.parse(decoded);
      return ArticleSchema.parse(parsed);
    } catch {
      return null;
    }
  }
}

export default async function ArticlePage({
  params,
  searchParams,
}: ArticlePageProps): Promise<JSX.Element> {
  const parsedSearch = SearchParamsSchema.safeParse({
    country: searchParams.country,
    category: searchParams.category,
    payload: searchParams.payload,
  });

  const country = (parsedSearch.success ? parsedSearch.data.country : undefined) as
    | CountryCode
    | undefined;
  const category = (parsedSearch.success ? parsedSearch.data.category : undefined) as
    | Category
    | undefined;
  const payload = parsedSearch.success ? parsedSearch.data.payload : undefined;

  let article = await getArticleById({
    id: params.id,
    country,
    category,
  });

  if (!article) {
    article = parsePayload(payload);
  }

  if (!article) {
    notFound();
  }

  const recommendationsCountry = article.country ?? country ?? "US";
  const recommendationsCategory = article.category ?? category ?? "Top";

  const related = (await getNews(recommendationsCountry, recommendationsCategory))
    .filter((item) => item.id !== article.id)
    .slice(0, 3);

  return <ReaderView article={article} related={related} />;
}

