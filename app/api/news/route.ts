import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getNews } from "@/lib/news-service";
import { NewsResponseSchema } from "@/lib/schemas";
import { CATEGORIES, COUNTRY_CODES } from "@/lib/types";

export const runtime = "nodejs";

const QuerySchema = z.object({
  country: z.enum(COUNTRY_CODES).default("US"),
  category: z.enum(CATEGORIES).default("Top"),
});

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { country, category } = QuerySchema.parse({
      country: request.nextUrl.searchParams.get("country") ?? undefined,
      category: request.nextUrl.searchParams.get("category") ?? undefined,
    });

    const items = await getNews(country, category);
    const payload = NewsResponseSchema.parse({ country, category, items });

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to load news right now" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
