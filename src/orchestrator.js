import { fetchClaudeNotices } from './providers/claude.js'
import { fetchGeminiBenchmarks } from './providers/gemini.js'
import { generateMidjourneyImages } from './providers/midjourney.js'
import { renderHTML } from './render/reportTemplate.js'
import { sendMail } from './email/sendEmail.js'
import { log } from './utils/logger.js'
import dayjs from 'dayjs'
import fs from 'fs'

const isDryRun = process.argv.includes('--dry-run')

async function withRetry(fn, label, retries=2, delayMs=1500) {
  for (let i=0; i<=retries; i++) {
    try { return await fn() } catch (e) {
      if (i===retries) throw e
      await new Promise(r=>setTimeout(r, delayMs))
    }
  }
}

async function main() {
  const logs = []
  const append = (m)=>{ logs.push(`[${new Date().toISOString()}] ${m}`); log(m) }

  append('Orchestrator start')

  const [notices, benchmarks, mj] = await Promise.all([
    withRetry(()=>fetchClaudeNotices(), 'claude'),
    withRetry(()=>fetchGeminiBenchmarks(), 'gemini'),
    withRetry(()=>generateMidjourneyImages(), 'midjourney')
  ])

  append(`Claude notices: ${Array.isArray(notices)?notices.length:0}`)
  append(`Gemini benchmarks: ${Array.isArray(benchmarks)?benchmarks.length:0}`)
  append(`Midjourney images: ${Array.isArray(mj?.images)?mj.images.length:0} (skipped=${mj?.skipped})`)

  const html = renderHTML({ notices, benchmarks, images: mj?.images||[], logs })
  const out = `./report_${dayjs().format('YYYYMMDD_HHmm')}.html`
  fs.writeFileSync(out, html, 'utf-8')
  append(`Report saved: ${out}`)

  if (!isDryRun) {
    const res = await sendMail({
      subject: `자동화 리포트 ${dayjs().format('YYYY-MM-DD')}`,
      html
    })
    append(`Email: ${JSON.stringify(res)}`)
  } else {
    append('Dry-run mode → 이메일 전송 생략')
  }

  append('Done')
}

main().catch(e=>{
  console.error(e)
  process.exit(1)
})
