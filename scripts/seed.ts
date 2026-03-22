import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";
import { LottoDraw } from "../types/lotto";
import * as dotenv from "dotenv";

// .env.local 변수 로드 (Firebase Admin이나 Client SDK 용)
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { db } from "../lib/firebase";
import { doc, getDoc, writeBatch } from "firebase/firestore";

export function parseLottoCSV(): LottoDraw[] {
  let filePath = path.resolve(process.cwd(), "data", "6_45_Lotto.csv");
  if (!fs.existsSync(filePath)) {
    filePath = path.resolve(process.cwd(), "6_45_Lotto.csv");
  }
  
  const fileContent = fs.readFileSync(filePath, "utf-8");

  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
  });

  return records.map((row: any) => {
    const nums = [
      Number(row["당첨번호 1"]),
      Number(row["2"]),
      Number(row["3"]),
      Number(row["4"]),
      Number(row["5"]),
      Number(row["6"]),
    ].sort((a, b) => a - b);

    return {
      drawNo: Number(row["회차"]),
      drawDate: row["추첨일"],
      nums,
      bonus: Number(row["보너스번호"]),
      oddCount: Number(row["홀수"]),
      evenCount: Number(row["짝수"]),
      lowCount: Number(row["낮은 번호"]),
      highCount: Number(row["높은 번호"]),
      range1: Number(row["1-10"]),
      range2: Number(row["11-20"]),
      range3: Number(row["21-30"]),
      range4: Number(row["31-40"]),
      range5: Number(row["41-50"]),
      prize1stCount: Number(row["1등 당첨자수"]),
      prize1stAmount: Number(row["1등 당첨금액"]),
    } as LottoDraw;
  });
}

async function seedFirestore() {
  console.log("CSV 파싱 시작...");
  const data = parseLottoCSV();
  console.log(`파싱 완료: 총 ${data.length} 건\n`);

  console.log("Firestore 업로드 시작...");
  
  let batch = writeBatch(db);
  let batchSize = 0;
  let uploadedCount = 0;
  let skippedCount = 0;
  const BATCH_LIMIT = 500;

  for (let i = 0; i < data.length; i++) {
    const draw = data[i];
    const docRef = doc(db, "draws", String(draw.drawNo));

    // 중복 방지 (이미 존재하는지 확인)
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      skippedCount++;
    } else {
      batch.set(docRef, draw);
      batchSize++;
      uploadedCount++;
    }

    // 500개 제한 시 커밋 및 배치 초기화
    if (batchSize === BATCH_LIMIT) {
      await batch.commit();
      console.log(`-> ${uploadedCount} 건 배치 업로드 완료...`);
      batch = writeBatch(db);
      batchSize = 0;
    }

    // 진행 상황 출력
    if ((i + 1) % 100 === 0) {
      console.log(`진행 상황: ${i + 1} / ${data.length} 건 확인 완료`);
    }
  }

  // 잔여 배치 커밋
  if (batchSize > 0) {
    await batch.commit();
    console.log(`-> 마지막 ${batchSize} 건 배치 업로드 완료...`);
  }

  console.log("\n=======================================");
  console.log("CSV 시딩 스크립트 실행 완료!");
  console.log(`- 신규 업로드: ${uploadedCount} 건`);
  console.log(`- 스킵됨 (중복): ${skippedCount} 건`);
  console.log("=======================================\n");

  process.exit(0);
}

// 직접 실행한 경우
if (require.main === module || process.argv[1]?.includes("seed.ts")) {
  seedFirestore().catch((error) => {
    console.error("\n[오류 발생] 시딩 스크립트 실행 중 에러가 발생했습니다:", error);
    process.exit(1);
  });
}
