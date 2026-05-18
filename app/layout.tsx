import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "駐輪ナビ",
  description: "リアルタイムで駐輪場の空き状況を確認できるナビゲーションアプリ",
  metadataBase: new URL('https://bicycle-parking-app.vercel.app'),
  openGraph: {
    title: "駐輪ナビ",
    description: "リアルタイムで駐輪場の空き状況を確認できるナビゲーションアプリ",
    url: 'https://bicycle-parking-app.vercel.app',
    siteName: '駐輪ナビ',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "駐輪ナビ",
    description: "リアルタイムで駐輪場の空き状況を確認できるナビゲーションアプリ",
    images: ['/opengraph-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
