import dayjs from 'dayjs'

export function renderHTML({ notices = [], benchmarks = [], images = [], logs = [] }) {
  const today = dayjs().format('YYYY-MM-DD')
  return `
<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<title>자동화 리포트 - ${today}</title>
<style>
body{font-family:Arial, Apple SD Gothic Neo, Helvetica, sans-serif; margin:20px; color:#111}
h1{margin:0 0 6px 0}
.section{margin-top:24px}
.card{border:1px solid #e5e7eb; border-radius:12px; padding:14px; margin:10px 0}
.small{color:#6b7280; font-size:12px}
ul{margin:6px 0 0 20px}
code{background:#f8fafc; padding:2px 4px; border-radius:4px}
</style>
</head>
<body>
  <h1>📬 자동화 리포트 ( ${today} )</h1>
  <div class="small">Claude/Gemini/Midjourney → Orchestrator → Email</div>

  <div class="section">
    <h2>지원사업 샘플 10건 (Claude)</h2>
    ${notices.map(n => `
      <div class="card">
        <div><b>${escapeHtml(n.title||'제목없음')}</b></div>
        <div class="small">${escapeHtml(n.agency||'기관없음')} · 마감 ${escapeHtml(n.deadline||'-')} · ${escapeHtml(n.budget||'-')}</div>
        <div>${escapeHtml(n.summary||'요약없음')}</div>
        <div class="small">${escapeHtml(n.url||'')}</div>
      </div>
    `).join('')}
  </div>

  <div class="section">
    <h2>해외 구독 모델 벤치마크 (Gemini)</h2>
    ${benchmarks.map(b => `
      <div class="card">
        <div><b>${escapeHtml(b.service||'서비스')}</b> — ${escapeHtml(b.price_range||'가격대')}</div>
        <div>${escapeHtml(b.benefits||'혜택')}</div>
        <div class="small">${escapeHtml(b.target||'대상')} · ${escapeHtml(b.link||'링크없음')}</div>
      </div>
    `).join('')}
  </div>

  <div class="section">
    <h2>비주얼 (Midjourney)</h2>
    <div class="small">※ Webhook 기반. 이미지 파일은 별도 전달/저장됩니다.</div>
    <ul>
      ${images.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}
    </ul>
  </div>

  <div class="section">
    <h2>로그</h2>
    <pre class="card small">${escapeHtml((logs||[]).join('\n'))}</pre>
  </div>

</body>
</html>
`}
function escapeHtml(s=''){return s.replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
