"use client";

import React, { useState } from "react";
import { LottoDraw } from "@/types/lotto";
import { getHotNumbers, getColdNumbers } from "@/lib/stats";
import { LottoBall } from "./LottoBall";

interface HotColdPanelProps {
  draws: LottoDraw[];
}

export function HotColdPanel({ draws }: HotColdPanelProps) {
  const [recent, setRecent] = useState(50);
  
  if (draws.length === 0) return null;

  const hotNums = getHotNumbers(draws, recent).slice(0, 6);
  const coldNums = getColdNumbers(draws, recent).slice(0, 6);

  return (
    <div className="bg-surface rounded-3xl shadow-sm border border-border p-6 sm:p-8 mb-8 hover:shadow-md transition-shadow relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full -z-10"></div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <h3 className="text-xl font-bold flex items-center gap-2 whitespace-nowrap">
          <span className="text-2xl">🔥</span> HOT &amp; COLD <span className="text-2xl">🧊</span>
        </h3>
        
        <div className="flex flex-col w-full md:w-64 bg-bg px-5 py-3 rounded-2xl border border-border/50 shadow-inner">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold text-muted">최근 회차 기준</label>
            <span className="text-sm font-black text-primary">{recent}회</span>
          </div>
          <input 
            type="range" 
            min="10" 
            max="200" 
            step="10" 
            value={recent} 
            onChange={(e) => setRecent(Number(e.target.value))}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* HOT 패널 */}
        <div className="bg-gradient-to-br from-red-50 to-white p-6 rounded-2xl border border-red-200/60 shadow-sm relative overflow-hidden group">
          <div className="absolute -top-4 -right-4 text-7xl opacity-5 group-hover:scale-110 transition-transform">🔥</div>
          <h4 className="font-bold text-red-700 mb-5 flex items-center gap-2">
            최다 출현 번호 TOP 6
          </h4>
          <div className="flex flex-wrap gap-2.5 sm:gap-3">
            {hotNums.map((n, i) => (
              <div 
                key={n} 
                className="rounded-full shadow-sm ring-4 ring-white"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="ring-2 ring-red-400 ring-offset-1 rounded-full">
                  <LottoBall num={n} size="md" glow={false} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs font-medium text-red-500/70 mt-5">가장 활발하게 등장 중인 뜨거운 번호들입니다.</p>
        </div>

        {/* COLD 패널 */}
        <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border border-blue-200/60 shadow-sm relative overflow-hidden group">
          <div className="absolute -top-4 -right-4 text-7xl opacity-5 group-hover:scale-110 transition-transform">🧊</div>
          <h4 className="font-bold text-blue-700 mb-5 flex items-center gap-2">
            미출현 번호 TOP 6
          </h4>
          <div className="flex flex-wrap gap-2.5 sm:gap-3">
            {coldNums.map((n, i) => (
              <div 
                key={n} 
                className="rounded-full shadow-sm ring-4 ring-white"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="ring-2 ring-blue-400 ring-offset-1 rounded-full">
                  <LottoBall num={n} size="md" glow={false} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs font-medium text-blue-500/70 mt-5">모습을 감춘 지 오래된 잠재력 있는 번호들입니다.</p>
        </div>
      </div>
    </div>
  );
}
