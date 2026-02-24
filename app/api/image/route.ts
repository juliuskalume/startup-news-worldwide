import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function fallbackSvg(): string {
  return [
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 675'>",
    "<defs>",
    "<linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>",
    "<stop offset='0%' stop-color='#1cb0f6'/>",
    "<stop offset='100%' stop-color='#0d121b'/>",
    "</linearGradient>",
    "</defs>",
    "<rect width='1200' height='675' fill='url(#g)'/>",
    "<text x='80' y='340' fill='white' font-size='62' font-family='Inter, Arial, sans-serif' font-weight='700'>Startup News</text>",
    "<text x='80' y='408' fill='rgba(255,255,255,0.9)' font-size='42' font-family='Inter, Arial, sans-serif'>Worldwide</text>",
    "</svg>",
  ].join("");
}

function buildFallbackResponse(): NextResponse {
  return new NextResponse(fallbackSvg(), {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const urlParam = request.nextUrl.searchParams.get("url");
  if (!urlParam) {
    return buildFallbackResponse();
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(urlParam);
    if (!/^https?:$/i.test(targetUrl.protocol)) {
      return buildFallbackResponse();
    }
  } catch {
    return buildFallbackResponse();
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const upstream = await fetch(targetUrl.toString(), {
      signal: controller.signal,
      headers: {
        "User-Agent": "StartupNewsWorldwide/1.0",
        Accept: "image/avif,image/webp,image/*,*/*;q=0.8",
      },
      redirect: "follow",
      cache: "no-store",
    });

    if (!upstream.ok) {
      return buildFallbackResponse();
    }

    const contentType = upstream.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().startsWith("image/")) {
      return buildFallbackResponse();
    }

    const bytes = await upstream.arrayBuffer();
    if (!bytes.byteLength || bytes.byteLength > 12_000_000) {
      return buildFallbackResponse();
    }

    return new NextResponse(bytes, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return buildFallbackResponse();
  } finally {
    clearTimeout(timeoutId);
  }
}

