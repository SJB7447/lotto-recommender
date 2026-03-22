"use client";

import { useEffect, useState } from "react";
import { LottoBall } from "@/components/LottoBall";
import { getBoard, removeFromBoard, SavedEntry } from "@/lib/board";

export default function SavedPage() {
  const [pin, setPin] = useState<string | null>(null);
  const [inputPin, setInputPin] = useState("");
  const [saved, setSaved] = useState<SavedEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedPin = localStorage.getItem('lotto_pin');
    if (storedPin) {
      setPin(storedPin);
      fetchBoard(storedPin);
    }
  }, []);

  const fetchBoard = async (targetPin: string) => {
    setLoading(true);
    try {
      const data = await getBoard(targetPin);
      setSaved([...data].reverse());
    } catch (e) {
      console.error(e);
      alert("데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPin.trim()) return;
    const finalPin = inputPin.trim();
    localStorage.setItem('lotto_pin', finalPin);
    setPin(finalPin);
    fetchBoard(finalPin);
  };

  const handleLogout = () => {
    if (!confirm("현재 즐겨찾기 방에서 접속을 끊으시겠습니까?")) return;
    localStorage.removeItem('lotto_pin');
    setPin(null);
    setSaved([]);
    setInputPin("");
  };

  const handleDelete = async (item: SavedEntry) => {
    if (!pin) return;
    if (!confirm("정말 이 행운의 번호를 삭제하시겠습니까?")) return;
    
    try {
      await removeFromBoard(pin, item);
      setSaved(saved.filter(s => s.id !== item.id));
    } catch (e) {
      alert("삭제 중 에러가 발생했습니다.");
    }
  };

  if (!pin) {
    return (
      <main className="min-h-screen bg-bg text-main-text pb-24 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-5 pt-12">
           <div className="bg-white p-8 sm:p-10 rounded-[2rem] border-[3px] border-border/50 shadow-md text-center animate-fade-in transition-all">
             <div className="text-7xl mb-6">🔑</div>
             <h2 className="text-3xl font-black text-primary mb-3">나만의 보관함 PIN</h2>
             <p className="text-muted font-bold text-base mb-8 break-keep hide-on-large">
               개인 보관함을 열기 위한 <b>숫자나 영문 핀(PIN) 번호</b>를 입력하세요!<br/><br/>
               <span className="text-sm">처음이신 경우 원하시는 번호를 아무거나 치시면 자동으로 고유한 방이 개설됩니다.</span>
             </p>
             
             <form onSubmit={handleLogin} className="flex flex-col gap-5">
               <input 
                 type="text" 
                 value={inputPin}
                 onChange={(e) => setInputPin(e.target.value)}
                 placeholder="예: 7777 / father123"
                 className="w-full bg-bg border-2 border-border rounded-2xl px-6 py-5 text-center text-2xl font-black text-primary focus:outline-none focus:border-primary focus:ring-4 ring-primary/20 transition-all font-mono"
                 autoFocus
               />
               <button 
                 type="submit"
                 className="w-full bg-primary hover:bg-[#E05A2A] text-white px-6 py-5 rounded-2xl font-black text-xl shadow-[0_8px_15px_rgba(255,107,53,0.3)] transition-transform active:scale-95"
               >
                 안전하게 보관함 열기
               </button>
             </form>
           </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg text-main-text pb-24">
      <div className="max-w-3xl mx-auto px-5 pt-12">
        <header className="mb-10 text-center animate-fade-in relative mt-8">
          <button 
            onClick={handleLogout}
            className="absolute right-0 top-0 sm:-top-8 bg-surface border-2 border-border text-muted font-black px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-sm hover:text-red-500 hover:border-red-200 transition-colors shadow-sm"
          >
             🚪 방 나가기
          </button>
          <p className="text-secondary font-black text-sm sm:text-base mb-2 hide-on-large">보안 PIN : {pin} 방 👨‍👩‍👧</p>
          <h1 className="text-4xl md:text-5xl font-black text-primary mb-4 tracking-tight drop-shadow-sm">
            <span className="text-4xl sm:text-5xl mr-2">⭐</span>내 보관함
          </h1>
          <p className="text-muted font-bold text-base sm:text-lg break-keep hide-on-large">
            뽑으신 번호 중 마음에 들어서 영구적으로 저장해두신 목록입니다.
          </p>
        </header>

        {loading ? (
          <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-border/50 shadow-sm">
            <div className="w-14 h-14 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-primary font-black text-xl animate-pulse">DB에서 행운을 불러오는 중입니다...</p>
          </div>
        ) : saved.length === 0 ? (
          <div className="text-center bg-white p-10 rounded-[2rem] border-2 border-border/50 shadow-sm mt-10 animate-fade-in">
            <div className="text-6xl mb-6">📭</div>
            <h3 className="text-2xl font-black text-primary mb-3">아직 보관된 번호가 없습니다</h3>
            <p className="text-muted font-bold text-lg break-keep">
              홈 화면에서 행운의 번호를 맘껏 당겨보고, 가장 느낌이 좋은 번호를 꾹 저장해주세요!
            </p>
          </div>
        ) : (
          <div className="grid gap-6 animate-fade-in">
            {saved.map((item, idx) => (
              <div key={idx} className="bg-surface p-7 sm:p-8 rounded-[2rem] shadow-sm border-[3px] border-border flex flex-col md:flex-row md:items-center justify-between gap-5 relative group hover:border-primary/40 transition-colors">
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
                  onClick={() => handleDelete(item)}
                  className="absolute top-6 right-6 text-border hover:text-red-500 hover:bg-red-50 rounded-full font-bold text-2xl h-10 w-10 flex items-center justify-center transition-colors"
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
