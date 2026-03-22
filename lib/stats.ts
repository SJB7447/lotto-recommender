import { LottoDraw, NumberStat, GenerateMode, GenerateResult } from "../types/lotto";

export function getFrequency(
  draws: LottoDraw[],
  includeBonus: boolean = false
): NumberStat[] {
  if (!draws || draws.length === 0) return [];

  const statsMap: Record<number, NumberStat> = {};
  const totalDraws = draws.length;
  
  for (let i = 1; i <= 45; i++) {
    statsMap[i] = { num: i, count: 0, lastDrawNo: 0, gap: 0, percentage: 0 };
  }

  // 최신 회차를 기준으로 gap을 계산하기 위해 오름차순으로 정렬
  const sortedDraws = [...draws].sort((a, b) => a.drawNo - b.drawNo);
  const latestDrawNo = sortedDraws[sortedDraws.length - 1].drawNo;

  for (const draw of sortedDraws) {
    const checkNums = [...draw.nums];
    if (includeBonus && draw.bonus) checkNums.push(draw.bonus);
    
    for (const num of checkNums) {
      if (statsMap[num]) {
        statsMap[num].count++;
        // 가장 최근에 출현한 회차 번호를 기록
        statsMap[num].lastDrawNo = Math.max(statsMap[num].lastDrawNo, draw.drawNo);
      }
    }
  }

  for (let i = 1; i <= 45; i++) {
    const s = statsMap[i];
    s.percentage = totalDraws > 0 ? Number(((s.count / totalDraws) * 100).toFixed(2)) : 0;
    // 최신 회차에서 마지막 출현 회차를 빼서 gap(미출현 기간)을 계산
    // 만약 한 번도 출현하지 않았다면(lastDrawNo == 0) 최신 회차 값이 곧 gap이 됨
    s.gap = s.lastDrawNo > 0 ? latestDrawNo - s.lastDrawNo : latestDrawNo;
  }

  // count 내림차순 정렬 반환
  return Object.values(statsMap).sort((a, b) => b.count - a.count);
}

export function getHotNumbers(draws: LottoDraw[], recent: number = 50): number[] {
  // 최신순으로 정렬하여 recent 갯수만큼 추출
  const recentDraws = [...draws].sort((a, b) => b.drawNo - a.drawNo).slice(0, recent);
  // 빈도수 계산
  const freq = getFrequency(recentDraws, false);
  // 빈도수 기준 상위 10개 번호 반환
  return freq.slice(0, 10).map(s => s.num);
}

export function getColdNumbers(draws: LottoDraw[], recent: number = 50): number[] {
  const recentDraws = [...draws].sort((a, b) => b.drawNo - a.drawNo).slice(0, recent);
  const freq = getFrequency(recentDraws, false);
  
  // 가장 빈도수가 낮고, gap(오랫동안 안나온)이 높은 순으로 정렬하여 하위 10개 식별
  const coldFreq = [...freq].sort((a, b) => {
    if (a.count !== b.count) return a.count - b.count; // 빈도 오름차순 (적게 나온 순)
    return b.gap - a.gap; // gap 내림차순 (안나온 기간이 긴 순)
  });
  
  return coldFreq.slice(0, 10).map(s => s.num);
}

export function generateNumbers(
  draws: LottoDraw[],
  mode: GenerateMode
): GenerateResult {
  let selectedNums: number[] = [];
  const fullPool = Array.from({ length: 45 }, (_, i) => i + 1);
  const disclaimer = "로또 당첨은 무작위성이 강하므로 본 추천 결과는 맹신하지 말고 참고용으로만 사용해 주세요.";

  let modeLabel = "";
  let confidence: "low" | "medium" = "low";

  const getRandomList = (arr: number[], count: number) => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  if (mode === "hot") {
    // 최근 50회 빈도 상위 15개 풀에서 랜덤 6개
    const recentDraws = [...draws].sort((a, b) => b.drawNo - a.drawNo).slice(0, 50);
    const freq = getFrequency(recentDraws, false);
    const top15 = freq.slice(0, 15).map(s => s.num);
    selectedNums = getRandomList(top15, 6);
    modeLabel = "최근 50회 HOT 번호 집중형";
    confidence = "medium";

  } else if (mode === "balanced") {
    // 1-9, 10-19, 20-29, 30-39, 40-45 구간에서 각 1개씩 + 나머지 1개 랜덤
    const ranges = [
      Array.from({ length: 9 }, (_, i) => i + 1),        // 1-9
      Array.from({ length: 10 }, (_, i) => i + 10),      // 10-19
      Array.from({ length: 10 }, (_, i) => i + 20),      // 20-29
      Array.from({ length: 10 }, (_, i) => i + 30),      // 30-39
      Array.from({ length: 6 }, (_, i) => i + 40),       // 40-45
    ];
    
    ranges.forEach(range => {
      selectedNums.push(getRandomList(range, 1)[0]);
    });
    
    const remainingPool = fullPool.filter(n => !selectedNums.includes(n));
    selectedNums.push(getRandomList(remainingPool, 1)[0]);
    
    modeLabel = "전체 구간 균등 밸런스형";
    confidence = "medium";

  } else if (mode === "cold_revenge") {
    // 최근 10회 미출현 번호 풀에서 랜덤 6개
    const recentDraws = [...draws].sort((a, b) => b.drawNo - a.drawNo).slice(0, 10);
    const freq = getFrequency(recentDraws, false);
    const coldPool = freq.filter(s => s.count === 0).map(s => s.num);
    
    if (coldPool.length >= 6) {
      selectedNums = getRandomList(coldPool, 6);
    } else {
      selectedNums = [...coldPool];
      const remainingPool = fullPool.filter(n => !selectedNums.includes(n));
      const needs = 6 - selectedNums.length;
      selectedNums.push(...getRandomList(remainingPool, needs));
    }
    
    modeLabel = "미출현 번호 공략 (최근 10회 기준)";
    confidence = "low";

  } else {
    // random
    selectedNums = getRandomList(fullPool, 6);
    modeLabel = "완전 무작위 랜덤 픽";
    confidence = "low";
  }

  // 항상 오름차순 정렬
  selectedNums.sort((a, b) => a - b);

  return {
    nums: selectedNums,
    mode,
    modeLabel,
    confidence,
    disclaimer
  };
}

export function getPatternStats(draws: LottoDraw[]): {
  avgOdd: number
  avgEven: number
  avgLow: number
  avgHigh: number
  mostCommonPattern: string
} {
  if (!draws || draws.length === 0) {
    return { avgOdd: 0, avgEven: 0, avgLow: 0, avgHigh: 0, mostCommonPattern: "" };
  }

  let totalOdd = 0, totalEven = 0, totalLow = 0, totalHigh = 0;
  const patternCount: Record<string, number> = {};

  for (const d of draws) {
    totalOdd += d.oddCount;
    totalEven += d.evenCount;
    totalLow += d.lowCount;
    totalHigh += d.highCount;

    const pattern = `홀${d.oddCount}:짝${d.evenCount}`;
    patternCount[pattern] = (patternCount[pattern] || 0) + 1;
  }

  const count = draws.length;
  let mostCommonPattern = "";
  let maxPatCount = 0;

  for (const [pattern, c] of Object.entries(patternCount)) {
    if (c > maxPatCount) {
      maxPatCount = c;
      mostCommonPattern = pattern;
    }
  }

  return {
    avgOdd: Number((totalOdd / count).toFixed(2)),
    avgEven: Number((totalEven / count).toFixed(2)),
    avgLow: Number((totalLow / count).toFixed(2)),
    avgHigh: Number((totalHigh / count).toFixed(2)),
    mostCommonPattern
  };
}
