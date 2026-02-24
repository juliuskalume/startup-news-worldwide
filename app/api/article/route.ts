import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getArticleById } from "@/lib/news-service";
import { ArticleResponseSchema } from "@/lib/schemas";
import { CATEGORIES, COUNTRY_CODES } from "@/lib/types";

export const runtime = "nodejs";

const QuerySchema = z.object({
  id: z.string().min(4),
  country: z.enum(COUNTRY_CODES).optional(),
  category: z.enum(CATEGORIES).optional(),
});

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const parsed = QuerySchema.parse({
      id: request.nextUrl.searchParams.get("id") ?? undefined,
      country: request.nextUrl.searchParams.get("country") ?? undefined,
      category: request.nextUrl.searchParams.get("category") ?? undefined,
    });

    const item = await getArticleById(parsed);
    if (!item) {
      return NextResponse.json(
        { error: "Article not found" },
        {
          status: 404,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    const payload = ArticleResponseSchema.parse({ item });
    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "s-maxage=120, stale-while-revalidate=300",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to load article" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
