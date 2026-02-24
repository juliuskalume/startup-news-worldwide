import { Category, CountryCode } from "@/lib/types";

type FeedMap = Partial<Record<Category, string[]>>;

type LocaleConfig = {
  hl: string;
  gl: string;
  ceid: string;
};

const GOOGLE_NEWS_LOCALES: Record<CountryCode, LocaleConfig> = {
  US: { hl: "en-US", gl: "US", ceid: "US:en" },
  UK: { hl: "en-GB", gl: "GB", ceid: "GB:en" },
  DE: { hl: "de", gl: "DE", ceid: "DE:de" },
  FR: { hl: "fr", gl: "FR", ceid: "FR:fr" },
  TR: { hl: "tr", gl: "TR", ceid: "TR:tr" },
  IN: { hl: "en-IN", gl: "IN", ceid: "IN:en" },
  NG: { hl: "en-NG", gl: "NG", ceid: "NG:en" },
  KE: { hl: "en-KE", gl: "KE", ceid: "KE:en" },
  BR: { hl: "pt-BR", gl: "BR", ceid: "BR:pt-419" },
  CA: { hl: "en-CA", gl: "CA", ceid: "CA:en" },
  AU: { hl: "en-AU", gl: "AU", ceid: "AU:en" },
  JP: { hl: "ja", gl: "JP", ceid: "JP:ja" },
};

const GOOGLE_TOPIC_MAP: Record<Category, string | null> = {
  Top: null,
  World: "WORLD",
  Technology: "TECHNOLOGY",
  Business: "BUSINESS",
  Science: "SCIENCE",
  Health: "HEALTH",
  Funding: "BUSINESS",
  Startups: "BUSINESS",
};

const GLOBAL_FEEDS: FeedMap = {
  Top: [
    "https://techcrunch.com/feed/",
    "https://venturebeat.com/feed/",
    "https://www.theverge.com/rss/index.xml",
    "https://hnrss.org/frontpage",
    "https://tech.eu/feed/",
    "https://www.eu-startups.com/feed/",
  ],
  Technology: [
    "https://techcrunch.com/feed/",
    "https://venturebeat.com/category/ai/feed/",
    "https://www.theverge.com/tech/rss/index.xml",
    "https://hnrss.org/newest?count=40",
  ],
  Business: [
    "https://techcrunch.com/category/startups/feed/",
    "https://venturebeat.com/category/business/feed/",
    "https://www.eu-startups.com/feed/",
  ],
  World: ["https://www.aljazeera.com/xml/rss/all.xml"],
  Science: ["https://www.sciencedaily.com/rss/top/science.xml"],
  Health: ["https://www.sciencedaily.com/rss/health_medicine.xml"],
  Funding: [
    "https://techcrunch.com/category/startups/feed/",
    "https://www.eu-startups.com/feed/",
  ],
  Startups: [
    "https://techcrunch.com/category/startups/feed/",
    "https://tech.eu/feed/",
    "https://www.eu-startups.com/feed/",
  ],
};

const COUNTRY_FEEDS: Partial<Record<CountryCode, FeedMap>> = {
  US: {
    Top: ["https://news.ycombinator.com/rss"],
    Technology: ["https://www.engadget.com/rss.xml"],
    Business: ["https://www.cnbc.com/id/10001147/device/rss/rss.html"],
  },
  UK: {
    Top: ["http://feeds.bbci.co.uk/news/rss.xml"],
    Technology: ["http://feeds.bbci.co.uk/news/technology/rss.xml"],
    Business: ["http://feeds.bbci.co.uk/news/business/rss.xml"],
  },
  TR: {
    Top: ["https://www.dailysabah.com/rss"],
    Business: ["https://www.aa.com.tr/tr/rss/default?cat=ekonomi"],
  },
  IN: {
    Top: ["https://www.thehindu.com/news/international/feeder/default.rss"],
    Business: ["https://www.moneycontrol.com/rss/business.xml"],
    Technology: ["https://www.gadgets360.com/rss/news"],
  },
  NG: {
    Top: ["https://techcabal.com/feed/"],
    Business: ["https://businessday.ng/feed/"],
    Technology: ["https://techpoint.africa/feed/"],
  },
  KE: {
    Top: ["https://www.standardmedia.co.ke/rss/headlines.php"],
    Business: ["https://www.businessdailyafrica.com/bd/business?view=RSS"],
    Technology: ["https://techweez.com/feed/"],
  },
};

function googleNewsTopFeed(country: CountryCode): string {
  const locale = GOOGLE_NEWS_LOCALES[country];
  return `https://news.google.com/rss?hl=${locale.hl}&gl=${locale.gl}&ceid=${locale.ceid}`;
}

function googleNewsTopicFeed(country: CountryCode, category: Category): string | null {
  const locale = GOOGLE_NEWS_LOCALES[country];
  const topic = GOOGLE_TOPIC_MAP[category];
  if (!topic) {
    return null;
  }

  return `https://news.google.com/rss/headlines/section/topic/${topic}?hl=${locale.hl}&gl=${locale.gl}&ceid=${locale.ceid}`;
}

export function getFeedsFor(country: CountryCode, category: Category): string[] {
  const urls = new Set<string>();

  for (const url of GLOBAL_FEEDS[category] ?? []) {
    urls.add(url);
  }

  if (category === "Top") {
    for (const url of GLOBAL_FEEDS.Startups ?? []) {
      urls.add(url);
    }
    urls.add(googleNewsTopFeed(country));
  } else {
    const topicFeed = googleNewsTopicFeed(country, category);
    if (topicFeed) {
      urls.add(topicFeed);
    }
  }

  for (const url of COUNTRY_FEEDS[country]?.[category] ?? []) {
    urls.add(url);
  }

  if (category !== "Top") {
    for (const url of COUNTRY_FEEDS[country]?.Top ?? []) {
      urls.add(url);
    }
  }

  return [...urls];
}
