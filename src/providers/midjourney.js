import axios from 'axios'
import { log } from '../utils/logger.js'

export async function generateMidjourneyImages(
  { webhook = process.env.MIDJOURNEY_WEBHOOK_URL, timeoutMs = 60000 } = {}
) {
  if (!webhook) {
    log('Image proxy webhook missing. Skipping image generation.')
    return { skipped: true, images: [] }
  }
  try {
    const payload = {
      promptA: "Minimal business report cover, clean white & navy, subtle grid, A4, 300dpi, corporate branding",
      promptB: "Creative dynamic report cover, blue+red palette, diagonal layout, abstract shapes, A4, 300dpi",
      promptThumb: "Q-Kit Business Template thumbnail, 16:9, modern presentation cover, clean layout"
    }

    const res = await axios.post(webhook, payload, {
      timeout: timeoutMs,
      headers: { "x-proxy-key": process.env.PROXY_API_KEY || "" }
    })

    const data = res?.data || {}
    if (data.ok && Array.isArray(data.images) && data.images.length) {
      // Worker → Replicate가 돌려준 실제 이미지 URL 사용
      return { skipped: false, images: data.images, backend: data.backend || 'proxy' }
    }

    // 실패/빈 응답 시 안전하게 스킵
    return { skipped: true, images: [], note: data.error || 'proxy returned no images' }

  } catch (e) {
    log('Image proxy error ' + (e?.response?.data ? JSON.stringify(e.response.data) : e?.message))
    return { skipped: true, images: [] }
  }
}
