import type { CapacitorConfig } from "@capacitor/cli";

const serverUrl =
  process.env.CAP_SERVER_URL?.trim() ||
  "http://10.0.2.2:3000";

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

