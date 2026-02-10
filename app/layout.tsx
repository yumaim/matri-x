import React from "react"
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "Matri-X | X(Twitter)アルゴリズム解析プラットフォーム",
    template: "%s | Matri-X",
  },
  description:
    "Xの推薦アルゴリズムをソースコードレベルで解析。6,000+特徴量、パイプライン可視化、エンゲージメント重み付け分析。",
  metadataBase: new URL("https://matri-x.jp"),
  openGraph: {
    title: "Matri-X | X(Twitter)アルゴリズム解析プラットフォーム",
    description: "Xの推薦アルゴリズムをソースコードレベルで解析。6,000+特徴量、パイプライン可視化、検証コミュニティ。",
    type: "website",
    siteName: "Matri-X",
    url: "https://matri-x.jp",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Matri-X - Xアルゴリズム解析プラットフォーム",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Matri-X | X(Twitter)アルゴリズム解析プラットフォーム",
    description: "Xの推薦アルゴリズムをソースコードレベルで解析するプラットフォーム",
    images: ["/twitter-image"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
