import { Category, CountryCode } from "@/lib/types";

type FeedMap = Partial<Record<Category, string[]>>;

type LocaleConfig = {
  hl: string;
  gl: string;
  ceid: string;
};

const MAX_FEEDS_PER_REQUEST = 18;
const MAX_GOOGLE_SEARCH_FEEDS_PER_CATEGORY = 3;

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
  ZA: { hl: "en-ZA", gl: "ZA", ceid: "ZA:en" },
  MA: { hl: "fr", gl: "MA", ceid: "MA:fr" },
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

const GOOGLE_SEARCH_QUERY_MAP: Record<Category, string[]> = {
  Top: [
    "startup news",
    "venture capital",
    "technology business",
    "founder ecosystem",
  ],
  World: [
    "global startup",
    "international technology",
    "world business",
  ],
  Technology: [
    "artificial intelligence startup",
    "cybersecurity",
    "cloud computing",
    "developer tools",
  ],
  Business: [
    "business news",
    "markets and economy",
    "startup acquisitions",
    "venture capital firms",
  ],
  Science: [
    "science innovation",
    "research breakthrough",
    "deep tech",
  ],
  Health: [
    "health technology",
    "biotech startup",
    "digital health funding",
  ],
  Funding: [
    "startup funding",
    "series A",
    "seed round",
    "venture capital deal",
  ],
  Startups: [
    "new startup launch",
    "startup ecosystem",
    "entrepreneurship",
    "startup accelerator",
  ],
};

const GLOBAL_FEEDS: FeedMap = {
  Top: [
    "https://techcrunch.com/feed/",
    "https://venturebeat.com/feed/",
    "https://www.theverge.com/rss/index.xml",
    "https://hnrss.org/frontpage",
    "https://tech.eu/feed/",
    "https://www.eu-startups.com/feed/",
    "https://arstechnica.com/feed/",
    "https://www.wired.com/feed/rss",
    "https://www.geekwire.com/feed/",
    "https://www.engadget.com/rss.xml",
    "https://www.fastcompany.com/rss",
    "https://www.technologyreview.com/feed/",
  ],
  Technology: [
    "https://techcrunch.com/feed/",
    "https://venturebeat.com/category/ai/feed/",
    "https://www.theverge.com/tech/rss/index.xml",
    "https://hnrss.org/newest?count=60",
    "https://arstechnica.com/feed/",
    "https://www.wired.com/feed/rss",
    "https://www.engadget.com/rss.xml",
    "https://www.techmeme.com/feed.xml",
    "https://www.technologyreview.com/feed/",
    "https://www.zdnet.com/topic/artificial-intelligence/rss.xml",
  ],
  Business: [
    "https://techcrunch.com/category/startups/feed/",
    "https://venturebeat.com/category/business/feed/",
    "https://www.eu-startups.com/feed/",
    "https://www.fastcompany.com/rss",
    "https://www.cnbc.com/id/10001147/device/rss/rss.html",
    "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml",
  ],
  World: [
    "https://www.aljazeera.com/xml/rss/all.xml",
    "https://feeds.bbci.co.uk/news/world/rss.xml",
    "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
    "https://www.france24.com/en/rss",
  ],
  Science: [
    "https://www.sciencedaily.com/rss/top/science.xml",
    "https://www.sciencedaily.com/rss/all.xml",
    "https://www.nasa.gov/rss/dyn/breaking_news.rss",
    "https://www.scientificamerican.com/feed/",
  ],
  Health: [
    "https://www.sciencedaily.com/rss/health_medicine.xml",
    "https://www.who.int/feeds/entity/csr/don/en/rss.xml",
    "https://rss.nytimes.com/services/xml/rss/nyt/Health.xml",
    "https://www.medicalnewstoday.com/rss",
  ],
  Funding: [
    "https://techcrunch.com/category/startups/feed/",
    "https://www.eu-startups.com/feed/",
    "https://www.sifted.eu/feed/",
    "https://www.startupdaily.net/feed/",
  ],
  Startups: [
    "https://techcrunch.com/category/startups/feed/",
    "https://tech.eu/feed/",
    "https://www.eu-startups.com/feed/",
    "https://www.sifted.eu/feed/",
    "https://www.startupdaily.net/feed/",
    "https://www.geekwire.com/startups/feed/",
  ],
};

const COUNTRY_FEEDS: Record<CountryCode, FeedMap> = {
  US: {
    Top: [
      "https://news.ycombinator.com/rss",
      "https://feeds.npr.org/1001/rss.xml",
      "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml",
    ],
    Technology: [
      "https://www.engadget.com/rss.xml",
      "https://arstechnica.com/feed/",
      "https://www.cnbc.com/id/19854910/device/rss/rss.html",
    ],
    Business: [
      "https://www.cnbc.com/id/10001147/device/rss/rss.html",
      "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml",
      "https://www.fastcompany.com/rss",
    ],
    Startups: [
      "https://www.geekwire.com/startups/feed/",
      "https://techcrunch.com/category/startups/feed/",
    ],
  },
  UK: {
    Top: [
      "https://feeds.bbci.co.uk/news/rss.xml",
      "https://www.theguardian.com/uk/rss",
      "https://feeds.skynews.com/feeds/rss/home.xml",
    ],
    Technology: [
      "https://feeds.bbci.co.uk/news/technology/rss.xml",
      "https://www.theguardian.com/uk/technology/rss",
      "https://www.theregister.com/software/headlines.atom",
    ],
    Business: [
      "https://feeds.bbci.co.uk/news/business/rss.xml",
      "https://www.theguardian.com/uk/business/rss",
      "https://www.cityam.com/feed/",
    ],
    Startups: ["https://sifted.eu/feed/"],
  },
  DE: {
    Top: [
      "https://rss.dw.com/xml/rss-en-all",
      "https://www.spiegel.de/international/index.rss",
      "https://www.tagesschau.de/xml/rss2",
    ],
    Technology: [
      "https://www.heise.de/rss/heise-atom.xml",
      "https://t3n.de/rss.xml",
      "https://www.golem.de/rss.php?feed=RSS2.0",
    ],
    Business: [
      "https://www.manager-magazin.de/contentexport/feed/schlagzeilen",
      "https://www.handelsblatt.com/contentexport/feed/schlagzeilen",
      "https://rss.dw.com/rdf/rss-en-bus",
    ],
    Startups: ["https://www.eu-startups.com/feed/"],
  },
  FR: {
    Top: [
      "https://www.lemonde.fr/en/rss/une.xml",
      "https://www.france24.com/en/rss",
      "https://www.lefigaro.fr/rss/figaro_actualites.xml",
    ],
    Technology: [
      "https://www.maddyness.com/feed/",
      "https://www.usine-digitale.fr/rss.xml",
      "https://www.france24.com/en/tag/technology/rss",
    ],
    Business: [
      "https://www.france24.com/en/business-tech/rss",
      "https://www.lefigaro.fr/rss/figaro_economie.xml",
      "https://www.maddyness.com/feed/",
    ],
    Startups: ["https://www.maddyness.com/feed/"],
  },
  TR: {
    Top: [
      "https://www.dailysabah.com/rss",
      "https://www.aa.com.tr/tr/rss/default?cat=guncel",
      "https://www.ntv.com.tr/son-dakika.rss",
    ],
    Technology: [
      "https://webrazzi.com/feed/",
      "https://www.aa.com.tr/tr/rss/default?cat=bilim-teknoloji",
      "https://www.donanimhaber.com/rss/tum/",
    ],
    Business: [
      "https://www.aa.com.tr/tr/rss/default?cat=ekonomi",
      "https://www.dunya.com/rss",
      "https://webrazzi.com/feed/",
    ],
    Startups: ["https://webrazzi.com/feed/"],
  },
  IN: {
    Top: [
      "https://www.thehindu.com/news/international/feeder/default.rss",
      "https://timesofindia.indiatimes.com/rssfeeds/296589292.cms",
      "https://www.livemint.com/rss/news",
    ],
    Technology: [
      "https://www.gadgets360.com/rss/news",
      "https://inc42.com/feed/",
      "https://www.thehindu.com/sci-tech/technology/feeder/default.rss",
    ],
    Business: [
      "https://www.moneycontrol.com/rss/business.xml",
      "https://economictimes.indiatimes.com/rssfeedsdefault.cms",
      "https://www.thehindu.com/business/feeder/default.rss",
    ],
    Startups: ["https://inc42.com/feed/", "https://yourstory.com/feed"],
  },
  NG: {
    Top: [
      "https://techcabal.com/feed/",
      "https://www.premiumtimesng.com/feed",
      "https://punchng.com/feed/",
    ],
    Technology: [
      "https://techpoint.africa/feed/",
      "https://techcabal.com/feed/",
      "https://www.benjamindada.com/feed/",
    ],
    Business: [
      "https://businessday.ng/feed/",
      "https://nairametrics.com/feed/",
      "https://techcabal.com/feed/",
    ],
    Startups: ["https://techcabal.com/feed/", "https://techpoint.africa/feed/"],
  },
  KE: {
    Top: [
      "https://www.standardmedia.co.ke/rss/headlines.php",
      "https://www.the-star.co.ke/rss/",
      "https://nation.africa/kenya/rss",
    ],
    Technology: [
      "https://techweez.com/feed/",
      "https://www.kachwanya.com/feed/",
      "https://www.standardmedia.co.ke/rss/technology.php",
    ],
    Business: [
      "https://www.businessdailyafrica.com/bd/business?view=RSS",
      "https://www.the-star.co.ke/business/rss/",
      "https://techweez.com/feed/",
    ],
    Startups: ["https://techweez.com/feed/"],
  },
  BR: {
    Top: [
      "https://g1.globo.com/rss/g1/",
      "https://www.cnnbrasil.com.br/feed/",
      "https://www.uol.com.br/tilt/ultimas-noticias/rss.xml",
    ],
    Technology: [
      "https://canaltech.com.br/rss/",
      "https://www.tecmundo.com.br/rss",
      "https://startups.com.br/feed/",
    ],
    Business: [
      "https://g1.globo.com/economia/rss/g1/",
      "https://www.infomoney.com.br/feed/",
      "https://exame.com/feed/",
    ],
    Startups: ["https://startups.com.br/feed/"],
  },
  CA: {
    Top: [
      "https://www.cbc.ca/webfeed/rss/rss-topstories",
      "https://globalnews.ca/feed/",
      "https://www.thestar.com/content/thestar/feed.RSSManagerServlet.articles.news.html",
    ],
    Technology: [
      "https://www.cbc.ca/webfeed/rss/rss-technology",
      "https://betakit.com/feed/",
      "https://mobilesyrup.com/feed/",
    ],
    Business: [
      "https://www.cbc.ca/webfeed/rss/rss-business",
      "https://betakit.com/feed/",
      "https://financialpost.com/feed/",
    ],
    Startups: ["https://betakit.com/feed/"],
  },
  AU: {
    Top: [
      "https://www.abc.net.au/news/feed/51120/rss.xml",
      "https://www.sbs.com.au/news/feeds/rss.xml",
      "https://www.theguardian.com/au/rss",
    ],
    Technology: [
      "https://www.abc.net.au/news/feed/6293426/rss.xml",
      "https://www.startupdaily.net/feed/",
      "https://www.itnews.com.au/RSS/rss.ashx",
    ],
    Business: [
      "https://www.abc.net.au/news/feed/45910/rss.xml",
      "https://www.afr.com/rss",
      "https://www.startupdaily.net/feed/",
    ],
    Startups: ["https://www.startupdaily.net/feed/"],
  },
  JP: {
    Top: [
      "https://www3.nhk.or.jp/rss/news/cat0.xml",
      "https://www.japantimes.co.jp/feed/",
      "https://japannews.yomiuri.co.jp/feed/",
    ],
    Technology: [
      "https://techcrunch.com/tag/japan/feed/",
      "https://www.itmedia.co.jp/rss/2.0/news_bursts.xml",
      "https://www3.nhk.or.jp/rss/news/cat3.xml",
    ],
    Business: [
      "https://www3.nhk.or.jp/rss/news/cat5.xml",
      "https://asia.nikkei.com/rss/feed/nar",
      "https://www.japantimes.co.jp/news_category/business/feed/",
    ],
    Startups: [
      "https://techcrunch.com/tag/japan/feed/",
      "https://www.japantimes.co.jp/news_category/business/feed/",
    ],
  },
  ZA: {
    Top: [
      "https://www.dailymaverick.co.za/feed/",
      "https://www.news24.com/news24/rss",
      "https://businesstech.co.za/news/feed/",
    ],
    Technology: [
      "https://mybroadband.co.za/news/feed",
      "https://techcentral.co.za/feed/",
      "https://businesstech.co.za/news/feed/",
    ],
    Business: [
      "https://businesstech.co.za/news/feed/",
      "https://www.moneyweb.co.za/feed/",
      "https://www.news24.com/fin24/feed",
    ],
    Startups: [
      "https://disruptafrica.com/feed/",
      "https://businesstech.co.za/news/feed/",
    ],
  },
  MA: {
    Top: [
      "https://www.moroccoworldnews.com/feed/",
      "https://en.hespress.com/feed",
      "https://www.yabiladi.com/rss.xml",
    ],
    Technology: [
      "https://en.hespress.com/feed",
      "https://www.moroccoworldnews.com/feed/",
      "https://www.hespress.com/feed",
    ],
    Business: [
      "https://www.moroccoworldnews.com/category/economy/feed/",
      "https://www.moroccoworldnews.com/category/business/feed/",
      "https://www.yabiladi.com/rss.xml",
    ],
    Startups: [
      "https://www.moroccoworldnews.com/category/business/feed/",
      "https://disruptafrica.com/feed/",
    ],
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

function googleNewsSearchFeed(country: CountryCode, query: string): string {
  const locale = GOOGLE_NEWS_LOCALES[country];
  const encodedQuery = encodeURIComponent(query);
  return `https://news.google.com/rss/search?q=${encodedQuery}&hl=${locale.hl}&gl=${locale.gl}&ceid=${locale.ceid}`;
}

function pushUnique(urls: string[], seen: Set<string>, url: string): void {
  if (!url || seen.has(url)) {
    return;
  }

  seen.add(url);
  urls.push(url);
}

export function getFeedsFor(country: CountryCode, category: Category): string[] {
  const urls: string[] = [];
  const seen = new Set<string>();

  for (const url of COUNTRY_FEEDS[country]?.[category] ?? []) {
    pushUnique(urls, seen, url);
  }

  if (category === "Top") {
    for (const url of COUNTRY_FEEDS[country]?.Top ?? []) {
      pushUnique(urls, seen, url);
    }

    for (const url of GLOBAL_FEEDS[category] ?? []) {
      pushUnique(urls, seen, url);
    }

    for (const url of GLOBAL_FEEDS.Startups ?? []) {
      pushUnique(urls, seen, url);
    }

    pushUnique(urls, seen, googleNewsTopFeed(country));
  } else {
    for (const url of COUNTRY_FEEDS[country]?.Top ?? []) {
      pushUnique(urls, seen, url);
    }

    for (const url of GLOBAL_FEEDS[category] ?? []) {
      pushUnique(urls, seen, url);
    }

    const topicFeed = googleNewsTopicFeed(country, category);
    if (topicFeed) {
      pushUnique(urls, seen, topicFeed);
    }
  }

  for (const query of (GOOGLE_SEARCH_QUERY_MAP[category] ?? []).slice(0, MAX_GOOGLE_SEARCH_FEEDS_PER_CATEGORY)) {
    pushUnique(urls, seen, googleNewsSearchFeed(country, query));
  }

  return urls.slice(0, MAX_FEEDS_PER_REQUEST);
}
