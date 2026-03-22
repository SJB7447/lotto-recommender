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
  const [results, setResults] = useState<GenerateResult[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [quantity, setQuantity] = useState<number>(5);
  const [savedIndices, setSavedIndices] = useState<number[]>([]);

  const handleGenerate = () => {
    if (draws.length === 0) return;
    setIsAnimating(true);
    setResults([]);
    setSavedIndices([]);
    
    // 애니메이션 효과를 위해 약간의 딜레이 후 생성
    setTimeout(() => {
      const newResults = Array.from({ length: quantity }, () => generateNumbers(draws, mode));
      setResults(newResults);
      setIsAnimating(false);
    }, 400);
  };

  const handleSaveSingle = (res: GenerateResult, idx: number) => {
    const saved = JSON.parse(localStorage.getItem('saved_lotto') || '[]');
    const newEntry = {
      id: Date.now() + idx,
      nums: res.nums,
      mode: res.mode,
      modeLabel: res.modeLabel,
      date: new Date().toLocaleDateString('ko-KR')
    };
    localStorage.setItem('saved_lotto', JSON.stringify([newEntry, ...saved]));
    setSavedIndices(prev => [...prev, idx]);
  };

  const getStatsSummaryValue = (nums: number[]) => {
    const freqs = getFrequency(draws, false);
    const selectedFreqs = freqs.filter(f => nums.includes(f.num));
    return selectedFreqs.reduce((a, b) => a + b.percentage, 0) / 6;
  };

  const activeTabDesc = TABS.find((t) => t.id === mode)?.desc;

  return (
    <div className="bg-surface rounded-2xl shadow-sm border border-border p-5 sm:p-6 w-full relative overflow-hidden">
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
      
      <p className="text-muted text-sm sm:text-base mb-8 bg-black/5 p-4 rounded-xl border border-border/50 text-center sm:text-left leading-relaxed break-keep">
        💡 <span className="font-bold">{activeTabDesc}</span>
      </p>

      <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-4 mb-4 sm:mb-8 px-1">
        <div className="flex bg-black/5 p-1.5 rounded-full border border-border/50 justify-center">
          {[1, 5, 10].map(q => (
            <button
              key={q}
              onClick={() => setQuantity(q)}
              className={`px-6 sm:px-5 py-3 sm:py-2.5 rounded-full font-black text-base sm:text-sm transition-colors flex-1 sm:flex-none ${
                quantity === q 
                  ? "bg-white text-primary shadow-sm border border-border/10" 
                  : "text-muted hover:text-main-text"
              }`}
            >
              {q}게임
            </button>
          ))}
        </div>
        
        <button
          onClick={handleGenerate}
          disabled={draws.length === 0 || isAnimating}
          className="bg-primary hover:bg-[#E05A2A] text-white w-full sm:w-auto px-8 py-4 sm:py-3.5 rounded-2xl sm:rounded-full font-black text-xl sm:text-lg shadow-[0_8px_20px_rgba(255,107,53,0.3)] transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
        >
          {results.length > 0 ? "🔄 다시 뽑기" : "✨ 번호 당겨보기"}
        </button>
      </div>

      <div className="min-h-[160px] flex flex-col items-center justify-center bg-bg rounded-xl border border-border/40 p-5 mt-4">
        {isAnimating && (
          <div className="flex flex-col gap-5 w-full items-center py-6">
            {Array.from({ length: Math.min(3, quantity) }).map((_, r) => (
              <div key={r} className="flex flex-wrap justify-center gap-2 sm:gap-3 w-full">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div 
                    key={i} 
                    className="w-10 h-10 rounded-full bg-gray-300/50 animate-pulse shadow-inner"
                    style={{ animationDelay: `${i * 100}ms` }}
                  ></div>
                ))}
              </div>
            ))}
          </div>
        )}
        
        {!isAnimating && results.length > 0 && (
          <div className="w-full flex flex-col items-center">
            <h4 className="text-main-text font-black mb-5 flex items-center gap-2 text-lg sm:text-xl">
              <span className="text-primary text-2xl">✨</span> {results[0].modeLabel} <span className="text-muted ml-1 text-sm font-bold">({quantity}게임)</span>
            </h4>
            
            <div className="flex flex-col gap-3.5 w-full max-w-lg mb-8">
              {results.map((res, idx) => (
                <div key={idx} className="bg-white px-5 py-4 sm:py-3.5 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row items-center justify-between gap-5 animate-fade-in" style={{ animationDelay: `${idx * 80}ms` }}>
                  <div className="flex items-center gap-2 sm:gap-4 w-full md:w-auto justify-center md:justify-start">
                    <span className="font-black text-muted/50 w-6 text-sm text-center hidden sm:block">{idx + 1}</span>
                    <div className="flex gap-1.5 sm:gap-2">
                      {res.nums.map((num, i) => (
                        <LottoBall key={i} num={num} size="sm" animate={!savedIndices.includes(idx)} />
                      ))}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleSaveSingle(res, idx)}
                    disabled={savedIndices.includes(idx)}
                    className={`px-5 py-3 md:py-2.5 rounded-xl w-full md:w-auto text-sm font-black transition-colors flex-shrink-0 ${
                      savedIndices.includes(idx) 
                        ? "bg-secondary text-white cursor-default shadow-sm border border-transparent" 
                        : "bg-[#FFF8E6] text-primary border border-primary/20 hover:bg-primary hover:text-white"
                    }`}
                  >
                    {savedIndices.includes(idx) ? "✔ 보관완료" : "⭐ 보관"}
                  </button>
                </div>
              ))}
            </div>
            
            <div className="text-center bg-white px-5 py-4 rounded-xl border border-border shadow-sm w-full max-w-lg">
              <span className={`text-xs px-2.5 py-1.5 rounded-md font-black uppercase mr-2.5 shadow-sm border ${results[0].confidence === 'medium' ? 'bg-[#D1FAE5] text-[#065F46] border-[#065F46]/20' : 'bg-gray-100 text-gray-700 border-gray-300'}`}>
                신뢰도: {results[0].confidence}
              </span>
              <p className="text-sm font-bold text-muted mt-3 mb-1">
                추천된 {quantity}게임 번호들의 평균 역사적 과거 출현율:
              </p>
              <p className="font-black text-primary text-2xl">
                {(results.reduce((acc, r) => acc + getStatsSummaryValue(r.nums), 0) / results.length).toFixed(1)}%
              </p>
            </div>
          </div>
        )}
        
        {!isAnimating && results.length === 0 && draws.length > 0 && (
          <div className="text-center py-10">
            <span className="text-6xl mb-3 block">🎲</span>
            <p className="text-muted font-bold">버튼을 눌러 나만의 행운 번호를 당겨보세요!</p>
          </div>
        )}
        
        {!isAnimating && draws.length === 0 && (
          <p className="text-warning font-black text-lg animate-pulse py-10">Firestore 데이터를 불러오고 있습니다...</p>
        )}
      </div>
    </div>
  );
}
