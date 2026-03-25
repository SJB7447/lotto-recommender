import { NextResponse } from "next/server";
import { getLatestDrawNo, upsertDraw } from "@/lib/firestore";
import { fetchLottoDrawFromDH } from "@/lib/lotto-api";
import { LottoDraw } from "@/types/lotto";

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
      const MAX_SYNC = 10;

      for (let i = 1; i <= MAX_SYNC; i++) {
        const targetDrawNo = currentMax + i;
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
