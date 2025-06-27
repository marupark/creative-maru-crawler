const fs = require('fs');
const axios = require('axios');
const nodemailer = require('nodemailer');
const { XMLParser } = require('fast-xml-parser');
require('dotenv').config();

const API_KEY = process.env.BIZINFO_API_KEY;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const RECIPIENT = process.env.RECIPIENT_EMAIL || process.env.MAIL_RECEIVER || 'pm@cmaru.com';
const TARGET_ORGS = ['경상남도', '산업부', '중기부', '특허청'];

// ✅ [1] 공고 수집 (RSS 방식)
async function getNoticesFromAPI() {
  const parser = new XMLParser();
  let totalItems = [];

  for (const org of TARGET_ORGS) {
    const url = `https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do?crtfcKey=${API_KEY}&dataType=xml&searchCnt=20&insttNm=${encodeURIComponent(org)}`;
    try {
      const res = await axios.get(url);
      const json = parser.parse(res.data);
      const items = json?.rss?.channel?.item || [];
      totalItems = totalItems.concat(items);
    } catch (err) {
      console.error(`❌ API 호출 실패: ${org}`, err.message);
    }
  }

  console.log(`✅ API 호출 완료: ${totalItems.length}건`);
  return totalItems;
}

// ✅ [2] 이모지 제거
const removeEmoji = text => {
  if (!text || typeof text !== 'string') return '';
  return text.replace(/[\p{Emoji_Presentation}\p{Emoji}\uFE0F]/gu, '');
};

// ✅ [3] 메일 발송
async function sendEmail(data) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  console.log('📨 수신자 확인:', RECIPIENT);

  const htmlBody = data.length === 0
    ? `<h3>MAILNARA v7.2 지원사업 알림</h3>
       <p>총 수집: 0건</p>
       <p>조건에 맞는 공고가 없습니다. 내일 다시 확인해보세요.</p>
       <br><small>본 메일은 자동화 시스템 MAILNARA v7.2에 의해 발송되었습니다.</small>`
    : `<h3>MAILNARA v7.2 지원사업 알림</h3>
       <p>총 수집: ${data.length}건</p>
       <ul>
         ${data.map(n => `
           <li>
             <b>${removeEmoji(n.title)}</b><br>
             ${removeEmoji(n.author || n.category || '기관 미상')}<br>
             <a href="${n.link || '#'}" target="_blank">공고 확인</a>
           </li>
         `).join('')}
       </ul>
       <br><small>본 메일은 자동화 시스템 MAILNARA v7.2에 의해 발송되었습니다.</small>`;

  const mailOptions = {
    from: `"MAILNARA" <${EMAIL_USER}>`,
    to: RECIPIENT,
    subject: `MAILNARA v7.2 지원사업 알림 - ${new Date().toISOString().split('T')[0]}`,
    html: htmlBody,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ 메일 발송 완료:', info.messageId);
  } catch (err) {
    console.error('❌ 메일 발송 실패:', err.message);
  }
}

// ✅ [4] 실행 흐름
(async () => {
  const notices = await getNoticesFromAPI();
  fs.writeFileSync('./notices.json', JSON.stringify(notices, null, 2));
  console.log('📁 notices.json 저장 완료');

  notices.forEach((n, i) => {
    console.log(`[${i + 1}] ${removeEmoji(n.title)} | ${removeEmoji(n.author || '')}`);
  });

  await sendEmail(notices);
})();
