import type { CapacitorConfig } from "@capacitor/cli";

const serverUrl =
  process.env.CAP_SERVER_URL?.trim() ||
  "https://news.sentirax.com";

const config: CapacitorConfig = {
  appId: "com.sentirax.news",
  appName: "Startup News Worldwide",
  webDir: "out",
  plugins: {
    FirebaseAuthentication: {
      // We use Firebase JS SDK as the app auth source of truth.
      skipNativeAuth: true,
      providers: ["google.com"],
    },
  },
  server: {
    // This app relies on Next.js API routes, so Android should load a running web backend.
    url: serverUrl,
    cleartext: serverUrl.startsWith("http://"),
    allowNavigation: ["*"],
  },
};

export default config;
