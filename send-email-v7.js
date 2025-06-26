const fs = require('fs');
const nodemailer = require('nodemailer');
require('dotenv').config();

const { analyzeNotices } = require('./analyze');
const notices = require('./notices.json');

// 이모지 제거 함수
const removeEmoji = text => {
  if (!text || typeof text !== 'string') return '';
  return text.replace(/[\p{Emoji_Presentation}\p{Emoji}\uFE0F]/gu, '');
};

// 제목/내용/기관 정리
const formatNotices = (data) => {
  return data.map((item, index) => {
    const title = removeEmoji(item.policyNm || item.pblancNm || `제목 없음 #${index}`);
    const content = removeEmoji(item.policyCn || item.cn || '내용 없음');
    const agency = removeEmoji(item.cnstcDept || item.jrsdInsttNm || item.author || item.excInsttNm || '기관 정보 없음');
    return { title, content, agency };
  });
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER, // ex: cmaru.bot@gmail.com
    pass: process.env.MAIL_PASS,
  },
});

const generateEmailBody = (analyzed) => {
  if (analyzed.length === 0) {
    return `
      <h3>MAILNARA v7.2 지원사업 알림</h3>
      <p>총 수집: ${notices.length}건 / 고득점(70점↑): 0건</p>
      <p>조건에 맞는 공고가 없습니다. 내일 다시 확인해보세요.</p>
      <br><br>
      <small>본 메일은 자동화 시스템 MAILNARA v7.2에 의해 발송되었습니다.</small>
    `;
  }

  const lines = analyzed.map((n, i) => {
    return `
      <li>
        <b>${removeEmoji(n.title)}</b><br>
        ${removeEmoji(n.agency)} / 점수: ${n.score}<br>
        <a href="${n.link || '#'}" target="_blank">공고 확인</a>
      </li>
    `;
  });

  return `
    <h3>MAILNARA v7.2 지원사업 알림</h3>
    <p>총 수집: ${notices.length}건 / 고득점(70점↑): ${analyzed.length}건</p>
    <ul>${lines.join('')}</ul>
    <br><br>
    <small>본 메일은 자동화 시스템 MAILNARA v7.2에 의해 발송되었습니다.</small>
  `;
};

const main = async () => {
  const formatted = formatNotices(notices);
  const analyzed = formatted.map(item => {
    const result = analyzeNotices(item.title, item.content, item.agency);
    return { ...item, ...result };
  });

  // 디버깅 로그
  analyzed.forEach((a, i) => {
    console.log(`[${i + 1}] ${a.title} | ${a.agency} | 점수: ${a.score}`);
  });

  // 필터링 (우선순위 점수 기준)
  const highPriority = analyzed.filter(n => n.score >= 70);

  const htmlBody = generateEmailBody(highPriority);

  const mailOptions = {
    from: `"MAILNARA v7.2" <${process.env.MAIL_USER}>`,
    to: process.env.MAIL_RECEIVER, // 예: pm@cmaru.com
    subject: `MAILNARA v7.2 지원사업 알림 - ${new Date().toISOString().split('T')[0]}`,
    html: htmlBody,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ 메일 발송 완료:', info.messageId);
  } catch (err) {
    console.error('❌ 메일 발송 실패:', err);
  }
};

main();
