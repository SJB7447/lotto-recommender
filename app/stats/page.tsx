"use client";

import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as PieTooltip } from "recharts";
import { getAllDraws } from "@/lib/firestore";
import { LottoDraw } from "@/types/lotto";
import { getPatternStats } from "@/lib/stats";
import { FrequencyChart } from "@/components/FrequencyChart";
import { HotColdPanel } from "@/components/HotColdPanel";

export default function StatsPage() {
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
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  // 데이터 부족 예외처리
  if (draws.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg text-main-text px-4">
        <div className="text-4xl mb-4">📭</div>
        <p className="text-lg font-bold mb-2">통계 데이터가 없습니다.</p>
        <p className="text-muted text-sm border border-border bg-surface px-4 py-2 rounded-xl">스크립트 시딩이나 동기화를 먼저 진행해주세요.</p>
      </div>
    );
  }

  const patternStats = getPatternStats(draws);
  
  // 평균 번호 합계 계산 (데이터 전체)
  const totalSum = draws.reduce((acc, draw) => acc + draw.nums.reduce((a, b) => a + b, 0), 0);
  const avgSum = (totalSum / draws.length).toFixed(1);

  // 홀짝 패턴의 비율 계산
  const patternCount = draws.filter(d => `홀${d.oddCount}:짝${d.evenCount}` === patternStats.mostCommonPattern).length;
  const patternPct = ((patternCount / draws.length) * 100).toFixed(1);

  // 파이차트 구간 분포 계산 (전체 합 기준 파이차트)
  const range1Sum = draws.reduce((sum, d) => sum + d.range1, 0);
  const range2Sum = draws.reduce((sum, d) => sum + d.range2, 0);
  const range3Sum = draws.reduce((sum, d) => sum + d.range3, 0);
  const range4Sum = draws.reduce((sum, d) => sum + d.range4, 0);
  const range5Sum = draws.reduce((sum, d) => sum + d.range5, 0);

  const pieData = [
    { name: "1-10번대", value: range1Sum, color: "#FBBF24" },
    { name: "11-20번대", value: range2Sum, color: "#60A5FA" },
    { name: "21-30번대", value: range3Sum, color: "#F87171" },
    { name: "31-40번대", value: range4Sum, color: "#9CA3AF" },
    { name: "41-45번대", value: range5Sum, color: "#34D399" },
  ];

  return (
    <main className="min-h-screen bg-bg text-main-text pb-24 pt-12">
      <div className="max-w-4xl mx-auto px-5">
        
        <header className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-primary mb-3">
            <span className="text-4xl mr-2">📊</span>당첨 번호 통계 분석
          </h1>
          <p className="text-muted font-medium text-sm sm:text-base">과거의 흐름을 읽고 나만의 시야를 넓혀보세요</p>
        </header>

        {/* 1. 번호별 횟수 차트 */}
        <FrequencyChart draws={draws} />

        {/* 2. Hot Cold 패널 */}
        <HotColdPanel draws={draws} />

        {/* 3. 패턴 통계 카드 */}
        <section className="bg-surface rounded-3xl p-6 sm:p-8 shadow-sm border border-border hover:shadow-md transition-shadow">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
            <span className="text-2xl">🧩</span> 패턴 및 구간 통계
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* 요약 카드 */}
            <div className="flex flex-col gap-4">
              <div className="bg-bg p-5 rounded-2xl border border-border border-dashed shadow-inner flex flex-col justify-center h-full gap-5">
                <div>
                  <p className="text-xs text-muted mb-1.5 font-bold uppercase tracking-wider">최다 홀짝 비율</p>
                  <p className="text-xl font-black text-main-text">
                    {patternStats.mostCommonPattern} <span className="text-base font-medium text-primary ml-1">({patternPct}%)</span>
                  </p>
                </div>
                
                <div className="h-px w-full bg-border/60"></div>
                
                <div>
                  <p className="text-xs text-muted mb-1.5 font-bold uppercase tracking-wider">평균 높낮이 출현수</p>
                  <p className="text-lg font-bold text-main-text">
                    낮은번호 <span className="text-secondary ml-1">{patternStats.avgLow}개</span> 
                    <span className="mx-3 text-border">|</span> 
                    높은번호 <span className="text-secondary ml-1">{patternStats.avgHigh}개</span>
                  </p>
                </div>

                <div className="h-px w-full bg-border/60"></div>

                <div>
                  <p className="text-xs text-muted mb-1.5 font-bold uppercase tracking-wider">평균 당첨 번호 합계</p>
                  <p className="text-xl font-black text-secondary">
                    {Math.round(Number(avgSum))} <span className="text-base text-muted font-normal ml-1">(모든 회차 기준)</span>
                  </p>
                </div>
              </div>
            </div>

            {/* 파이 차트 */}
            <div className="flex flex-col items-center">
              <p className="text-sm font-bold text-muted mb-2">전체 구간별 출현 분포</p>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <PieTooltip 
                      formatter={(value: any) => [`${value}회`, "총 출현 누적"]}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-4 text-xs font-medium text-muted">
                {pieData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></span>
                    {entry.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 4. 통계 면책 조항 */}
        <div className="bg-[#f0f9ff] text-[#0369a1] p-6 rounded-2xl mt-12 flex flex-col sm:flex-row items-center justify-center text-center sm:text-left text-sm border-2 border-dashed border-[#bae6fd]">
          <div className="text-2xl mb-2 sm:mb-0 sm:mr-4 opacity-80">☕</div>
          <div>
            <p className="font-bold text-[#0c4a6e] mb-1 text-base">이 통계는 재미와 시각적 참고용입니다.</p>
            <p className="opacity-90">무작위 당첨 확률에는 통계적 패턴이 필연적으로 적용되거나 결과를 보장하지 않습니다. 가벼운 마음과 건전한 시각으로 즐겨주세요!</p>
          </div>
        </div>

      </div>
    </main>
  );
}
