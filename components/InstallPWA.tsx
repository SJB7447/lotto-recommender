"use client";

import { useEffect, useState } from "react";

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 이미 앱으로 설치된 상태인지 확인 (Android/PC standalone 또는 iOS standalone)
    if (window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
      return;
    }

    // Android/Chrome 설치 프롬프트 캡처
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // iOS 기기 감지 (설치 버튼을 띄우지 못하므로 안내 문구용)
    const ua = window.navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    if (isIOSDevice) {
      setIsIOS(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  // 앱으로 이미 열려있으면 아예 아무것도 렌더링하지 않음 (표시/설치 버튼 모두 사라짐)
  if (isStandalone) return null;
  
  // 브라우저에서 설치 기능을 지원하지 않거나(이미 설치됨 등) iOS가 아니면 렌더링하지 않음
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

  // 닫기(X)를 눌렀을 때 나타나는 작은 버튼
  if (isDismissed) {
    return (
      <div className="flex justify-center mb-10 w-full animate-fade-in">
        <button
          onClick={() => setIsDismissed(false)}
          className="bg-surface border-2 border-border text-muted hover:text-primary hover:border-primary/50 px-6 py-3 rounded-full text-sm sm:text-base font-bold flex items-center gap-2 shadow-sm transition-all"
        >
          <span className="text-xl">📱</span> 언제든 다시 앱으로 설치하기
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#FFFBF0] border-[3px] border-primary/20 rounded-[2rem] pt-12 pb-7 px-6 sm:p-8 mb-12 shadow-sm relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 animate-fade-in group hover:border-primary/40 transition-colors">
      <div className="absolute -top-10 -right-10 text-9xl opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-500">📱</div>
      
      <button 
        onClick={() => setIsDismissed(true)} 
        className="absolute top-3 right-3 sm:top-5 sm:right-5 w-10 h-10 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/15 text-muted hover:text-main-text font-black text-lg transition-colors cursor-pointer z-10"
        title="나중에 하기 (닫기)"
      >
        ✕
      </button>

      <div className="flex items-center gap-5 w-full z-0">
        <div className="text-5xl drop-shadow-sm hidden sm:block">📱</div>
        <div className="flex-1 pr-2 sm:pr-8">
          <h3 className="font-black text-2xl text-primary mb-2 flex items-center gap-2">
            <span className="text-3xl sm:hidden">📱</span> 행운로또 앱 설치하기
          </h3>
          <p className="text-muted font-bold text-base leading-relaxed break-keep hide-on-large mt-2">
            {isIOS 
              ? "아이폰 사파리 하단의 [공유] ➡️ [홈 화면에 추가]를 꾹 누르시면 바탕화면에서 터치 한 번으로 열 수 있습니다!"
              : "클릭 한 번으로 바탕화면에 설치하고 언제 어디서든 편하게 번호를 당겨보세요!"}
          </p>
        </div>
      </div>
      
      {!isIOS && deferredPrompt && (
        <button 
          onClick={handleInstallClick}
          className="bg-primary hover:bg-[#E05A2A] w-full sm:w-auto text-white font-black text-xl px-8 py-5 sm:py-4 rounded-2xl shadow-md hover:scale-105 active:scale-95 transition-transform flex-shrink-0 z-10"
        >
          ⬇️ 바로 설치하기
        </button>
      )}
    </div>
  );
}
