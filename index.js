const fs = require('fs');
const axios = require('axios');
const nodemailer = require('nodemailer');
require('dotenv').config();

// 1. API 호출
async function getNoticesFromAPI() {
  try {
    const res = await axios.get('https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do');
    const items = res.data?.body?.items || [];
    console.log(`✅ API 호출 완료: ${items.length}건`);
    return items;
  } catch (err) {
    console.error('❌ API 호출 실패:', err.message);
    return [];
  }
}

// 2. 이모지 제거
const removeEmoji = text => {
  if (!text || typeof text !== 'string') return '';
  return text.replace(/[\p{Emoji_Presentation}\p{Emoji}\uFE0F]/gu, '');
};

// 3. 분석 점수 계산
function analyzeNotices(title, content, agency) {
  const keywords = ['디자인', '수출', '바우처', '홈페이지', '브랜딩'];
  let score = 0;
  keywords.forEach(k => {
    if (title.includes(k)) score += 20;
    if (content.includes(k)) score += 10;
  });
  return {
    score,
    grade: score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D'
  };
}

// 4. 이메일 발송
async function sendEmail(analyzed, totalCount) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
      to: process.env.RECIPIENT_EMAIL || 'pm@cmaru.com',
    },
  });

  const highPriority = analyzed.filter(n => n.score >= 70);

  const htmlBody = highPriority.length === 0
    ? `<h3>MAILNARA v7.2 지원사업 알림</h3>
       <p>총 수집: ${totalCount}건 / 고득점(70점↑): 0건</p>
       <p>조건에 맞는 공고가 없습니다. 내일 다시 확인해보세요.</p>
       <br><small>본 메일은 자동화 시스템 MAILNARA v7.2에 의해 발송되었습니다.</small>`
    : `<h3>MAILNARA v7.2 지원사업 알림</h3>
       <p>총 수집: ${totalCount}건 / 고득점(70점↑): ${highPriority.length}건</p>
       <ul>${highPriority.map(n => `
         <li>
           <b>${removeEmoji(n.title)}</b><br>
           ${removeEmoji(n.agency)} / 점수: ${n.score}<br>
           <a href="${n.link || '#'}" target="_blank">공고 확인</a>
         </li>
       `).join('')}</ul>
       <br><small>본 메일은 자동화 시스템 MAILNARA v7.2에 의해 발송되었습니다.</small>`;

  const mailOptions = {
    from: `"MAILNARA" <${process.env.EMAIL_USER}>`,
    to: process.env.RECIPIENT_EMAIL,
    subject: `MAILNARA v7.2 지원사업 알림 - ${new Date().toISOString().split('T')[0]}`,
    html: htmlBody,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('📬 메일 발송 완료:', info.messageId);
  } catch (err) {
    console.error('❌ 메일 발송 실패:', err.message);
  }
}

// 5. 실행 흐름
(async () => {
  const notices = await getNoticesFromAPI();
  fs.writeFileSync('./notices.json', JSON.stringify(notices, null, 2));
  console.log('📁 notices.json 저장 완료');

  const formatted = notices.map((item, i) => {
    const title = removeEmoji(item.policyNm || item.pblancNm || `제목 없음 ${i}`);
    const content = removeEmoji(item.policyCn || item.cn || '');
    const agency = removeEmoji(item.cnstcDept || item.jrsdInsttNm || item.author || item.excInsttNm || '');
    const link = item.link || item.pblancUrl || '#';
    const scoreData = analyzeNotices(title, content, agency);
    return { title, content, agency, link, ...scoreData };
  });

  // 로그 확인
  formatted.forEach((n, i) => {
    console.log(`[${i + 1}] ${n.title} | ${n.agency} | 점수: ${n.score}`);
  });

  await sendEmail(formatted, notices.length);
})();
