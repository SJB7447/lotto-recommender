// 이 스크립트는 로컬 Next.js 서버의 API 라우트를 호출하여 안전하게 데이터베이스 시딩을 실행합니다.
// 파이어베이스 Client SDK가 순수 Node.js 환경에서 네트워크 오류를 일으키는 것을 방지하기 위함입니다.
// 반드시 `npm run dev` 나 `npm run start` 로 Next.js 서버가 켜진 상태에서 실행해주세요!

async function runSeed() {
  console.log("로컬 서버(http://localhost:3000)를 통해 데이터베이스 시딩을 요청합니다...");
  console.log("서버가 켜져 있지 않다면 'npm run dev' 를 먼저 실행해주세요!\n");
  
  try {
    const res = await fetch("http://localhost:3000/api/seed", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) {
      throw new Error(`API 응답 에러: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    
    if (data.success) {
      console.log("=======================================");
      console.log("✅ CSV 시딩 스크립트 실행 완료!");
      console.log(`- 신규 업로드: ${data.uploaded} 건`);
      console.log(`- 스킵됨 (중복): ${data.skipped} 건`);
      console.log("=======================================\n");
    } else {
      console.error("❌ 시딩 실패:", data.error);
    }
  } catch (error) {
    console.error("\n❌ 에러 발생: Next.js 로컬 서버(http://localhost:3000)에 연결할 수 없습니다.");
    console.error("터미널을 하나 더 열어서 `npm run dev` 를 켜 둔 채로 다시 실행해주세요!\n");
  }
}

runSeed();
