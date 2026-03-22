import type { Metadata } from "next";
import { Noto_Sans_KR, Roboto_Mono } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-noto-sans-kr",
  display: "swap",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "행운로또 (LottoStat)",
  description: "과거를 분석해 새로운 희망을 그려보세요. 아버지를 위한 스마트 로또 도우미!",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${notoSansKR.variable} ${robotoMono.variable} font-sans antialiased`}
      >
        <Navbar />
        <div className="max-w-5xl mx-auto px-5 pt-8 -mb-4">
          <DisclaimerBanner />
        </div>
        {children}
      </body>
    </html>
  );
}
