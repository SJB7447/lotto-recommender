---
description: 최신 회차 데이터 동기화
---
API를 호출하여 최신 로또 당첨 번호를 동기화합니다.

// turbo
1. `Invoke-RestMethod -Uri http://localhost:3000/api/sync -Method POST | ConvertTo-Json -Depth 5` 명령어를 실행하세요.
2. 출력 결과를 확인하고, `count`가 0보다 크다면 새로 추가된 회차가 몇 개인지 사용자에게 친절하게 알려주세요. `count`가 0이라면 "이미 최신 상태입니다"라고 알려주세요.
