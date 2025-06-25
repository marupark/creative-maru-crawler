// index.js - MAILNARA v7.2 디버그 패치 포함

const axios = require('axios');
const { sendNotificationEmail } = require('./send-email-v7');
const { analyzeNoticeEnhanced } = require('./analyze');
require('dotenv').config();

const API_KEY = process.env.BIZINFO_API_KEY;
const TARGET_ORGS = ['KIDP', 'RIPC', 'KOTRA'];

async function fetchDataFromAPI() {
    const allItems = [];

    for (const org of TARGET_ORGS) {
        try {
            const url = `https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do?crtfcKey=${API_KEY}&dataType=json&searchCondition=insttNm&searchKeyword=${encodeURIComponent(org)}`;
            const response = await axios.get(url);

            const items = response.data.body?.items || [];

            let logOnce = false;

            const mapped = items.map(item => {
                if (!logOnce) {
                    console.log('📦 [DEBUG] 원본 item 필드 전체:', Object.keys(item));
                    console.log('📦 [DEBUG] 원본 item 내용 전체:\n', JSON.stringify(item, null, 2));
                    logOnce = true;
                }

                const title = item.bsnmNm || item.pblancNm || '제목 없음';
                const content = item.cn || item.bsnsSumryCn || '내용 없음';
                const agency = item.jrsdInsttNm || item.cnstcInsttNm || item.author || '기관 정보 없음';
                const period = item.rceptPd || item.reqstBeginEndDe || '기간 정보 없음';
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
