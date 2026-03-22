import React from "react";
import { LottoDraw } from "@/types/lotto";
import { LottoBall } from "./LottoBall";

interface DrawCardProps {
  draw: LottoDraw;
}

export function DrawCard({ draw }: DrawCardProps) {
  return (
    <div className="bg-surface p-6 sm:p-8 rounded-[2rem] shadow-sm border-2 border-border flex flex-col xl:flex-row xl:items-center justify-between gap-5 hover:shadow-md transition-shadow mb-4">
      <div>
        <h3 className="font-black text-2xl text-primary mb-1.5">
          제 {draw.drawNo}회
        </h3>
        <p className="text-base text-muted font-bold">{draw.drawDate} 추첨</p>
      </div>
      
      <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
        {draw.nums.map((num, i) => (
          <LottoBall key={i} num={num} size="md" />
        ))}
        <div className="text-main-text/40 text-2xl pb-1 mx-0.5 font-light">+</div>
        <LottoBall num={draw.bonus} size="md" bonus />
      </div>
    </div>
  );
}
