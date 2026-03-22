"use client";

import { useEffect, useState } from "react";
import { LottoBall } from "@/components/LottoBall";

export default function SavedPage() {
  const [saved, setSaved] = useState<any[]>([]);

  useEffect(() => {
    setSaved(JSON.parse(localStorage.getItem('saved_lotto') || '[]'));
  }, []);

  const handleDelete = (id: number) => {
    if (!confirm("정말 이 행운의 번호를 삭제하시겠습니까?")) return;
    const updated = saved.filter(s => s.id !== id);
    localStorage.setItem('saved_lotto', JSON.stringify(updated));
    setSaved(updated);
  };

  return (
    <main className="min-h-screen bg-bg text-main-text pb-24">
      <div className="max-w-3xl mx-auto px-5 pt-12">
        <header className="mb-12 text-center animate-fade-in">
          <p className="text-secondary font-black text-sm sm:text-base mb-2">아버님만의 소중한 선택 보관함 👨‍👩‍👧</p>
          <h1 className="text-4xl md:text-5xl font-black text-primary mb-4 tracking-tight drop-shadow-sm">
            <span className="text-4xl sm:text-5xl mr-2">⭐</span>내 보관함
          </h1>
          <p className="text-muted font-bold text-base sm:text-lg">뽑으신 번호 중 마음에 들어서 저장해두신 목록입니다.</p>
        </header>

        {saved.length === 0 ? (
          <div className="text-center bg-white p-10 rounded-[2rem] border-2 border-border/50 shadow-sm mt-10">
            <div className="text-6xl mb-6">📭</div>
            <h3 className="text-2xl font-black text-primary mb-3">아직 보관된 번호가 없습니다</h3>
            <p className="text-muted font-bold text-lg">홈 화면에서 행운의 번호를 당겨보고, 가장 마음에 드는 번호를 꾹 저장해주세요!</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {saved.map(item => (
              <div key={item.id} className="bg-surface p-7 sm:p-8 rounded-[2rem] shadow-sm border-2 border-border flex flex-col md:flex-row md:items-center justify-between gap-5 relative group hover:border-primary/30 transition-colors">
                <div>
                  <div className="bg-secondary/10 text-secondary font-black px-4 py-1.5 rounded-full text-sm inline-block mb-3 border border-secondary/20 shadow-sm">
                    {item.modeLabel}
                  </div>
                  <p className="text-muted font-bold mb-2 break-keep text-base">저장일: {item.date}</p>
                </div>
                
                <div className="flex items-center flex-wrap gap-2.5 sm:gap-3 mr-8 md:mr-0">
                  {item.nums.map((num: number, i: number) => (
                    <LottoBall key={i} num={num} size="md" />
                  ))}
                </div>

                <button 
                  onClick={() => handleDelete(item.id)}
                  className="absolute top-6 right-6 text-border hover:text-red-500 font-bold text-2xl px-2 py-1 transition-colors"
                  title="삭제(지우기)"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
