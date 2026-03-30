import axios from "axios";
import { LottoDraw } from "../types/lotto";

export async function fetchLottoDrawFromDH(drawNo: number): Promise<LottoDraw | null> {
  try {
    const url = "https://search.naver.com/search.naver?query=" + encodeURIComponent(`${drawNo}회 로또당첨번호`) + `&t=${Date.now()}`;
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

    // 1등 당첨금, 당첨자 수 추출
    // Pattern: <p class="win_text">1등 당첨금 <strong class="emphasis">2,148,654,000</strong>원 (당첨 복권수 14개)</p>
    let prize1stAmount = 0;
    let prize1stCount = 0;

    const prizeMatch = html.match(/<strong class="emphasis">([\d,]+)<\/strong>원\s*\(당첨 복권수\s*(\d+)개\)/);
    if (prizeMatch) {
      prize1stAmount = Number(prizeMatch[1].replace(/,/g, ""));
      prize1stCount = Number(prizeMatch[2]);
    }

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
      prize1stCount,
      prize1stAmount,
    };
  } catch (error) {
    console.error("Naver scraping error:", error);
    return null;
  }
}
