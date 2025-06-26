const nodemailer = require('nodemailer');
require('dotenv').config();

// 이모지 제거 함수
function removeEmojis(str) {
  return str.replace(/[\u{1F300}-\u{1FAFF}]/gu, '');
}

// 메일 전송 함수
async function sendNotificationEmail(notices) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const filtered = notices.filter(n => n.score >= 70);

  const subject = removeEmojis(`📌 MAILNARA v7.2 알림 - 총 ${notices.length}건`);
  const headline = removeEmojis(`MAILNARA v7.2 지원사업 알림`);
  const summary = removeEmojis(`총 수집: ${notices.length}건 / 고득점(70점↑): ${filtered.length}건`);

  const htmlItems = filtered.map(item => `
    <div style="margin-bottom:16px;">
      <strong>${item.title}</strong><br/>
      <em>${item.agency}</em> | ${item.period}<br/>
      점수: ${item.score}점 | 키워드: ${item.keywords.join(', ')}<br/>
      <a href="${item.link}" target="_blank">공고 바로가기</a>
    </div>
  `).join('');

  const html = `
    <div style="font-family:Arial,sans-serif; font-size:14px;">
      <h2>${headline}</h2>
      <p>${summary}</p>
      ${filtered.length > 0 ? htmlItems : '<p>조건에 맞는 공고가 없습니다. 내일 다시 확인해보세요.</p>'}
      <hr/>
      <p style="font-size:12px; color:#888;">본 메일은 자동화 시스템 MAILNARA v7.2에 의해 발송되었습니다.</p>
    </div>
  `;

  const mailOptions = {
    from: `"MAILNARA" <${process.env.EMAIL_USER}>`,
    to: 'pm@cmaru.com',
    subject,
    html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ 메일 발송 성공:', info.messageId);
    return true;
  } catch (err) {
    console.error('❌ 메일 발송 실패:', err.message);
    return false;
  }
}

module.exports = { sendNotificationEmail };
