import axios from 'axios'
import { log } from '../utils/logger.js'

export async function generateMidjourneyImages({ webhook = process.env.MIDJOURNEY_WEBHOOK_URL, timeoutMs = 20000 } = {}) {
  if (!webhook) {
    log('Midjourney webhook missing. Skipping image generation.')
    return { skipped: true, images: [] }
  }
  try {
    const payload = {
      promptA: "Minimal business report cover, clean white & navy, subtle grid, A4, 300dpi, corporate branding",
      promptB: "Creative dynamic report cover, blue+red palette, diagonal layout, abstract shapes, A4, 300dpi",
      promptThumb: "Q-Kit Business Template thumbnail, 16:9, modern presentation cover, clean layout"
    }
    await axios.post(webhook, payload, { timeout: timeoutMs })
    return { skipped: false, images: ["report_cover_A.jpg","report_cover_B.jpg","qkit_thumbnail.jpg"], note: "Webhook triggered. Images will be delivered by your proxy." }
  } catch (e) {
    log('Midjourney webhook error ' + (e?.response?.data ? JSON.stringify(e.response.data) : e?.message))
    return { skipped: true, images: [] }
  }
}
