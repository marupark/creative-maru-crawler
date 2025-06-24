// index.js - MAILNARA v7.0 메인 실행 파일
// API 수집 → 필터링 → 메일 발송 통합 관리

const axios = require('axios');
const { sendNotificationEmail } = require('./send-email-v7');

// 핵심 키워드
const coreKeywords = [
    '디자인', '브랜딩', '브랜드', '리뉴얼', '홈페이지', '카탈로그',
    'ui/ux', 'uiux', 'gui', '웹사이트', '웹 사이트', '홍보물', '영상',
    '시각디자인', '시각 디자인', 'bi', 'ci', '패키지디자인', '패키지 디자인',
    '광고', '프로모션', '홍보전략', '브랜드마케팅', '디지털마케팅',
    '온라인마케팅', '해외마케팅', '수출마케팅', '글로벌마케팅',
    '바우처', 'voucher', '지원사업', '지원', '육성', '개발지원',
    '수출', '해외', '글로벌', '국제', '혁신', '중소기업혁신바우처', '혁신바우처', '제조혁신'
];

// 타겟 기관
const targetAgencies = [
    '경상남도', '특허청', '산업통상자원부', '중소벤처기업부'
];

// 지역 키워드
const targetRegions = ['경남', '창원', '김해', '밀양', '부산', '울산', '전국'];

// API 수집
async function getBizinfoAPI() {
    const API_KEY = process.env.BIZINFO_API_KEY;
    const url = `https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do`;

    if (!API_KEY) {
        console.error('❌ BIZINFO_API_KEY 환경변수가 없습니다.');
        return null;
    }

    try {
        console.log('🔄 API 호출 중...');
        const response = await axios.get(url, {
            params: {
                crtfcKey: API_KEY,
                dataType: 'json',
                searchCnt: 100,
                hashtags: '기술,디자인,경남'
            }
        });
        console.log('✅ API 호출 성공');
        return response.data;
    } catch (error) {
        console.error('❌ API 호출 실패:', error.message);
        return null;
    }
}

// 필터 조건
function shouldIncludeNotice(title, content, agency) {
    return targetAgencies.some(target =>
        agency.toLowerCase().includes(target.toLowerCase())
    );
}

// 점수 계산
function calculateScore(title, content, agency) {
    let score = 20;
    const text = `${title} ${content}`.toLowerCase();

    const keywordWeights = {
        '디자인': 15, '브랜딩': 15, '브랜드': 12,
        '홈페이지': 12, '카탈로그': 10, '마케팅': 10,
        'ui/ux': 13, 'uiux': 13, 'gui': 8,
        '바우처': 8, '수출': 7, '혁신': 6,
        '창원': 8, '경남': 6, '전국': 3
    };

    for (const [keyword, weight] of Object.entries(keywordWeights)) {
        if (text.includes(keyword)) score += weight;
    }

    if (agency.includes('한국디자인진흥원')) score += 10;
    if (agency.includes('KOTRA') || agency.includes('코트라')) score += 8;
    if (agency.includes('한국지식재산보호원')) score += 6;

    return Math.min(score, 100);
}

// 데이터 변환
function transformApiData(apiData) {
    if (!apiData || !apiData.jsonArray) {
        console.log('❌ API 응답 구조 이상');
        return [];
    }

    const items = apiData.jsonArray;
    console.log(`📊 원본 공고 수: ${items.length}`);

    return items
        .map(item => {
            const title = item.policyNm || item.pblancNm || '제목 없음';
            const content = item.policyCn || item.cn || '내용 없음';

            // ✅ 필드 우선순위 수정됨
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
        .filter(item => shouldIncludeNotice(item.title, item.summary, item.agency));
}

// 실행 함수
async function runMailnaraV7() {
    console.log('🚀 MAILNARA v7.0 실행 시작');

    try {
        const apiData = await getBizinfoAPI();
        if (!apiData) throw new Error('API 응답 없음');

        const notices = transformApiData(apiData);
        console.log(`🎯 필터링 후 공고 수: ${notices.length}`);

        if (notices.length > 0) {
            const agencies = [...new Set(notices.map(n => n.agency))];
            agencies.forEach(agency => {
                const count = notices.filter(n => n.agency === agency).length;
                console.log(`📌 ${agency}: ${count}개`);
            });

            const highScore = notices.filter(n => n.score >= 70).length;
            const avgScore = Math.round(
                notices.reduce((sum, n) => sum + n.score, 0) / notices.length
            );
            console.log(`📊 고득점 공고: ${highScore}개, 평균 점수: ${avgScore}점`);
        }

        const emailSent = await sendNotificationEmail(notices);
        if (emailSent) {
            console.log('✅ 메일 발송 성공');
        } else {
            console.warn('⚠️ 메일 발송 실패');
        }

        return { success: true, totalNotices: notices.length, emailSent };

    } catch (err) {
        console.error('❌ 실행 중 오류:', err.message);
        return { success: false, error: err.message };
    }
}

// 직접 실행 시
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
