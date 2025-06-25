// index.js - MAILNARA v7.1 메인 실행 파일

const axios = require('axios');
const { sendNotificationEmail } = require('./send-email-v7');

// 크리에이티브마루 맞춤 키워드
const coreKeywords = [
    '디자인', '브랜딩', '브랜드', '리뉴얼', '홈페이지', '카탈로그',
    'ui/ux', 'uiux', 'gui', '웹사이트', '홍보물', '영상',
    '시각디자인', 'bi', 'ci', '패키지디자인',
    '광고', '프로모션', '브랜드마케팅', '디지털마케팅',
    '바우처', '지원사업', '수출', '글로벌', '혁신'
];

// 필터링 기관 목록
const targetAgencies = [
    '경상남도', '산업통상자원부', '중소벤처기업부', '특허청'
];

async function getBizinfoAPI() {
    const API_KEY = process.env.BIZINFO_API_KEY;
    const url = 'https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do';

    try {
        const response = await axios.get(url, {
            params: {
                crtfcKey: API_KEY,
                dataType: 'json',
                searchCnt: 100
            }
        });
        console.log('✅ API 호출 성공');
        return response.data;
    } catch (error) {
        console.error('❌ API 호출 실패:', error.message);
        return null;
    }
}

function calculateScore(title, content, agency) {
    let score = 20;
    const text = `${title} ${content}`.toLowerCase();

    const keywordWeights = {
        '디자인': 15, '브랜딩': 15, '홈페이지': 12,
        '카탈로그': 10, 'ui/ux': 13, '수출': 7,
        '혁신': 6, '경남': 6, '전국': 3
    };

    Object.entries(keywordWeights).forEach(([kw, w]) => {
        if (text.includes(kw.toLowerCase())) score += w;
    });

    if (agency.includes('산업통상자원부')) score += 8;
    if (agency.includes('경상남도')) score += 10;

    return Math.min(score, 100);
}

function transformApiData(apiData) {
    if (!apiData || !apiData.jsonArray) {
        console.log('❌ 잘못된 데이터 구조');
        return [];
    }

    const filtered = apiData.jsonArray.map(item => {
        const title = item.pblancNm || item.policyNm || '제목 없음';

        // ✅ 내용 필드 확정: bsnsSumryCn
        const rawContent = item.bsnsSumryCn || '';
        const content = rawContent.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() || '내용 없음';

        // ✅ 기관 필드 보정
        const agency = item.jrsdInsttNm || item.excInsttNm || '기관 정보 없음';

        return {
            title,
            content,
            agency,
            period: item.reqstBeginEndDe || '기간 없음',
            deadline: item.reqstBeginEndDe || '',
            link: item.pblancUrl || '#',
            summary: content.substring(0, 200) + '...',
            source: 'BizInfo_API',
            score: calculateScore(title, content, agency)
        };
    }).filter(n => {
        return targetAgencies.some(ta => n.agency.includes(ta));
    });

    console.log(`🎯 필터링 결과: ${filtered.length}개`);
    return filtered;
}

async function runMailnaraV7() {
    console.log('🚀 MAILNARA v7.1 실행 시작');

    const apiData = await getBizinfoAPI();
    if (!apiData) return { success: false };

    const notices = transformApiData(apiData);
    console.log(`📊 수집된 공고 수: ${notices.length}`);

    if (notices.length > 0) {
        const emailSent = await sendNotificationEmail(notices);
        console.log(emailSent ? '✅ 메일 전송 완료' : '⚠️ 메일 전송 실패');
    } else {
        console.log('🔍 조건에 맞는 공고가 없습니다.');
    }

    return {
        success: true,
        total: notices.length
    };
}

// 직접 실행
if (require.main === module) {
    runMailnaraV7();
}

module.exports = {
    runMailnaraV7,
    getBizinfoAPI,
    transformApiData
};
