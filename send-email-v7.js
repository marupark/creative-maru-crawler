// send-email-v7.js

const nodemailer = require('nodemailer');

async function sendNotificationEmail(notices) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const highScoreNotices = notices.filter(n => n.score >= 10);
  const averageScore = notices.length
    ? (notices.reduce((sum, n) => sum + n.score, 0) / notices.length).toFixed(1)
    : 0;

  let html = `
    <h2>📬 MAILNARA v7.2 지원사업 알림</h2>
    <p><strong>크리에이티브마루 맞춤형 정보</strong></p>
    <p><strong>${notices.length}</strong>총 공고<br>
    <strong>${highScoreNotices.length}</strong>고득점<br>
    <strong>${averageScore}</strong>점평균 점수</p>
  `;

  if (notices.length === 0) {
    html += `<p>조건에 맞는 공고가 없습니다. 내일 다시 확인해보세요!</p>`;
  } else {
    html += `<ul>`;
    for (const notice of notices) {
      html += `
        <li>
          <strong>${notice.title}</strong><br>
          🔗 <a href="${notice.link}">공고 확인</a><br>
          🏢 ${notice.agency} | 🗓️ ${notice.period}<br>
          🏷️ ${notice.keywords.join(', ')}<br>
          📈 점수: ${notice.score}<br><br>
        </li>`;
    }
    html += `</ul>`;
  }

  html += `<p>📊 안정적 API 수집 기반, 크리에이티브마루 맞춤 필터링 적용</p>`;

  try {
    const info = await transporter.sendMail({
      from: `"MAILNARA" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: '📮 MAILNARA 지원사업 알림',
      html
    });

    console.log(`✅ 메일 발송 성공: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ 메일 발송 실패:', error);
    return false;
  }
}

module.exports = {
  sendNotificationEmail
};
