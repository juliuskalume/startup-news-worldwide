import type { CapacitorConfig } from "@capacitor/cli";

const serverUrl =
  process.env.CAP_SERVER_URL?.trim() ||
  "https://news.sentirax.com";

const config: CapacitorConfig = {
  appId: "com.startupnews.worldwide",
  appName: "Startup News Worldwide",
  webDir: "out",
  server: {
    // This app relies on Next.js API routes, so Android should load a running web backend.
    url: serverUrl,
    cleartext: serverUrl.startsWith("http://"),
    allowNavigation: ["*"],
  },
};

export default config;
