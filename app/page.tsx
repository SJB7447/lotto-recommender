"use client";

import React, { useEffect, useState } from "react";
import { getAllDraws } from "@/lib/firestore";
import { LottoDraw } from "@/types/lotto";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { GeneratorPanel } from "@/components/GeneratorPanel";
import { DrawCard } from "@/components/DrawCard";
import { LottoBall } from "@/components/LottoBall";

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
        
        <header className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-primary mb-3 tracking-tight drop-shadow-sm">
            <span className="text-4xl mr-2">🍀</span>로또 통계 번호 추천
          </h1>
          <p className="text-muted font-medium text-sm sm:text-base">최적의 통계 분석으로 완성하는 나만의 행운 번호</p>
        </header>

        {latestDraw && (
          <section className="bg-surface rounded-3xl p-6 sm:p-8 mb-10 shadow-sm border border-border relative overflow-hidden transition-all hover:shadow-md">
            <div className="absolute top-0 right-0 w-40 h-40 bg-accent/10 rounded-bl-full -z-10 pointer-events-none"></div>
            
            <div className="flex flex-col items-center">
              <div className="bg-[#FFF8E6] text-primary font-black px-4 py-1.5 rounded-full text-sm mb-5 border border-primary/20 shadow-sm">
                최신 당첨 결과
              </div>
              <h2 className="text-2xl font-bold mb-1">제 {latestDraw.drawNo}회</h2>
              <p className="text-muted text-sm mb-8 font-medium">✨ {latestDraw.drawDate} 추첨 ✨</p>

              <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 mb-10">
                {latestDraw.nums.map((n, i) => (
                   <LottoBall key={i} num={n} size="lg" glow animate />
                ))}
                <div className="text-main-text/30 text-3xl font-light pb-2 mx-1 sm:mx-3">+</div>
                <LottoBall num={latestDraw.bonus} size="lg" bonus animate />
              </div>

              <div className="grid grid-cols-2 gap-4 w-full max-w-sm text-center bg-bg p-5 rounded-2xl border border-border/60">
                <div>
                  <p className="text-xs text-muted mb-1.5 font-medium">1등 당첨자수</p>
                  <p className="font-black text-lg text-secondary">
                    {latestDraw.prize1stCount.toLocaleString()}명
                  </p>
                </div>
                <div className="border-l border-border/80">
                  <p className="text-xs text-muted mb-1.5 font-medium">1등 당첨금액</p>
                  <p className="font-black text-lg text-primary">
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
