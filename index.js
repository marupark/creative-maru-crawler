// index.js - MAILNARA v7.2 (실기관명 반영 + 디버그 출력 포함)

const axios = require('axios');
const { sendNotificationEmail } = require('./send-email-v7');
const { analyzeNoticeEnhanced } = require('./analyze');
require('dotenv').config();

// ✔️ 실제 API용 기관명 사용
const TARGET_ORGS = [
  '한국디자인진흥원',     // KIDP
  '경남지식재산센터',     // RIPC
  '대한무역투자진흥공사'  // KOTRA
];

const API_KEY = process.env.BIZINFO_API_KEY;

async function fetchDataFromAPI() {
  const allItems = [];

  for (const org of TARGET_ORGS) {
    try {
      const url = `https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do?crtfcKey=${API_KEY}&dataType=json&searchCnt=50&insttNm=${encodeURIComponent(org)}`;
      const response = await axios.get(url);
      console.log('[DEBUG] 실제 API 응답 구조:\n', JSON.stringify(response.data, null, 2));
      const items = response.data?.body?.items || [];

      // 📋 디버그 출력 (기관별 최초 1회만 출력)
      if (items.length > 0) {
        console.log(`📦 [${org}] 응답 필드:`, Object.keys(items[0]));
        console.log(`📦 [${org}] 예시 데이터:\n`, JSON.stringify(items[0], null, 2));
      } else {
        console.warn(`⚠️ [${org}] 수집된 항목이 없습니다.`);
      }

      const mapped = items.map(item => {
        const title = item.policyNm || item.pblancNm || '제목 없음';
        const content = item.policyCn || item.bsnsSumryCn || item.cn || '내용 없음';
        const agency = item.cnstcDept || item.jrsdInsttNm || item.author || item.excInsttNm || '기관 정보 없음';
        const period = item.reqstBeginEndDe || item.rceptPd || '기간 정보 없음';
        const link = item.pblancUrl || item.rceptEngnHmpgUrl || '#';

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
      console.error(`❌ ${org} API 호출 실패:`, error.message);
    }
  }

  return allItems;
}

async function main() {
  console.log('🚀 MAILNARA v7.2 실행 시작');
  const notices = await fetchDataFromAPI();
  console.log(`🎯 필터링 결과: ${notices.length}개`);

  const success = await sendNotificationEmail(notices);
  if (!success) {
    console.error('⚠️ 메일 전송 실패');
  }
}

main();
