import axios from "axios";
import { LottoDraw } from "../types/lotto";

export async function fetchLottoDrawFromDH(drawNo: number): Promise<LottoDraw | null> {
  try {
    const url = "https://search.naver.com/search.naver?query=" + encodeURIComponent(`${drawNo}회 로또당첨번호`);
    const { data: html } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept-Language": "ko-KR,ko;q=0.9",
      }
    });

    const drawMatch = html.match(/<a[^>]*class="[^"]*_text[^"]*"[^>]*>(\d+)회차/);
    if (!drawMatch || parseInt(drawMatch[1], 10) !== drawNo) {
      console.log(`[Sync] Naver could not find exact match for draw ${drawNo}.`);
      return null;
    }

    const numRegex = /<span class="ball[^"]*">(\d+)<\/span>/g;
    const extracted: number[] = [];
    let match;
    while ((match = numRegex.exec(html)) !== null && extracted.length < 7) {
      extracted.push(Number(match[1]));
    }

    if (extracted.length < 7) {
      console.log(`[Sync] Could not parse exactly 7 numbers for draw ${drawNo}. Found: ${extracted.length}`);
      return null;
    }

    const nums = extracted.slice(0, 6).sort((a, b) => a - b);
    const bonus = extracted[6];

    const dateMatch = html.match(/(\d{4}\.\d{2}\.\d{2})\./);
    const drawDate = dateMatch ? dateMatch[1].replace(/\./g, "-") : "";

    return {
      drawNo,
      drawDate,
      nums,
      bonus,
      oddCount: nums.filter(n => n % 2 !== 0).length,
      evenCount: nums.filter(n => n % 2 === 0).length,
      lowCount: nums.filter(n => n >= 1 && n <= 22).length,
      highCount: nums.filter(n => n >= 23 && n <= 45).length,
      range1: nums.filter(n => n >= 1 && n <= 10).length,
      range2: nums.filter(n => n >= 11 && n <= 20).length,
      range3: nums.filter(n => n >= 21 && n <= 30).length,
      range4: nums.filter(n => n >= 31 && n <= 40).length,
      range5: nums.filter(n => n >= 41 && n <= 45).length,
      prize1stCount: 0,
      prize1stAmount: 0,
    };
  } catch (error) {
    console.error("Naver scraping error:", error);
    return null;
  }
}
