# Auto AI Orchestrator (GitHub Actions 버전)

목표: **대표님이 잠들어 있어도** Claude / Gemini / (선택) Midjourney가 자동으로 일하고, 결과물을 이메일로 보내는 허브.

## 한 번에 끝내는 설치 가이드 (필수)

1) 이 저장소를 GitHub에 올립니다.
2) GitHub → Settings → Secrets and variables → **Actions** → New repository secret에 아래 키를 모두 등록합니다.

```
# 공통
LOG_TO_CONSOLE=true

# 이메일 (Gmail SMTP or 회사 SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=pm@cmaru.com
SMTP_PASS=앱비밀번호_또는_SMTP패스워드
MAIL_TO=pm@cmaru.com,design@cmaru.com
MAIL_FROM="Creative Maru Bot <pm@cmaru.com>"

# Anthropic Claude (선택)
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-5-sonnet-latest

# Google Gemini (선택)
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-1.5-pro

# Midjourney (선택, 없으면 자동 Skip)
MIDJOURNEY_WEBHOOK_URL=https://your-discord-webhook-url-or-api-endpoint
```

3) `.github/workflows/auto-orchestrator.yml`이 **매일 08:30 Asia/Seoul**에 실행됩니다.
4) 필요 시 수동 실행도 가능합니다 (Actions 탭 → Run workflow).

> **선택 키는 비워두면 자동으로 해당 작업을 Skip** 하도록 구성했습니다. 실패해도 전체 파이프라인이 멈추지 않습니다.

---

## 무엇을 하나요?
- Claude: 지원사업/시장 데이터 요약(샘플 10건)
- Gemini: 해외 구독 모델/가격 벤치마킹
- Midjourney: 리포트 표지/썸네일 (키 없으면 Skip)
- GPT(오케스트레이터 코드): 결과물을 HTML 리포트로 조립 → 이메일 발송

## 커스터마이징 포인트
- `src/providers/*.js`에서 각 API 호출 프롬프트/파라미터 변경
- `src/render/reportTemplate.js`에서 이메일/리포트 HTML 템플릿 수정
- 크론 스케줄은 `.github/workflows/auto-orchestrator.yml`의 `cron` 수정

## 로컬 테스트
```bash
npm install
npm run test-run
```
(dry-run 모드에서는 API 호출 없이 목(fallback) 데이터로 전체 흐름을 검증합니다.)

---

## 장애 대응
- 각 스텝은 개별 타임아웃과 재시도(3회)를 갖습니다.
- 한 스텝 실패해도 전체는 계속 진행하며, 실패 로그가 이메일로 첨부됩니다.
- SMTP가 막힌 경우 회사 SMTP로 교체하세요.

---
