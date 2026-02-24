import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ThemeScript } from "@/components/theme-script";
import { SiteLoader } from "@/components/site-loader";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const merriweather = Merriweather({
  subsets: ["latin"],
  variable: "--font-merriweather",
  weight: ["300", "400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://startup-news-worldwide.vercel.app"),
  title: {
    default: "Startup News Worldwide",
    template: "%s | Startup News Worldwide",
  },
  description:
    "Worldwide startup, funding, and technology headlines with region and category filters.",
  openGraph: {
    title: "Startup News Worldwide",
    description:
      "Read startup, technology, and business coverage from worldwide RSS sources.",
    type: "website",
    url: "https://startup-news-worldwide.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "Startup News Worldwide",
    description:
      "Read startup, technology, and business coverage from worldwide RSS sources.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>): JSX.Element {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${merriweather.variable}`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,500,0,0&display=block"
        />
        <ThemeScript />
      </head>
      <body className="font-sans text-text-main antialiased">
        <ThemeProvider>
          <SiteLoader />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

