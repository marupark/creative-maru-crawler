// index.js - XML 파싱 기반 MAILNARA v7.3

const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');
const { sendNotificationEmail } = require('./send-email-v7');
const { analyzeNoticeEnhanced } = require('./analyze');
require('dotenv').config();

const API_KEY = process.env.BIZINFO_API_KEY;

const TARGET_ORGS = [
  '한국디자인진흥원',     // KIDP
  '경남지식재산센터',     // RIPC
  '대한무역투자진흥공사'  // KOTRA
];

async function fetchDataFromAPI() {
  const parser = new XMLParser();
  const allItems = [];

  for (const org of TARGET_ORGS) {
    try {
      const url = `https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do?crtfcKey=${API_KEY}&dataType=xml&searchCnt=20&insttNm=${encodeURIComponent(org)}`;
      const response = await axios.get(url);
      const json = parser.parse(response.data);
      const items = json.rss.channel.item || [];

      const mapped = items.map(item => {
        const title = item.title || item.pblancNm || '제목 없음';
        const content = item.description || item.bsnsSumryCn || '내용 없음';
        const agency = item.jrsdInsttNm || item.author || item.excInsttNm || '기관 정보 없음';
        const period = item.reqstDt || item.reqstBeginEndDe || '기간 정보 없음';
        const link = item.pblancUrl || item.link || '#';

        const { score, keywords } = analyzeNoticeEnhanced(title, content, agency);

        return {
          title,
          content,
          summary: content,
          agency,
          period,
          link,
          score,
          keywords
        };
      });

      allItems.push(...mapped);
    } catch (error) {
      console.error(`❌ [${org}] API 호출 실패:`, error.message);
    }
  }

  return allItems;
}

async function main() {
  console.log('🚀 MAILNARA v7.3(XML) 실행 시작');
  const notices = await fetchDataFromAPI();
  console.log(`🎯 필터링 결과: ${notices.length}개`);

  const success = await sendNotificationEmail(notices);
  if (!success) {
    console.error('⚠️ 메일 전송 실패');
  }
}

main();
