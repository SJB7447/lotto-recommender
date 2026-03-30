export interface LottoDraw {
  drawNo: number           // 회차
  drawDate: string         // 추첨일 (YYYY-MM-DD)
  nums: number[]           // 당첨번호 6개 (오름차순)
  bonus: number            // 보너스번호
  oddCount: number         // 홀수 개수
  evenCount: number        // 짝수 개수
  lowCount: number         // 낮은번호(1-22) 개수
  highCount: number        // 높은번호(23-45) 개수
  range1: number           // 1-10 구간 개수
  range2: number           // 11-20 구간 개수
  range3: number           // 21-30 구간 개수
  range4: number           // 31-40 구간 개수
  range5: number           // 41-45 구간 개수
  prize1stCount: number    // 1등 당첨자수
  prize1stAmount: number   // 1등 당첨금액
}

export interface NumberStat {
  num: number
  count: number
  lastDrawNo: number
  gap: number              // 현재까지 미출현 연속 회차
  percentage: number       // 전체 대비 출현율
}

export type GenerateMode = "hot" | "balanced" | "random" | "cold_revenge" | "golden"

export interface GenerateResult {
  nums: number[]
  mode: GenerateMode
  modeLabel: string
  confidence: "low" | "medium"   // 항상 low 또는 medium (절대 high 없음)
  disclaimer: string
}
