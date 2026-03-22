---
description: CSV 시딩 스크립트 실행
---
Firestore 데이터베이스에 과거 로또 당첨 기록 CSV 데이터를 시딩합니다.

1. 프로젝트 루트의 `.env.local` 파일에 `NEXT_PUBLIC_FIREBASE_API_KEY` 등 필수 환경변수 설정이 제대로 되어 있는지 먼저 확인하세요. (비어있으면 사용자에게 채워달라고 요청하세요)
// turbo
2. 환경변수가 존재한다면 `npx tsx scripts/seed.ts` 명령어를 실행하여 시딩을 진행하세요.
3. 시딩 성공 및 스킵 로그를 읽고 작업 결과를 요약하여 사용자에게 보고해주세요.
