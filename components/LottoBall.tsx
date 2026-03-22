import React from "react";
import clsx from "clsx";

export interface LottoBallProps {
  num: number;
  size?: "sm" | "md" | "lg";
  glow?: boolean;
  animate?: boolean;
  bonus?: boolean;
}

export function LottoBall({
  num,
  size = "md",
  glow = false,
  animate = false,
  bonus = false,
}: LottoBallProps) {
  // 로또 공식 색상 규격 적용
  let bgColor = "bg-[#718096]";
  let textColor = "text-[#ffffff]";

  if (num >= 1 && num <= 10) {
    bgColor = "bg-[#FFD700]";
    textColor = "text-[#1a1a1a]";
  } else if (num >= 11 && num <= 20) {
    bgColor = "bg-[#4A90D9]";
    textColor = "text-[#ffffff]";
  } else if (num >= 21 && num <= 30) {
    bgColor = "bg-[#E53E3E]";
    textColor = "text-[#ffffff]";
  } else if (num >= 31 && num <= 40) {
    bgColor = "bg-[#718096]";
    textColor = "text-[#ffffff]";
  } else if (num >= 41 && num <= 45) {
    bgColor = "bg-[#38A169]";
    textColor = "text-[#ffffff]";
  }

  const sizeClasses = {
    sm: "w-10 h-10 text-sm",
    md: "w-[52px] h-[52px] text-[20px]",
    lg: "w-16 h-16 text-3xl font-black",
  };

  const glowClass = glow
    ? "shadow-[0_0_15px_rgba(255,215,0,0.8)] border-2 border-[#FFD700]"
    : "";
  const bonusClass = bonus
    ? "border-2 border-dashed border-main-text opacity-95"
    : "";
  const animateClass = animate ? "animate-bounce-in" : "";

  return (
    <div
      className={clsx(
        "flex items-center justify-center rounded-full font-mono font-bold leading-none select-none transition-transform hover:scale-110 cursor-default",
        bgColor,
        textColor,
        sizeClasses[size],
        glowClass,
        bonusClass,
        animateClass
      )}
    >
      {num}
    </div>
  );
}
