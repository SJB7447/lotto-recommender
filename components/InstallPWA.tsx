"use client";

import { useEffect, useState } from "react";

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
      return;
    }

    // Capture Android install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Detect iOS
    const ua = window.navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    if (isIOSDevice) {
      setIsIOS(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  if (isStandalone || isDismissed) return null;
  if (!deferredPrompt && !isIOS) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
      }
    }
  };

  return (
    <div className="bg-[#FFFBF0] border-[3px] border-primary/20 rounded-[2rem] p-6 mb-12 shadow-sm relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 animate-fade-in group hover:border-primary/40 transition-colors">
      <div className="absolute -top-10 -right-10 text-9xl opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-500">📱</div>
      
      <button 
        onClick={() => setIsDismissed(true)} 
        className="absolute top-4 right-5 text-muted hover:text-primary font-bold text-xl px-2 pb-1"
        title="닫기"
      >
        ✕
      </button>

      <div className="flex items-center gap-5 w-full">
        <div className="text-5xl drop-shadow-sm">📱</div>
        <div className="flex-1 pr-6">
          <h3 className="font-black text-2xl text-primary mb-2">행운로또 앱 설치하기</h3>
          <p className="text-muted font-bold text-base leading-relaxed break-keep">
            {isIOS 
              ? "아이폰 사파리 하단의 [공유] ➡️ [홈 화면에 추가]를 꾹 누르시면 바탕화면에서 터치 한 번으로 열 수 있습니다!"
              : "클릭 한 번으로 바탕화면에 설치하고 언제 어디서든 편하게 번호를 당겨보세요!"}
          </p>
        </div>
      </div>
      
      {!isIOS && deferredPrompt && (
        <button 
          onClick={handleInstallClick}
          className="bg-primary hover:bg-[#E05A2A] w-full sm:w-auto text-white font-black text-xl px-8 py-5 sm:py-4 rounded-2xl shadow-md hover:scale-105 active:scale-95 transition-transform flex-shrink-0"
        >
          ⬇️ 바로 설치하기
        </button>
      )}
    </div>
  );
}
