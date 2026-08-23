import type { Metadata } from "next";
import { Barlow_Condensed, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const barlow = Barlow_Condensed({ variable: "--font-barlow", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const jetBrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "Prompt Workbench | Bookchaowalit",
  description: "A local recipe shelf for preparing and reusing prompt instructions.",
  keywords: ["prompt-library", "portfolio"],
  authors: [{ name: "Bookchaowalit", url: "https://bookchaowalit.com" }],
  creator: "Bookchaowalit",
  metadataBase: new URL("https://bookchaowalit.com"),
  openGraph: {
    type: "website",
    title: "Prompt Workbench | Bookchaowalit",
    description: "A local recipe shelf for preparing and reusing prompt instructions.",
    siteName: "Bookchaowalit",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${barlow.variable} ${jetBrains.variable}`}>
      <body className="antialiased">
        <Analytics />
        <SpeedInsights />
        {children}
      </body>
    </html>
  );
}
