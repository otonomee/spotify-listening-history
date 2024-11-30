import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Spotify Monthly Playlister | Automatic Monthly Music Archives",
    template: "%s | Spotify Monthly Playlister",
  },
  description: "Automatically create monthly Spotify playlists from your listening history. Track, archive, and relive your musical journey.",
  keywords: ["spotify", "playlist", "monthly", "music", "archive", "listening history"],
  authors: [{ name: "Autin Allen" }],
  viewport: "width=device-width, initial-scale=1",
  icons: {
    icon: [
      {
        url: "/favicon.svg",
        type: "image/svg+xml",
      },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Spotify Monthly Playlister",
    description: "Automatically create monthly Spotify playlists from your listening history",
    siteName: "Spotify Monthly Playlister",
  },
  twitter: {
    card: "summary_large_image",
    title: "Spotify Monthly Playlister",
    description: "Automatically create monthly Spotify playlists from your listening history",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        <div className="relative flex min-h-screen flex-col">
          <div className="flex-1">{children}</div>
        </div>
      </body>
    </html>
  );
}
