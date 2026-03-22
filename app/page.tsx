"use client";

import React, { useEffect, useState } from "react";
import { getAllDraws } from "@/lib/firestore";
import { LottoDraw } from "@/types/lotto";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { GeneratorPanel } from "@/components/GeneratorPanel";
import { DrawCard } from "@/components/DrawCard";
import { LottoBall } from "@/components/LottoBall";
import { InstallPWA } from "@/components/InstallPWA";

export default function HomePage() {
  const [draws, setDraws] = useState<LottoDraw[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getAllDraws();
        setDraws(data || []);
      } catch (err) {
        console.error("데이터 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg text-main-text">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <div className="text-lg font-bold text-primary animate-pulse">로또 데이터를 불러오고 있습니다...</div>
        </div>
      </div>
    );
  }

  const latestDraw = draws.length > 0 ? draws[0] : null;
  const recentDraws = draws.slice(0, 5);

  return (
    <main className="min-h-screen bg-bg text-main-text pb-24">
      <div className="max-w-3xl mx-auto px-5 pt-12">
        
        <InstallPWA />
        
        <header className="mb-10 text-center animate-fade-in">
          <p className="text-secondary font-black text-sm sm:text-base mb-2 hide-on-large">아버지의 든든한 행운 도우미 👨‍👩‍👧</p>
          <h1 className="text-4xl md:text-5xl font-black text-primary mb-4 tracking-tight drop-shadow-sm">
            <span className="text-4xl sm:text-5xl mr-2">🍀</span>행운의 로또
          </h1>
          <p className="text-muted font-bold text-base sm:text-lg hide-on-large">과거를 분석해 새로운 희망을 그려보세요!</p>
        </header>

        {latestDraw && (
          <section className="bg-surface rounded-3xl p-6 sm:p-8 mb-10 shadow-sm border border-border relative overflow-hidden transition-all hover:shadow-md">
            <div className="absolute top-0 right-0 w-40 h-40 bg-accent/10 rounded-bl-full -z-10 pointer-events-none"></div>
            
            <div className="flex flex-col items-center">
              <div className="bg-[#FFF8E6] text-primary font-black px-5 py-2 rounded-full text-base mb-5 border border-primary/20 shadow-sm">
                최신 당첨 결과
              </div>
              <h2 className="text-3xl font-black mb-2">제 {latestDraw.drawNo}회</h2>
              <p className="text-muted text-base mb-8 font-bold hide-on-large">✨ {latestDraw.drawDate} 추첨 ✨</p>

              <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 mb-10">
                {latestDraw.nums.map((n, i) => (
                   <LottoBall key={i} num={n} size="lg" glow animate />
                ))}
                <div className="text-main-text/30 text-3xl font-light pb-2 mx-1 sm:mx-3">+</div>
                <LottoBall num={latestDraw.bonus} size="lg" bonus animate />
              </div>

              <div className="grid grid-cols-2 gap-4 w-full max-w-md text-center bg-bg p-6 rounded-3xl border border-border/60 shadow-inner hide-on-large">
                <div>
                  <p className="text-sm sm:text-base text-muted mb-2 font-bold">1등 당첨자수</p>
                  <p className="font-black text-2xl text-secondary">
                    {latestDraw.prize1stCount.toLocaleString()}명
                  </p>
                </div>
                <div className="border-l-2 border-border/80 pl-4">
                  <p className="text-sm sm:text-base text-muted mb-2 font-bold">1등 당첨금액</p>
                  <p className="font-black text-2xl text-primary">
                    {Math.floor(latestDraw.prize1stAmount / 100000000).toLocaleString()}억 원
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
          <span className="text-2xl">🔮</span> 스마트 번호 생성기
        </h3>
        <GeneratorPanel draws={draws} />

        {recentDraws.length > 0 && (
          <>
            <h3 className="text-xl font-bold mb-5 mt-14 flex items-center gap-2">
              <span className="text-2xl">📊</span> 최근 당첨 내역
            </h3>
            <div className="flex flex-col gap-4">
              {recentDraws.map(draw => (
                <DrawCard key={draw.drawNo} draw={draw} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
