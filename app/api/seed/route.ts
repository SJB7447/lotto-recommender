import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, writeBatch } from "firebase/firestore";
import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";
import { LottoDraw } from "@/types/lotto";

export const runtime = "nodejs";

export async function POST() {
  try {
    let filePath = path.resolve(process.cwd(), "data", "6_45_Lotto.csv");
    if (!fs.existsSync(filePath)) {
      filePath = path.resolve(process.cwd(), "6_45_Lotto.csv");
    }

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ success: false, error: "CSV 파일을 찾을 수 없습니다." }, { status: 404 });
    }

    const fileContent = fs.readFileSync(filePath, "utf-8");

    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      bom: true,
    });

    const data: LottoDraw[] = records.map((row: any) => {
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
      };
    });

    console.log(`[API/Seed] 파싱 완료: 총 ${data.length} 건... Firestore 업로드 시작`);

    let batch = writeBatch(db);
    let batchSize = 0;
    let uploadedCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < data.length; i++) {
      const draw = data[i];
      const docRef = doc(db, "draws", String(draw.drawNo));

      const snap = await getDoc(docRef);
      if (snap.exists()) {
        skippedCount++;
      } else {
        batch.set(docRef, draw);
        batchSize++;
        uploadedCount++;
      }

      if (batchSize === 500) {
        await batch.commit();
        console.log(`[API/Seed] -> 500건 배치 업로드 완료`);
        batch = writeBatch(db);
        batchSize = 0;
      }
    }

    if (batchSize > 0) {
      await batch.commit();
      console.log(`[API/Seed] -> 마지막 ${batchSize}건 배치 업로드 완료`);
    }

    return NextResponse.json({
      success: true,
      message: "시딩 스크립트 실행 완료",
      uploaded: uploadedCount,
      skipped: skippedCount,
    });
  } catch (error: any) {
    console.error("[API/Seed] 에러 발생:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
