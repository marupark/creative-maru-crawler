// index.js - MAILNARA v7.0 메인 실행 파일 (최종 수정본)
// API 수집 → 필터링 → 메일 발송 통합 관리

const axios = require('axios');
const { sendNotificationEmail } = require('./send-email-v7');

const coreKeywords = [
    '디자인', '브랜딩', '브랜드', '리뉴얼', '홈페이지', '카탈로그',
    'ui/ux', 'uiux', 'gui', '웹사이트', '웹 사이트', '홍보물', '영상',
    '시각디자인', '시각 디자인', 'bi', 'ci', '패키지디자인', '패키지 디자인',
    '광고', '프로모션', '홍보전략', '브랜드마케팅', '디지털마케팅',
    '온라인마케팅', '해외마케팅', '수출마케팅', '글로벌마케팅',
    '바우처', 'voucher', '지원사업', '지원', '육성', '개발지원',
    '수출', '해외', '글로벌', '국제', '혁신', '중소기업혁신바우처', '혁신바우처', '제조혁신'
];

const targetAgencies = [
    '경상남도', '특허청', '산업통상자원부', '중소벤처기업부'
];
const targetRegions = ['경남', '창원', '김해', '밀양', '부산', '울산', '전국'];

async function getBizinfoAPI() {
    const API_KEY = process.env.BIZINFO_API_KEY;
    if (!API_KEY) {
        console.error('❌ BIZINFO_API_KEY 환경변수가 설정되지 않았습니다.');
        return null;
    }
    const url = `https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do`;
    try {
        const response = await axios.get(url, {
            params: {
                crtfcKey: API_KEY,
                dataType: 'json',
                searchCnt: 100,
                hashtags: '기술,디자인,경남'
            }
        });
        return response.data;
    } catch (error) {
        console.error('❌ API 호출 실패:', error.message);
        return null;
    }
}

function shouldIncludeNotice(title, content, agency) {
    return targetAgencies.some(target => agency.toLowerCase().includes(target.toLowerCase()));
}

function calculateScore(title, content, agency) {
    let score = 20;
    const text = `${title} ${content}`.toLowerCase();
    const keywordWeights = {
        '디자인': 15, '브랜딩': 15, '브랜드': 12, '홈페이지': 12, '카탈로그': 10,
        '마케팅': 10, 'ui/ux': 13, 'uiux': 13, 'gui': 8, '바우처': 8,
        '수출': 7, '혁신': 6, '창원': 8, '경남': 6, '전국': 3
    };
    Object.entries(keywordWeights).forEach(([kw, wt]) => {
        if (text.includes(kw)) score += wt;
    });
    if (agency.includes('한국디자인진흥원')) score += 10;
    if (agency.includes('KOTRA') || agency.includes('코트라')) score += 8;
    if (agency.includes('한국지식재산보호원')) score += 6;
    return Math.min(score, 100);
}

function transformApiData(apiData) {
    if (!apiData || !apiData.jsonArray) {
        console.log('❌ API 응답 데이터 구조 오류');
        return [];
    }
    const items = apiData.jsonArray;
    return items
        .map(item => {
    const title = item.policyNm || item.pblancNm || '제목 없음';
    const content = item.policyCn || item.cn || '내용 없음';

    // 🔄 agency 필드 우선순위 재조정
    const agency = item.jrsdInsttNm || item.cnstcDept || item.author || item.excInsttNm || '기관 정보 없음';

    return {
        title,
        agency,
        period: `${item.reqstBeginDe || ''} ~ ${item.reqstEndDe || ''}`,
        deadline: item.reqstEndDe || '',
        link: item.pblancUrl || '#',
        summary: content.substring(0, 200) + '...',
        source: 'BizInfo_API_v7',
        score: calculateScore(title, content, agency)
    };
})

        .filter(n => shouldIncludeNotice(n.title, n.summary, n.agency));
}

async function runMailnaraV7() {
    try {
        const apiData = await getBizinfoAPI();
        const notices = transformApiData(apiData);
        if (notices.length > 0) {
            await sendNotificationEmail(notices);
        }
        return {
            success: true,
            totalNotices: notices.length,
            highScore: notices.filter(n => n.score >= 70).length
        };
    } catch (e) {
        console.error('❌ 실행 오류:', e.message);
        return { success: false, error: e.message };
    }
}

if (require.main === module) {
    runMailnaraV7();
}

module.exports = {
    runMailnaraV7,
    getBizinfoAPI,
    transformApiData,
    shouldIncludeNotice,
    calculateScore
};
