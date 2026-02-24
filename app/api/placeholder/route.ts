import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function escapeXml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function shortTitle(input: string): string {
  const clean = input.trim().replace(/\s+/g, " ");
  if (!clean.length) {
    return "Startup News";
  }

  if (clean.length <= 72) {
    return clean;
  }

  return `${clean.slice(0, 69)}...`;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const rawTitle = request.nextUrl.searchParams.get("title") ?? "Startup News";
  const title = shortTitle(rawTitle);
  const safeTitle = escapeXml(title);

  const svg = [
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 675'>",
    "<defs>",
    "<linearGradient id='bg' x1='0' y1='0' x2='1' y2='1'>",
    "<stop offset='0%' stop-color='#1cb0f6'/>",
    "<stop offset='100%' stop-color='#0d121b'/>",
    "</linearGradient>",
    "</defs>",
    "<rect width='1200' height='675' fill='url(#bg)'/>",
    "<circle cx='1060' cy='120' r='180' fill='rgba(255,255,255,0.12)'/>",
    "<circle cx='140' cy='620' r='220' fill='rgba(255,255,255,0.08)'/>",
    "<text x='72' y='160' fill='rgba(255,255,255,0.9)' font-size='34' font-family='Inter, Arial, sans-serif' font-weight='600'>Startup News Worldwide</text>",
    `<text x='72' y='340' fill='white' font-size='58' font-family='Inter, Arial, sans-serif' font-weight='700'>${safeTitle}</text>`,
    "</svg>",
  ].join("");

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}

