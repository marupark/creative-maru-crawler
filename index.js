// index.js (기관명 정확 매핑 버전)

const axios = require('axios');
const { sendNotificationEmail } = require('./send-email-v7');
const { analyzeNoticeEnhanced } = require('./analyze');
require('dotenv').config();

const API_KEY = process.env.BIZINFO_API_KEY;

// ✅ 기업마당 API에서 인식 가능한 실제 기관명들로 교체
const TARGET_ORGS = [
    '한국디자인진흥원',
    '경남지식재산센터',
    '대한무역투자진흥공사',
    '경상남도청',
    '중소벤처기업부',
    '산업통상자원부',
    '특허청'
];

async function fetchDataFromAPI() {
    const allItems = [];

    for (const org of TARGET_ORGS) {
        try {
            const url = `https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do?crtfcKey=${API_KEY}&dataType=json&searchCnt=30&insttNm=${encodeURIComponent(org)}`;
            const response = await axios.get(url);

            const items = response.data?.items || [];

            // 디버깅 로그 (처음 한 번만 전체 출력)
            if (items.length > 0) {
                console.log(`📦 [${org}] 수신된 공고 수: ${items.length}`);
                console.log('🧾 필드 목록:', Object.keys(items[0]));
            }

            const mapped = items.map(item => {
                const title = item.policyNm || item.pblancNm || '제목 없음';
                const content = item.policyCn || item.bsnsSumryCn || item.cn || '내용 없음';
                const agency = item.cnstcDept || item.jrsdInsttNm || item.author || item.excInsttNm || org;
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
