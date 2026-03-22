"use client";

import React, { useEffect, useState } from "react";
import { getAllDraws } from "@/lib/firestore";
import { LottoDraw } from "@/types/lotto";
import { LottoBall } from "@/components/LottoBall";

export default function HistoryPage() {
  const [allDraws, setAllDraws] = useState<LottoDraw[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getAllDraws();
        setAllDraws(data || []);
      } catch (err) {
        console.error("데이터 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg text-main-text">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  // 필터링 적용 (회차 검색)
  const filteredDraws = allDraws.filter(draw => 
    searchQuery === "" || String(draw.drawNo).includes(searchQuery)
  );
  
  const totalPages = Math.max(1, Math.ceil(filteredDraws.length / itemsPerPage));
  const paginatedDraws = filteredDraws.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <main className="min-h-screen bg-bg text-main-text pb-24 pt-10">
      <div className="max-w-5xl mx-auto px-5">
        
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-primary mb-3">
              <span className="text-4xl mr-2">📜</span>과거 회차 기록
            </h1>
            <p className="text-muted font-medium text-sm sm:text-base">역대 로또 당첨 번호와 1등 당첨 통계 정보</p>
          </div>
          
          <div className="relative w-full md:w-auto">
            <input 
              type="text" 
              placeholder="회차 번호 검색 (예: 1000)..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="px-5 py-3 pr-10 bg-surface border-2 border-border/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 text-sm font-bold w-full md:w-64 transition-all shadow-inner"
            />
            <span className="absolute right-3.5 top-3.5 text-lg opacity-50">🔍</span>
          </div>
        </header>

        <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="bg-gray-50 border-b border-border text-xs uppercase text-muted font-black tracking-wider">
                  <th className="p-4 text-center w-24">회차</th>
                  <th className="p-4 w-32">추첨일</th>
                  <th className="p-4 text-center min-w-[280px]">당첨번호 + 보너스</th>
                  <th className="p-4 text-right w-32">1등 당첨자</th>
                  <th className="p-4 text-right w-40">1등 당첨금액</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {paginatedDraws.length > 0 ? (
                  paginatedDraws.map((draw) => (
                    <tr key={draw.drawNo} className="hover:bg-primary/5 transition-colors group">
                      <td className="p-4 text-center font-black text-primary">
                        <span className="bg-primary/10 px-2 py-1 rounded-md">{draw.drawNo}회</span>
                      </td>
                      <td className="p-4 text-sm text-muted font-bold">{draw.drawDate}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                          {draw.nums.map((num, i) => (
                            <LottoBall key={i} num={num} size="sm" />
                          ))}
                          <div className="text-border mx-1 font-light">+</div>
                          <LottoBall num={draw.bonus} size="sm" bonus />
                        </div>
                      </td>
                      <td className="p-4 text-right font-black text-main-text">{draw.prize1stCount.toLocaleString()}명</td>
                      <td className="p-4 text-right font-black text-secondary">
                        {Math.floor(draw.prize1stAmount / 100000000).toLocaleString()}억 원
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-muted font-bold text-base bg-gray-50/50">
                      {searchQuery ? `"${searchQuery}" 회차 검색 결과가 없습니다.` : "저장된 당첨 기록이 없습니다."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* 페이지네이션 */}
          {totalPages > 1 && (
             <div className="flex flex-col sm:flex-row items-center justify-between p-4 px-6 border-t border-border bg-gray-50/80 gap-4">
               <span className="text-xs font-bold text-muted">
                 총 {filteredDraws.length}건 중 <span className="text-main-text">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-main-text">{Math.min(currentPage * itemsPerPage, filteredDraws.length)}</span>
               </span>
               <div className="flex items-center gap-2">
                 <button 
                   onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                   disabled={currentPage === 1}
                   className="px-3.5 py-1.5 bg-surface border border-border rounded-lg text-sm font-bold disabled:opacity-40 hover:bg-border/40 hover:text-primary transition-all active:scale-95"
                 >
                   이전
                 </button>
                 <div className="flex items-center gap-1.5 hidden sm:flex">
                   {[...Array(Math.min(5, totalPages))].map((_, i) => {
                     let pageNum = currentPage;
                     if (currentPage <= 3) pageNum = i + 1;
                     else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                     else pageNum = currentPage - 2 + i;
                     
                     if (pageNum <= 0 || pageNum > totalPages) return null;
 
                     return (
                       <button
                         key={pageNum}
                         onClick={() => setCurrentPage(pageNum)}
                         className={`w-8 h-8 rounded-lg text-sm font-black flex items-center justify-center transition-all active:scale-95 ${
                           currentPage === pageNum
                             ? "bg-primary text-white shadow-md shadow-primary/30 ring-2 ring-primary ring-offset-1 ring-offset-gray-50"
                             : "bg-surface hover:bg-border/60 hover:text-primary text-muted border border-border"
                         }`}
                       >
                         {pageNum}
                       </button>
                     );
                   })}
                 </div>
                 <button 
                   onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                   disabled={currentPage === totalPages}
                   className="px-3.5 py-1.5 bg-surface border border-border rounded-lg text-sm font-bold disabled:opacity-40 hover:bg-border/40 hover:text-primary transition-all active:scale-95"
                 >
                   다음
                 </button>
               </div>
             </div>
           )}
        </div>
      </div>
    </main>
  );
}
