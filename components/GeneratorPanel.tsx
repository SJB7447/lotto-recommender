"use client";

import React, { useState } from "react";
import { LottoDraw, GenerateMode, GenerateResult } from "@/types/lotto";
import { generateNumbers, getFrequency } from "@/lib/stats";
import { LottoBall } from "./LottoBall";

const TABS: { id: GenerateMode; label: string; desc: string }[] = [
  { id: "hot", label: "HOT 번호", desc: "최근 50회 상위 출현 번호 위주 추천" },
  { id: "balanced", label: "균형 배분", desc: "1~40+번대 각 구간별로 1개씩 포함" },
  { id: "random", label: "완전 랜덤", desc: "조건 없는 100% 무작위 추천" },
  { id: "cold_revenge", label: "냉각 역발상", desc: "최근 10회 미출현 번호 위주 변수 노리기" },
];

interface GeneratorPanelProps {
  draws: LottoDraw[];
}

export function GeneratorPanel({ draws }: GeneratorPanelProps) {
  const [mode, setMode] = useState<GenerateMode>("balanced");
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleGenerate = () => {
    if (draws.length === 0) return;
    setIsAnimating(true);
    setResult(null);
    
    // 애니메이션 효과를 위해 약간의 딜레이 후 생성
    setTimeout(() => {
      const res = generateNumbers(draws, mode);
      setResult(res);
      setIsAnimating(false);
    }, 400);
  };

  const getStatsSummary = (nums: number[]) => {
    const freqs = getFrequency(draws, false);
    const selectedFreqs = freqs.filter(f => nums.includes(f.num));
    const avgPercent = selectedFreqs.reduce((a, b) => a + b.percentage, 0) / 6;
    return `조합된 6개 번호의 평균 역사적 출현율: ${avgPercent.toFixed(1)}%`;
  };

  const activeTabDesc = TABS.find((t) => t.id === mode)?.desc;

  return (
    <div className="bg-surface rounded-2xl shadow-sm border border-border p-6 w-full relative overflow-hidden">
      {/* 백그라운드 데코레이션 */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex flex-wrap border-b border-border mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`px-4 py-3 font-bold text-sm transition-colors border-b-2 flex-grow sm:flex-grow-0 ${
              mode === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:text-main-text"
            }`}
            onClick={() => setMode(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      <p className="text-muted text-sm mb-8 bg-black/5 p-3 rounded-lg border border-border/50 text-center sm:text-left">
        💡 <span className="font-medium">{activeTabDesc}</span>
      </p>

      <div className="flex justify-center mb-8">
        <button
          onClick={handleGenerate}
          disabled={draws.length === 0 || isAnimating}
          className="bg-primary hover:bg-[#E05A2A] text-white px-10 py-3.5 rounded-full font-black text-lg shadow-[0_4px_14px_rgba(255,107,53,0.3)] transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
        >
          {result ? "다시 생성하기" : "번호 생성하기"}
        </button>
      </div>

      <div className="min-h-[160px] flex flex-col items-center justify-center bg-bg rounded-xl border border-border/40 p-6">
        {isAnimating && (
          <div className="flex flex-wrap justify-center gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div 
                key={i} 
                className="w-14 h-14 rounded-full bg-gray-200 animate-pulse shadow-inner"
                style={{ animationDelay: `${i * 100}ms` }}
              ></div>
            ))}
          </div>
        )}
        
        {!isAnimating && result && (
          <div className="flex flex-col items-center">
            <h4 className="text-main-text font-bold mb-5 flex items-center gap-2">
              <span className="text-primary">✨</span> {result.modeLabel}
            </h4>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {result.nums.map((num, i) => (
                <div 
                  key={i} 
                  className="animate-bounce-in" 
                  style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}
                >
                  <LottoBall num={num} size="lg" glow animate />
                </div>
              ))}
            </div>
            
            <div className="mt-8 text-center bg-white px-5 py-3 rounded-xl border border-border shadow-sm w-full">
              <span className={`text-xs px-2 py-1 rounded-md font-bold uppercase mr-2 ${result.confidence === 'medium' ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-gray-100 text-gray-700'}`}>
                신뢰도: {result.confidence}
              </span>
              <p className="text-sm font-medium text-main-text mt-2">{getStatsSummary(result.nums)}</p>
            </div>
          </div>
        )}
        
        {!isAnimating && !result && draws.length > 0 && (
          <p className="text-muted font-medium">버튼을 눌러 나만의 행운 번호를 뽑아보세요!</p>
        )}
        
        {!isAnimating && draws.length === 0 && (
          <p className="text-warning font-bold animate-pulse">Firestore 데이터를 불러오고 있습니다...</p>
        )}
      </div>
    </div>
  );
}
