import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables before anything else
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") }); // Fallback

async function main() {
  try {
    const { getLatestDrawNo, upsertDraw } = await import("../lib/firestore");
    const { fetchLottoDrawFromDH } = await import("../lib/lotto-api");

    let currentMax = await getLatestDrawNo();
    console.log(`[Sync] 현재 Firestore에 저장된 가장 최근 회차: ${currentMax === 0 ? "없음" : currentMax}`);

    let syncedCount = 0;
    while (true) {
      const targetDrawNo = currentMax + 1;
      console.log(`[Sync] ${targetDrawNo}회차 데이터를 동기화 요청하는 중...`);
      
      const apiResult = await fetchLottoDrawFromDH(targetDrawNo);
      if (!apiResult) {
        console.log(`[Sync] ${targetDrawNo}회차 데이터가 없습니다. (가장 최신까지 동기화 완료 혹은 API 오류)`);
        break;
      }

      await upsertDraw(apiResult);
      syncedCount++;
      currentMax++;
      console.log(`[Sync] => ${targetDrawNo}회차 저장 완료!`);
      
      // Delay to avoid spamming the DH API
      await new Promise(res => setTimeout(res, 300));
    }
    
    console.log(`[Sync] 총 ${syncedCount}개의 최신 회차 데이터를 동기화했습니다!`);
    process.exit(0);
  } catch (err) {
    console.error(`[Sync] Error during sync:`, err);
    process.exit(1);
  }
}

main();
