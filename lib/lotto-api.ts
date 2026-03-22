import axios from "axios";
import { LottoDraw } from "../types/lotto";

interface DHLotteryResponse {
  returnValue: string;
  drwNo: number;
  drwNoDate: string;
  drwtNo1: number;
  drwtNo2: number;
  drwtNo3: number;
  drwtNo4: number;
  drwtNo5: number;
  drwtNo6: number;
  bnusNo: number;
  firstPrzwnerCo: number;
  firstWinamnt: number;
}

export async function fetchLottoDrawFromDH(drawNo: number): Promise<LottoDraw | null> {
  try {
    const { data } = await axios.get<DHLotteryResponse>(
      `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${drawNo}`
    );

    if (data.returnValue !== "success") {
      return null;
    }

    const nums = [
      data.drwtNo1,
      data.drwtNo2,
      data.drwtNo3,
      data.drwtNo4,
      data.drwtNo5,
      data.drwtNo6,
    ].sort((a, b) => a - b);

    return {
      drawNo: data.drwNo,
      drawDate: data.drwNoDate,
      nums,
      bonus: data.bnusNo,
      oddCount: nums.filter(n => n % 2 !== 0).length,
      evenCount: nums.filter(n => n % 2 === 0).length,
      lowCount: nums.filter(n => n >= 1 && n <= 22).length,
      highCount: nums.filter(n => n >= 23 && n <= 45).length,
      range1: nums.filter(n => n >= 1 && n <= 10).length,
      range2: nums.filter(n => n >= 11 && n <= 20).length,
      range3: nums.filter(n => n >= 21 && n <= 30).length,
      range4: nums.filter(n => n >= 31 && n <= 40).length,
      range5: nums.filter(n => n >= 41 && n <= 45).length,
      prize1stCount: data.firstPrzwnerCo,
      prize1stAmount: data.firstWinamnt,
    };
  } catch (error) {
    console.error("DH Lottery API fetch error:", error);
    return null;
  }
}
