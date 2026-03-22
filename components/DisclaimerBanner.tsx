import React from "react";

export function DisclaimerBanner() {
  return (
    <div className="bg-[#FEF3C7] text-[#92400E] p-5 rounded-2xl mb-8 text-sm flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full shadow-sm border border-[#FDE68A]">
      <div className="text-3xl shrink-0">⚠️</div>
      <div className="flex-1 font-medium leading-relaxed">
        <p>이 서비스는 통계 기반 참고 자료입니다.</p>
        <p>로또는 완전한 무작위 추첨이며, 과거 데이터는 미래 결과를 보장하지 않습니다.</p>
        <p className="mt-1 font-bold">건전한 소비 범위 내에서 즐겨주세요 🙏</p>
      </div>
    </div>
  );
}
