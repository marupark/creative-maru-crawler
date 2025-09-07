import nodemailer from 'nodemailer'
import { log, error } from '../utils/logger.js'

export async function sendMail({ subject, html, attachments = [] }) {
  const {
    SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_TO, MAIL_FROM
  } = process.env

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !MAIL_TO) {
    error('SMTP/MAIL env is missing. Skip emailing.')
    return { skipped: true }
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 465),
    secure: true,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  })

  const info = await transporter.sendMail({
    from: MAIL_FROM || SMTP_USER,
    to: MAIL_TO,
    subject,
    html,
    attachments
  })
  log('Email sent:', info.messageId)
  return { messageId: info.messageId }
}
