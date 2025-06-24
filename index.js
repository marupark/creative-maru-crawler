// 📁 index.js 수정본 (MAILNARA v7.0)
// ✅ 대상 기관 확장 버전

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

// ✅ 확장된 필터링 기관 목록
const targetAgencies = [
    '경상남도', '특허청', '산업통상자원부', '중소벤처기업부',
    '경남테크노파크', '김해의생명센터', '창원산업진흥원',
    '한국디자인진흥원', 'KOTRA', '코트라', 'RIPC', '중소기업진흥공단'
];

const targetRegions = ['경남', '창원', '김해', '밀양', '부산', '울산', '전국'];

async function getBizinfoAPI() {
    const API_KEY = process.env.BIZINFO_API_KEY;
    if (!API_KEY) {
        console.error('❌ BIZINFO_API_KEY 환경변수가 설정되지 않았습니다.');
        return null;
    }

    try {
        const response = await axios.get('https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do', {
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
        '디자인': 15, '브랜딩': 15, '브랜드': 12,
        '홈페이지': 12, '카탈로그': 10, '마케팅': 10,
        'ui/ux': 13, 'uiux': 13, 'gui': 8,
        '바우처': 8, '수출': 7, '혁신': 6,
        '창원': 8, '경남': 6, '전국': 3
    };
    for (const [k, w] of Object.entries(keywordWeights)) {
        if (text.includes(k)) score += w;
    }
    if (agency.includes('한국디자인진흥원')) score += 10;
    if (agency.includes('KOTRA') || agency.includes('코트라')) score += 8;
    if (agency.includes('한국지식재산보호원')) score += 6;
    return Math.min(score, 100);
}

function transformApiData(apiData) {
    if (!apiData || !apiData.jsonArray) return [];
    return apiData.jsonArray.filter(item =>
        shouldIncludeNotice(item.policyNm || '', item.policyCn || '', item.cnstcDept || '')
    ).map(item => ({
        title: item.policyNm || '제목 없음',
        agency: item.cnstcDept || '기관 정보 없음',
        period: `${item.reqstBeginEndDe || ''} ~ ${item.reqstBeginEndDe || ''}`,
        deadline: item.reqstBeginEndDe || '',
        link: item.pblancUrl || '#',
        summary: item.policyCn ? item.policyCn.substring(0, 200) + '...' : '내용 없음',
        source: 'BizInfo_API_v7',
        score: calculateScore(item.policyNm || '', item.policyCn || '', item.cnstcDept || '')
    }));
}

async function runMailnaraV7() {
    const apiData = await getBizinfoAPI();
    if (!apiData) return;
    const notices = transformApiData(apiData);
    console.log(`🎯 필터링 결과: ${notices.length}개`);
    await sendNotificationEmail(notices);
}

if (require.main === module) runMailnaraV7();
