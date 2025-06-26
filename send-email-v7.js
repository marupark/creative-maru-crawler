// send-email-v7.js - 이모지 제거 + 인코딩 안전 버전

const nodemailer = require('nodemailer');

// 이모지 제거 함수 (전체 범위 커버)
function removeEmojis(text) {
  return text
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // 이모지: 얼굴
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // 이모지: 심볼
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // 이모지: 운송/지도
    .replace(/[\u{2600}-\u{26FF}]/gu, '')   // 기타
    .replace(/[\u{2700}-\u{27BF}]/gu, '')   // 기타
    .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // 이모지: 확장
    .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '') // 이모지: 손동작 등
    .replace(/[\u{200D}\u{FE0F}]/gu, '');    // 조합자 제거
}

async function sendNotificationEmail(notices) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const highScoreNotices = notices.filter(n => n.score >= 70);

  let body = `MAILNARA v7.2 지원사업 알림\n`;
  body += `총 수집: ${notices.length}건 / 고득점(70점↑): ${highScoreNotices.length}건\n\n`;

  if (highScoreNotices.length === 0) {
    body += `조건에 맞는 공고가 없습니다. 내일 다시 확인해보세요.\n`;
  } else {
    highScoreNotices.forEach(n => {
      body += `------------------------------\n`;
      body += `📌 제목: ${n.title}\n`;
      body += `🏢 기관: ${n.agency}\n`;
      body += `🗓️ 기간: ${n.period}\n`;
      body += `🔗 링크: ${n.link}\n`;
      body += `💯 점수: ${n.score}점\n`;
      body += `\n`;
    });
  }

  body += `\n본 메일은 자동화 시스템 MAILNARA v7.2에 의해 발송되었습니다.`;

  // 이모지 및 줄바꿈 처리
  const safeBody = removeEmojis(body).replace(/\r\n/g, '\n');

  const mailOptions = {
    from: `MAILNARA v7.2 <${process.env.EMAIL_USER}>`,
    to: 'pm@cmaru.com',
    subject: removeEmojis(`MAILNARA v7.2 지원사업 알림 - ${new Date().toLocaleDateString('ko-KR')}`),
    text: safeBody,
    headers: {
      'Content-Type': 'text/plain; charset=UTF-8'
    }
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ 메일 발송 성공: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ 메일 발송 실패:', error);
    return false;
  }
}

module.exports = { sendNotificationEmail };
