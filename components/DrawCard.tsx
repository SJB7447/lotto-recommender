import React from "react";
import { LottoDraw } from "@/types/lotto";
import { LottoBall } from "./LottoBall";

interface DrawCardProps {
  draw: LottoDraw;
}

export function DrawCard({ draw }: DrawCardProps) {
  return (
    <div className="bg-surface p-5 rounded-2xl shadow-sm border border-border flex flex-col xl:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow">
      <div>
        <h3 className="font-bold text-lg text-primary">
          제 {draw.drawNo}회
        </h3>
        <p className="text-sm text-muted">{draw.drawDate} 추첨</p>
      </div>
      
      <div className="flex items-center flex-wrap gap-2">
        {draw.nums.map((num, i) => (
          <LottoBall key={i} num={num} size="md" />
        ))}
        <div className="text-muted text-xl pb-1 mx-1 font-light">+</div>
        <LottoBall num={draw.bonus} size="md" bonus />
      </div>
    </div>
  );
}
