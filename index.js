// ✅ 통합 리팩토링 완료본 - MAILNARA v7.2
const fs = require('fs');
const axios = require('axios');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const xml2js = require('xml2js');
dotenv.config();

const API_KEY = process.env.BIZINFO_API_KEY;
const org = '중소벤처기업부'; // 기본 테스트 기관명
const parser = new xml2js.Parser({ explicitArray: false });

// ✅ 이모지 제거
const removeEmoji = text => {
  if (!text || typeof text !== 'string') return '';
  return text.replace(/[\p{Emoji_Presentation}\p{Emoji}\uFE0F]/gu, '');
};

// ✅ API 호출
async function getNoticesFromAPI() {
  try {
    const url = `https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do?crtfcKey=${API_KEY}&dataType=xml&searchCnt=20&insttNm=${encodeURIComponent(org)}`;
    const res = await axios.get(url);
    const result = await parser.parseStringPromise(res.data);
    const items = result.rss?.channel?.item || [];
    const notices = Array.isArray(items) ? items : [items];
    console.log(`✅ API 호출 완료: ${notices.length}건`);
    return notices;
  } catch (err) {
    console.error('❌ API 호출 실패:', err.message);
    return [];
  }
}

// ✅ 메일 발송
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
    ? `<h3>MAILNARA v7.2 지원사업 알림</h3>
       <p>총 수집: 0건</p>
       <p>조건에 맞는 공고가 없습니다. 내일 다시 확인해보세요.</p>
       <br><small>본 메일은 자동화 시스템 MAILNARA v7.2에 의해 발송되었습니다.</small>`
    : `<h3>MAILNARA v7.2 지원사업 알림</h3>
       <p>총 수집: ${data.length}건</p>
       <ul>
         ${data.map(n => `
           <li>
             <b>${removeEmoji(n.title || n.policyNm)}</b><br>
             ${removeEmoji(n.author || n.jrsdInsttNm || '기관 미상')}<br>
             <a href="${n.link || n.pblancUrl || '#'}" target="_blank">공고 확인</a>
           </li>`).join('')}
       </ul>
       <br><small>본 메일은 자동화 시스템 MAILNARA v7.2에 의해 발송되었습니다.</small>`;

  try {
    const info = await transporter.sendMail({
      from: `MAILNARA <${process.env.EMAIL_USER}>`,
      to: recipient,
      subject: `MAILNARA v7.2 지원사업 알림 - ${new Date().toISOString().split('T')[0]}`,
      html: htmlBody,
    });
    console.log('✅ 메일 발송 완료:', info.messageId);
  } catch (err) {
    console.error('❌ 메일 발송 실패:', err.message);
  }
}

// ✅ 실행 흐름
(async () => {
  let notices = [];
  try {
    if (fs.existsSync('./notices.json')) {
      const jsonData = fs.readFileSync('./notices.json', 'utf-8');
      notices = JSON.parse(jsonData);
      console.log('📁 notices.json 불러오기 완료:', notices.length);
    } else {
      notices = await getNoticesFromAPI();
      fs.writeFileSync('./notices.json', JSON.stringify(notices, null, 2));
      console.log('📁 notices.json 저장 완료');
    }

    notices.forEach((n, i) => {
      const title = removeEmoji(n.title || n.policyNm);
      const agency = removeEmoji(n.author || n.jrsdInsttNm || '');
      console.log(`[${i + 1}] ${title} | ${agency}`);
    });

    await sendEmail(notices);
  } catch (err) {
    console.error('❌ 전체 흐름 실패:', err.message);
  }
})();
