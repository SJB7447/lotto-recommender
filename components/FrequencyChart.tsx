"use client";

import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";
import { LottoDraw } from "@/types/lotto";
import { getFrequency } from "@/lib/stats";

interface FrequencyChartProps {
  draws: LottoDraw[];
}

export function FrequencyChart({ draws }: FrequencyChartProps) {
  const [includeBonus, setIncludeBonus] = useState(false);
  
  if (draws.length === 0) return null;

  const freqData = getFrequency(draws, includeBonus).sort((a, b) => a.num - b.num);
  
  // 빈도 기준 내림차순 정렬 후 상위 5번째 값을 기준으로 강조 처리
  const sortedByCount = [...freqData].sort((a, b) => b.count - a.count);
  const top5Threshold = sortedByCount[4]?.count || 0;

  const getColor = (num: number) => {
    if (num <= 10) return "#FBBF24"; // 노랑
    if (num <= 20) return "#60A5FA"; // 파랑
    if (num <= 30) return "#F87171"; // 빨강
    if (num <= 40) return "#9CA3AF"; // 회색
    return "#34D399"; // 초록
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-surface p-3 border border-border shadow-lg rounded-xl">
          <p className="font-bold text-main-text mb-1">{`기호 ${label}번`}</p>
          <p className="text-sm text-primary font-medium">{`출현 횟수: ${data.count}회`}</p>
          <p className="text-xs text-muted mt-1">{`전체 출현율: ${data.percentage}%`}</p>
          <p className="text-xs text-muted">{`미출현 기간(gap): ${data.gap}회차`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-surface rounded-3xl shadow-sm border border-border p-6 sm:p-8 mb-8 overflow-hidden hover:shadow-md transition-shadow relative">
      <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-br-full -z-10"></div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <h3 className="text-xl font-bold text-main-text flex items-center gap-2">
          <span className="text-2xl">📈</span> 번호별 누적 출현 빈도
        </h3>
        <label className="flex items-center gap-2.5 text-sm font-bold text-muted cursor-pointer bg-bg px-4 py-2 rounded-full border border-border/60 hover:bg-border/40 transition-colors">
          <input 
            type="checkbox" 
            className="w-4 h-4 accent-primary rounded cursor-pointer"
            checked={includeBonus}
            onChange={(e) => setIncludeBonus(e.target.checked)} 
          />
          보너스 번호 포함
        </label>
      </div>

      <div className="h-[300px] sm:h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={freqData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="num" 
              tick={{ fontSize: 12, fill: "#9CA3AF" }} 
              tickLine={false} 
              axisLine={false} 
              interval={0}
              tickFormatter={(v) => (v % 5 === 0 || v === 1 ? v : "")} // 화면 복잡함을 방지
            />
            <YAxis 
              tick={{ fontSize: 12, fill: "#9CA3AF" }} 
              tickLine={false} 
              axisLine={false} 
            />
            <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}>
              {freqData.map((entry, index) => {
                const isTop5 = entry.count >= top5Threshold;
                return (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={isTop5 ? "#FF6B35" : getColor(entry.num)} 
                    fillOpacity={isTop5 ? 1 : 0.4}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-muted gap-3">
        <div className="flex gap-4 flex-wrap">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#FBBF24] opacity-50"></span>1-10</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#60A5FA] opacity-50"></span>11-20</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#F87171] opacity-50"></span>21-30</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#9CA3AF] opacity-50"></span>31-40</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#34D399] opacity-50"></span>41-45</span>
        </div>
        <span className="font-bold flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full">
          <span className="w-3 h-3 rounded-full bg-primary animate-pulse"></span>
          TOP 5 강조 표시
        </span>
      </div>
    </div>
  );
}
