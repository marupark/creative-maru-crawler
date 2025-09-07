import axios from 'axios'
import { log } from '../utils/logger.js'

export async function fetchGeminiBenchmarks({ apiKey = process.env.GEMINI_API_KEY, model = process.env.GEMINI_MODEL, timeoutMs = 20000 } = {}) {
  if (!apiKey || !model) {
    log('Gemini key/model missing. Returning fallback benchmarks.')
    return fallbackBenchmarks()
  }
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    const prompt = {
      contents: [{
        parts: [{ text: `지원사업 구독형 B2B 서비스 해외사례를 가격대/혜택/대상/링크로 표준화해서 6건만 JSON 배열로 만들어줘.
스키마: [{{"service":"","price_range":"","benefits":"","target":"","link":""}}]`}]
      }]
    }
    const res = await axios.post(url, prompt, { timeout: timeoutMs })
    const txt = res?.data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]'
    const json = safeJson(txt)
    return Array.isArray(json) ? json : fallbackBenchmarks()
  } catch (e) {
    log('Gemini error ' + (e?.response?.data ? JSON.stringify(e.response.data) : e?.message))
    return fallbackBenchmarks()
  }
}

function safeJson(s) {
  try { return JSON.parse(s) } catch { 
    const m = s.match(/\[.*\]/s)
    if (m) { try { return JSON.parse(m[0]) } catch {} }
    return []
  }
}

function fallbackBenchmarks() {
  return [
    {"service":"Sample SaaS A","price_range":"$19-$49/mo","benefits":"월간 리포트, 이메일 알림","target":"SMB","link":"https://example.com/a"},
    {"service":"Sample SaaS B","price_range":"$99/mo","benefits":"리포트+컨설팅 콜","target":"Startup","link":"https://example.com/b"},
    {"service":"Sample SaaS C","price_range":"$199/mo","benefits":"맞춤형 대시보드","target":"Enterprise","link":"https://example.com/c"},
    {"service":"Sample SaaS D","price_range":"$49-$79/mo","benefits":"주간 브리핑","target":"SMB","link":"https://example.com/d"},
    {"service":"Sample SaaS E","price_range":"$149/mo","benefits":"요약+액션플랜","target":"Mid-market","link":"https://example.com/e"},
    {"service":"Sample SaaS F","price_range":"$299/mo","benefits":"전담 매니저","target":"Enterprise","link":"https://example.com/f"}
  ]
}
