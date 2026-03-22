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
  title: "로또 번호 추천 & 통계 데이터",
  description: "희망은 있지만 맹신은 금지! 로또 통계 분석과 스마트한 번호 조합기",
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
