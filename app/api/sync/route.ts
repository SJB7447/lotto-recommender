import { NextResponse } from "next/server";
import { getLatestDrawNo, upsertDraw } from "@/lib/firestore";
import { fetchLottoDrawFromDH } from "@/lib/lotto-api";
import { LottoDraw } from "@/types/lotto";

export async function POST(request: Request) {
  try {
    // 1. Firestore에서 최신 회차 번호 조회
    let currentMax = await getLatestDrawNo();
    
    // 만약 완전히 비어있다면 1회부터 (혹은 시딩 스크립트로 채우는 것을 전제)
    if (currentMax === 0) {
      // 0으로 놔둬도 무적권 1부터 동기화 시작
    }

    const updatedDraws: LottoDraw[] = [];
    const MAX_SYNC = 10; // 무한루프 방지를 위해 한 번에 최대 10회차까지만 처리

    // 2. 현재 최신 + 1 부터 순서대로 API 호출
    for (let i = 1; i <= MAX_SYNC; i++) {
      const targetDrawNo = currentMax + i;
      const apiResult = await fetchLottoDrawFromDH(targetDrawNo);

      // 4. returnValue !== "success" 이면 더 이상 새로운 회차가 없는 것이므로 종료
      if (!apiResult) {
        break;
      }

      // 3. 데이터가 존재하면 Firestore에 업데이트 (또는 삽입)
      await upsertDraw(apiResult);
      updatedDraws.push(apiResult);
    }

    // 5. 업데이트된 회차 목록 반환
    return NextResponse.json({
      success: true,
      count: updatedDraws.length,
      updatedDraws,
    });
  } catch (error) {
    console.error("Sync API Error:", error);
    return NextResponse.json(
      { success: false, error: "최신 회차 동기화 중 서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
