// index.js
const fs = require('fs');
const axios = require('axios');
const nodemailer = require('nodemailer');
require('dotenv').config();

// ==== [1] API 호출 ====
async function getNoticesFromAPI() {
  try {
    const response = await axios.get('https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do'); // 실제 URL로 교체 필요
    const items = response.data?.body?.items || [];
    console.log(`✅ API 호출 성공: ${items.length}건`);
    return items;
  } catch (err) {
    console.error('❌ API 호출 실패:', err);
    return [];
  }
}

// ==== [2] 이모지 제거 ====
const removeEmoji = text => {
  if (!text || typeof text !== 'string') return '';
  return text.replace(/[\p{Emoji_Presentation}\p{Emoji}\uFE0F]/gu, '');
};

// ==== [3] 분석 함수 (간단 점수 예시) ====
function analyzeNotices(title, content, agency) {
  const keywords = ['디자인', '마케팅', '수출', '홈페이지', '브랜드', '바우처'];
  let score = 0;
  keywords.forEach(kw => {
    if (title.includes(kw)) score += 20;
    if (content.includes(kw)) score += 10;
  });
  return {
    score,
    grade: score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D'
  };
}

// ==== [4] 메일 발송 ====
async function sendEmail(analyzed, totalCount) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
      to: process.env.MAIL_RECEIVER,
    },
  });

  const highPriority = analyzed.filter(n => n.score >= 70);

  const htmlBody = highPriority.length === 0
    ? `<h3>MAILNARA v7.2 지원사업 알림</h3>
       <p>총 수집: ${totalCount}건 / 고득점(70점↑): 0건</p>
       <p>조건에 맞는 공고가 없습니다. 내일 다시 확인해보세요.</p>
       <br><br><small>본 메일은 자동화 시스템 MAILNARA v7.2에 의해 발송되었습니다.</small>`
    : `<h3>MAILNARA v7.2 지원사업 알림</h3>
       <p>총 수집: ${totalCount}건 / 고득점(70점↑): ${highPriority.length}건</p>
       <ul>
         ${highPriority.map(n => `
           <li>
             <b>${removeEmoji(n.title)}</b><br>
             ${removeEmoji(n.agency)} / 점수: ${n.score}<br>
             <a href="${n.link || '#'}" target="_blank">공고 확인</a>
           </li>`).join('')}
       </ul><br><br><small>본 메일은 자동화 시스템 MAILNARA v7.2에 의해 발송되었습니다.</small>`;

  const mailOptions = {
    from: `"MAILNARA" <${process.env.MAIL_USER}>`,
    to: process.env.MAIL_RECEIVER || 'pm@cmaru.com',
    subject: `MAILNARA v7.2 지원사업 알림 - ${new Date().toISOString().split('T')[0]}`,
    html: htmlBody,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ 메일 발송 완료:', info.messageId);
  } catch (err) {
    console.error('❌ 메일 발송 실패:', err);
  }
}

// ==== [5] 실행 흐름 ====
(async () => {
  const rawNotices = await getNoticesFromAPI();

  // 저장
  fs.writeFileSync('./notices.json', JSON.stringify(rawNotices, null, 2));
  console.log('✅ notices.json 저장 완료');

  // 데이터 정리 및 분석
  const formatted = rawNotices.map((item, idx) => {
    const title = removeEmoji(item.policyNm || item.pblancNm || `제목 없음 ${idx}`);
    const content = removeEmoji(item.policyCn || item.cn || '내용 없음');
    const agency = removeEmoji(item.cnstcDept || item.jrsdInsttNm || item.author || item.excInsttNm || '기관 없음');
    const link = item.link || item.pblancUrl || '#';

    const result = analyzeNotices(title, content, agency);
    return { title, content, agency, link, ...result };
  });

  // 디버깅용 출력
  formatted.forEach((n, i) => {
    console.log(`[${i + 1}] ${n.title} | ${n.agency} | 점수: ${n.score}`);
  });

  await sendEmail(formatted, rawNotices.length);
})();
