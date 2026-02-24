import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { searchNews } from "@/lib/news-service";
import { SearchResponseSchema } from "@/lib/schemas";
import { COUNTRY_CODES } from "@/lib/types";

export const runtime = "nodejs";

const QuerySchema = z.object({
  q: z.string().default(""),
  country: z.enum(COUNTRY_CODES).default("US"),
});

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { q, country } = QuerySchema.parse({
      q: request.nextUrl.searchParams.get("q") ?? undefined,
      country: request.nextUrl.searchParams.get("country") ?? undefined,
    });

    const items = await searchNews(q, country);
    const payload = SearchResponseSchema.parse({
      country,
      query: q,
      items,
    });

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "s-maxage=120, stale-while-revalidate=300",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to complete search" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
