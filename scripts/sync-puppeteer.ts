import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";
import puppeteer from "puppeteer-core";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function getExecutablePath() {
  const paths = [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('Chrome or Edge not found.');
}

async function main() {
  const { getLatestDrawNo, upsertDraw } = await import("../lib/firestore");
  
  let currentMax = await getLatestDrawNo();
  console.log(`[Sync] 현재 Firestore에 저장된 가장 최근 회차: ${currentMax}`);

  const execPath = await getExecutablePath();
  const browser = await puppeteer.launch({
    executablePath: execPath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

  let syncedCount = 0;
  
  while (true) {
    const targetDrawNo = currentMax + 1;
    console.log(`[Sync] ${targetDrawNo}회차 데이터를 동기화 요청하는 중... (Puppeteer)`);
    
    // Go to the specific draw's result page
    const url = `https://dhlottery.co.kr/gameResult.do?method=byWin&drwNo=${targetDrawNo}`;
    const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
    
    // Check if valid
    const isError = await page.evaluate(() => {
      const h4 = document.querySelector('div.win_result h4 strong');
      return !h4;
    });

    if (isError) {
      console.log(`[Sync] Landed on URL: ${page.url()}`);
      await page.screenshot({ path: 'scripts/debug-error.png' });
      console.log(`[Sync] ${targetDrawNo}회차 데이터를 찾을 수 없습니다. (동기화 완료)`);
      break;
    }

    const result = await page.evaluate((drwNo) => {
      const h4 = document.querySelector('div.win_result h4 strong');
      const actualDrw = h4 ? Number(h4.textContent.replace(/[^0-9]/g, '')) : null;
      if (actualDrw !== drwNo) return null; // Wait until exact draw exists
      
      const pDesc = document.querySelector('p.desc');
      const drawDate = pDesc ? pDesc.textContent.replace(/[^0-9]/g, '-').replace(/-+/g,'-').replace(/^-|-$/g,'').substring(0,10) : '';
      
      const numBands = Array.from(document.querySelectorAll('div.win_result div.num.win p span.ball_645'));
      const nums = numBands.map(el => Number(el.textContent)).sort((a,b)=>a-b);
      
      const bonusEl = document.querySelector('div.win_result div.num.bonus p span.ball_645');
      const bonus = bonusEl ? Number(bonusEl.textContent) : 0;
      
      const trs = Array.from(document.querySelectorAll('table.tbl_data tbody tr'));
      let prize1stCount = 0;
      let prize1stAmount = 0;
      
      if (trs.length > 0) {
        const tds = Array.from(trs[0].querySelectorAll('td'));
        if (tds.length >= 4) {
          prize1stAmount = Number(tds[3].textContent.replace(/[^0-9]/g, ''));
        }
        if (tds.length >= 3) {
          prize1stCount = Number(tds[2].textContent.replace(/[^0-9]/g, ''));
        }
      }
      
      return { drawNo: drwNo, drawDate, nums, bonus, prize1stCount, prize1stAmount };
    }, targetDrawNo);
    
    if (!result || !result.nums || result.nums.length !== 6) {
      console.log(`[Sync] ${targetDrawNo}회차 데이터를 파싱하지 못했습니다. 형식이 다르거나 대기 중입니다.`);
      break;
    }
    
    const oddCount = result.nums.filter((n: number) => n % 2 !== 0).length;
    const evenCount = result.nums.filter((n: number) => n % 2 === 0).length;
    const lowCount = result.nums.filter((n: number) => n >= 1 && n <= 22).length;
    const highCount = result.nums.filter((n: number) => n >= 23 && n <= 45).length;
    const range1 = result.nums.filter((n: number) => n >= 1 && n <= 10).length;
    const range2 = result.nums.filter((n: number) => n >= 11 && n <= 20).length;
    const range3 = result.nums.filter((n: number) => n >= 21 && n <= 30).length;
    const range4 = result.nums.filter((n: number) => n >= 31 && n <= 40).length;
    const range5 = result.nums.filter((n: number) => n >= 41 && n <= 45).length;
    
    const finalData = {
      ...result,
      oddCount, evenCount, lowCount, highCount,
      range1, range2, range3, range4, range5
    };
    
    await upsertDraw(finalData);
    console.log(`[Sync] => ${targetDrawNo}회차 저장 완료! (${result.drawDate})`);
    
    syncedCount++;
    currentMax++;
    await new Promise(r => setTimeout(r, 1000));
  }
  
  await browser.close();
  console.log(`[Sync] 총 ${syncedCount}건 동기화 완료했습니다!`);
  process.exit(0);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
