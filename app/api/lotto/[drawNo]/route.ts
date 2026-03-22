import { NextResponse } from "next/server";
import { fetchLottoDrawFromDH } from "@/lib/lotto-api";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ drawNo: string }> }
) {
  try {
    const { drawNo } = await params;
    const drawNoNum = Number(drawNo);

    if (isNaN(drawNoNum)) {
      return NextResponse.json({ error: "회차 번호가 유효하지 않습니다." }, { status: 400 });
    }

    const lottoDraw = await fetchLottoDrawFromDH(drawNoNum);

    if (!lottoDraw) {
      return NextResponse.json({ error: "회차 정보를 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json(lottoDraw);
  } catch (error) {
    console.error("Lotto Proxy API Error:", error);
    return NextResponse.json(
      { error: "동행복권 API 연동 중 서버 에러가 발생했습니다." },
      { status: 500 }
    );
  }
}
