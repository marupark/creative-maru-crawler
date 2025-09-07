import axios from 'axios'
import { log } from '../utils/logger.js'

const baseURL = 'https://api.anthropic.com/v1/messages'

export async function fetchClaudeNotices({ apiKey = process.env.ANTHROPIC_API_KEY, model = process.env.ANTHROPIC_MODEL, timeoutMs = 20000 } = {}) {
  if (!apiKey || !model) {
    log('Claude key/model missing. Returning fallback sample notices.')
    return fallbackNotices()
  }
  try {
    const prompt = `너는 지원사업 공고 데이터 요약가다. 다음 스키마로 한국 지원사업 샘플 10건을 생성해: 
[{{"title":"","agency":"","budget":"","deadline":"","summary":"","url":""}}] 한국어로, deadline은 YYYY-MM-DD 형식.`

    const res = await axios.post(baseURL, {
      model,
      max_tokens: 1200,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }]
    }, {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      timeout: timeoutMs
    })
    const txt = res?.data?.content?.[0]?.text || '[]'
    const json = safeJson(txt)
    return Array.isArray(json) ? json.slice(0, 10) : fallbackNotices()
  } catch (e) {
    log('Claude error ' + (e?.response?.data ? JSON.stringify(e.response.data) : e?.message))
    return fallbackNotices()
  }
}

function safeJson(s) {
  try { return JSON.parse(s) } catch { 
    const m = s.match(/\[.*\]/s)
    if (m) { try { return JSON.parse(m[0]) } catch {} }
    return []
  }
}

function fallbackNotices() {
  const today = new Date().toISOString().slice(0,10)
  return Array.from({length:10}).map((_,i)=> ({
    title: `샘플 지원사업 #${i+1}`,
    agency: '창원산업진흥원',
    budget: '최대 20,000,000원',
    deadline: today,
    summary: '제조업 디지털전환 지원. 마케팅·브랜딩·해외진출 우대.',
    url: 'https://www.bizinfo.go.kr/'
  }))
}
