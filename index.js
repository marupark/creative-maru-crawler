const fs = require('fs');
const axios = require('axios');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const { XMLParser } = require('fast-xml-parser');
dotenv.config();

// ✅ 공고 수집 함수
async function getNoticesFromAPI() {
  try {
    const API_KEY = process.env.BIZINFO_API_KEY;
    const url = `https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do?crtfcKey=${API_KEY}&dataType=xml&searchCnt=80`;

    const res = await axios.get(url);
    const parser = new XMLParser();
    const json = parser.parse(res.data);
    const items = json.rss?.channel?.item || [];

    console.log(`✅ API 호출 완료: ${items.length}건`);
    return items;
  } catch (err) {
    console.error('❌ API 호출 실패:', err.message);
    return [];
  }
}

// ✅ 이모지 제거 함수
const removeEmoji = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text.replace(/[\p{Emoji_Presentation}\p{Emoji}\uFE0F]/gu, '');
};

// ✅ 메일 발송 함수
async function sendEmail(data) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const recipient = process.env.RECIPIENT_EMAIL || process.env.MAIL_RECEIVER || 'pm@cmaru.com';
  console.log('📨 수신자 확인:', recipient);

  const htmlBody = data.length === 0
    ? `<h3>MAILNARA v7.3 지원사업 알림</h3>
       <p>총 수집: 0건</p>
       <p>조건에 맞는 공고가 없습니다. 내일 다시 확인해보세요.</p>
       <br><small>본 메일은 자동화 시스템 MAILNARA v7.3에 의해 발송되었습니다.</small>`
    : `<h3>MAILNARA v7.3 지원사업 알림</h3>
       <p>총 수집: ${data.length}건</p>
       <ul>
         ${data.map(n => `
           <li>
             <b>${removeEmoji(n.title)}</b><br>
             ${removeEmoji(n.author || '기관 미상')}<br>
             <a href="${n.link || '#'}" target="_blank">공고 확인</a>
           </li>
         `).join('')}
       </ul>
       <br><small>본 메일은 자동화 시스템 MAILNARA v7.3에 의해 발송되었습니다.</small>`;

  const mailOptions = {
    from: `"MAILNARA" <${process.env.EMAIL_USER}>`,
    to: recipient,
    subject: `MAILNARA v7.3 지원사업 알림 - ${new Date().toISOString().split('T')[0]}`,
    html: htmlBody,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ 메일 발송 완료:', info.messageId);
  } catch (err) {
    console.error('❌ 메일 발송 실패:', err.message);
  }
}

// ✅ 실행 흐름
(async () => {
  const notices = await getNoticesFromAPI();
  fs.writeFileSync('./notices.json', JSON.stringify(notices, null, 2));
  console.log('📁 notices.json 저장 완료');

  notices.forEach((n, i) => {
    console.log(`[${i + 1}] ${removeEmoji(n.title)} | ${removeEmoji(n.author || '')}`);
  });

  await sendEmail(notices);
})();
