"use client";

import React, { useState } from "react";
import { LottoDraw, GenerateMode, GenerateResult } from "@/types/lotto";
import { generateNumbers, getFrequency } from "@/lib/stats";
import { LottoBall } from "./LottoBall";

const TABS: { id: GenerateMode; label: string; desc: string }[] = [
  { id: "hot", label: "HOT 번호", desc: "최근 50회 상위 출현 번호 위주 추천" },
  { id: "balanced", label: "균형 배분", desc: "1~40+번대 각 구간별로 1개씩 포함" },
  { id: "random", label: "완전 랜덤", desc: "조건 없는 100% 무작위 추천" },
  { id: "cold_revenge", label: "미출현 번호 공략", desc: "최근 10회 미출현 번호 위주 변수 노리기" },
];

interface GeneratorPanelProps {
  draws: LottoDraw[];
}

export function GeneratorPanel({ draws }: GeneratorPanelProps) {
  const [mode, setMode] = useState<GenerateMode>("balanced");
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleGenerate = () => {
    if (draws.length === 0) return;
    setIsAnimating(true);
    setResult(null);
    setIsSaved(false);
    
    // 애니메이션 효과를 위해 약간의 딜레이 후 생성
    setTimeout(() => {
      const res = generateNumbers(draws, mode);
      setResult(res);
      setIsAnimating(false);
    }, 400);
  };

  const handleSave = () => {
    if (!result) return;
    const saved = JSON.parse(localStorage.getItem('saved_lotto') || '[]');
    const newEntry = {
      id: Date.now(),
      nums: result.nums,
      mode: result.mode,
      modeLabel: result.modeLabel,
      date: new Date().toLocaleDateString('ko-KR')
    };
    localStorage.setItem('saved_lotto', JSON.stringify([newEntry, ...saved]));
    setIsSaved(true);
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
            className={`px-3 py-4 font-black text-[15px] sm:text-lg transition-colors border-b-4 flex-grow sm:flex-grow-0 ${
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
      
      <p className="text-muted text-sm sm:text-base mb-8 bg-black/5 p-4 rounded-xl border border-border/50 text-center sm:text-left leading-relaxed">
        💡 <span className="font-bold">{activeTabDesc}</span>
      </p>

      <div className="flex justify-center mb-8 px-2">
        <button
          onClick={handleGenerate}
          disabled={draws.length === 0 || isAnimating}
          className="bg-primary hover:bg-[#E05A2A] text-white w-full sm:w-auto px-6 sm:px-12 py-5 sm:py-4 rounded-2xl sm:rounded-full font-black text-xl sm:text-2xl shadow-[0_8px_20px_rgba(255,107,53,0.3)] transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
        >
          {result ? "🔄 다시 번호 뽑기" : "✨ 나만의 행운 번호 뽑기"}
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
            
            <div className="mt-8 w-full flex justify-center pb-2">
              <button 
                onClick={handleSave}
                disabled={isSaved}
                className={`w-full sm:w-auto px-8 py-4 rounded-2xl md:rounded-full font-black text-lg md:text-xl transition-all ${
                  isSaved 
                    ? "bg-secondary text-white shadow-md scale-100 cursor-default" 
                    : "bg-[#FFF8E6] text-primary border-2 border-primary/20 hover:bg-primary hover:text-white shadow-sm hover:scale-105 active:scale-95"
                }`}
              >
                {isSaved ? "⭐ 보관함에 쏘옥! (저장완료)" : "⭐ 이 번호 마음에 듭니다 (보관)"}
              </button>
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
