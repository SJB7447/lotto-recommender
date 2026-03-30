import { NextResponse } from "next/server";
import { getLatestDrawNo, upsertDraw } from "@/lib/firestore";
import { fetchLottoDrawFromDH } from "@/lib/lotto-api";
import { LottoDraw } from "@/types/lotto";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const fromDraw = url.searchParams.get("from");
    const toDraw = url.searchParams.get("to");

    const updatedDraws: LottoDraw[] = [];

    if (fromDraw && toDraw) {
      // Force re-sync mode: re-fetch specific range of draws
      const from = parseInt(fromDraw, 10);
      const to = parseInt(toDraw, 10);

      for (let drawNo = from; drawNo <= to; drawNo++) {
        console.log(`[Sync] Fetching draw ${drawNo}...`);
        const apiResult = await fetchLottoDrawFromDH(drawNo);
        if (apiResult) {
          console.log(`[Sync] Draw ${drawNo}: prize=${apiResult.prize1stAmount}, count=${apiResult.prize1stCount}`);
          await upsertDraw(apiResult);
          updatedDraws.push(apiResult);
        } else {
          console.log(`[Sync] Draw ${drawNo}: null result`);
        }
      }
    } else {
      // Normal sync mode: fetch new draws after latest
      let currentMax = await getLatestDrawNo();
      
      // Check if currentMax has 0 prize (e.g. synced too early on Saturday)
      // If it has 0 prize, we should include it in the sync list
      let startDraw = currentMax;
      if (currentMax > 0) {
        const { getDrawByNo } = await import("@/lib/firestore");
        const latestInfo = await getDrawByNo(currentMax);
        if (latestInfo && latestInfo.prize1stAmount === 0) {
          startDraw = currentMax - 1; // start fetching from currentMax
        }
      }

      const MAX_SYNC = 10;

      for (let i = 1; i <= MAX_SYNC; i++) {
        const targetDrawNo = startDraw + i;
        const apiResult = await fetchLottoDrawFromDH(targetDrawNo);

        if (!apiResult) {
          break;
        }

        await upsertDraw(apiResult);
        updatedDraws.push(apiResult);
      }
    }

    return NextResponse.json({
      success: true,
      count: updatedDraws.length,
      updatedDraws,
    });
  } catch (error) {
    console.error("Sync API Error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
