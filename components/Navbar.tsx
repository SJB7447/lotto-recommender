"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getLatestDrawNo } from "@/lib/firestore";

export function Navbar() {
  const pathname = usePathname();
  const [latestDraw, setLatestDraw] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    getLatestDrawNo().then(setLatestDraw).catch(console.error);
  }, []);

  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setToastMessage("동기화 중...");
    
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data = await res.json();
      
      if (data.success) {
        if (data.count > 0) {
          sessionStorage.removeItem("draws_cache");
          setToastMessage(`✅ ${data.count}개의 새로운 회차가 동기화되었습니다!`);
          const maxNo = Math.max(...data.updatedDraws.map((d: any) => d.drawNo));
          setLatestDraw(maxNo);
          setTimeout(() => window.location.reload(), 2000);
        } else {
          setToastMessage("ℹ️ 이미 최신 회차입니다.");
          setTimeout(() => setToastMessage(""), 3000);
        }
      } else {
        setToastMessage("❌ 동기화 실패: " + data.error);
        setTimeout(() => setToastMessage(""), 3000);
      }
    } catch (e) {
      setToastMessage("❌ 서버 연결 에러가 발생했습니다.");
      setTimeout(() => setToastMessage(""), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  const links = [
    { name: "홈", path: "/" },
    { name: "통계", path: "/stats" },
    { name: "기록", path: "/history" },
    { name: "🎁 내 보관함", path: "/saved"}
  ];

  return (
    <>
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#1A1A1A] text-white px-6 py-3 rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.2)] font-bold text-sm tracking-wide border border-gray-700 animate-bounce-in min-w-max flex justify-center items-center">
          {toastMessage}
        </div>
      )}
      <nav className="bg-surface border-b border-border sticky top-0 z-40 shadow-sm backdrop-blur-md bg-white/90">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="font-black text-xl text-primary flex items-center gap-2 hover:scale-105 transition-transform">
            <span className="text-2xl">🍀</span> LottoStat
          </Link>
          
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden sm:flex items-center gap-6 font-bold text-sm">
              {links.map((link) => (
                <Link 
                  key={link.path} 
                  href={link.path}
                  className={`relative hover:text-primary transition-colors ${
                    pathname === link.path ? "text-primary" : "text-muted"
                  }`}
                >
                  {link.name}
                  {pathname === link.path && (
                    <div className="absolute -bottom-5 w-full h-1 bg-primary rounded-t-sm"></div>
                  )}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3 sm:border-l border-border sm:pl-6">
              {latestDraw > 0 && (
                <span className="text-xs font-bold text-muted hidden md:inline-block bg-bg px-2.5 py-1 rounded-md border border-border">
                  {latestDraw}회차 기준
                </span>
              )}
              <button 
                onClick={handleSync}
                disabled={isSyncing}
                className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-3 sm:px-4 py-1.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1.5"
              >
                {isSyncing ? "동기화 중..." : <span>🔄 동기화</span>}
              </button>
            </div>
          </div>
        </div>
      </nav>
      {/* Mobile nav fallback */}
      <div className="sm:hidden flex items-center justify-center gap-8 font-bold text-sm border-b border-border bg-surface py-3 px-5 shadow-sm">
        {links.map((link) => (
          <Link 
            key={link.path} 
            href={link.path}
            className={`hover:text-primary transition-colors ${
              pathname === link.path ? "text-primary" : "text-muted"
            }`}
          >
            {link.name}
          </Link>
        ))}
      </div>
    </>
  );
}
