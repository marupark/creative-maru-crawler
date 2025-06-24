// index.js - MAILNARA v7.0 메인 실행 파일
// API 수집 → 필터링 → 메일 발송 통합 관리

const axios = require('axios');
const { sendNotificationEmail } = require('./send-email-v7');

// 크리에이티브마루 핵심 키워드 (업데이트된 버전)
const coreKeywords = [
    // 디자인 영역
    '디자인', '브랜딩', '브랜드', '리뉴얼', '홈페이지', '카탈로그',
    'ui/ux', 'uiux', 'gui', '웹사이트', '웹 사이트', '홍보물', '영상',
    '시각디자인', '시각 디자인', 'bi', 'ci', '패키지디자인', '패키지 디자인',
    
    // 마케팅 확장
    '광고', '프로모션', '홍보전략', '브랜드마케팅', '디지털마케팅',
    '온라인마케팅', '해외마케팅', '수출마케팅', '글로벌마케팅',
    
    // 사업 유형
    '바우처', 'voucher', '지원사업', '지원', '육성', '개발지원',
    '수출', '해외', '글로벌', '국제', '혁신', '제조혁신'
];

// 타겟 기관 (3개 한정)
const targetAgencies = [
    '한국디자인진흥원',  // KIDP
    '한국지식재산보호원', // RIPC  
    'KOTRA',             // KOTRA
    '코트라'             // KOTRA 한글명
];

// 지역 키워드
const targetRegions = ['경남', '창원', '김해', '밀양', '부산', '울산', '전국'];

// API 데이터 수집
async function getBizinfoAPI() {
    const API_KEY = process.env.BIZINFO_API_KEY;
    
    if (!API_KEY) {
        console.error('❌ BIZINFO_API_KEY 환경변수가 설정되지 않았습니다.');
        return null;
    }
    
    const url = `https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do`;
    
    try {
        console.log('🔄 API 호출 시작...');
        
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
        if (error.response) {
            console.error('📄 응답 상태:', error.response.status);
            console.error('📄 응답 데이터:', error.response.data);
        }
        return null;
    }
}

// 필터링 함수
function shouldIncludeNotice(title, content, agency) {
    const fullText = `${title} ${content}`.toLowerCase();
    
    // 1차: 기관 필터 (3개 기관만)
    const isTargetAgency = targetAgencies.some(targetAgency => 
        agency.toLowerCase().includes(targetAgency.toLowerCase())
    );
    
    if (!isTargetAgency) {
        return false;
    }
    
    // 2차: 키워드 필터
    const hasKeyword = coreKeywords.some(keyword => 
        fullText.includes(keyword.toLowerCase())
    );
    
    if (!hasKeyword) {
        return false;
    }
    
    // 3차: 지역 필터 (선택사항)
    const hasRegion = targetRegions.some(region => 
        fullText.includes(region.toLowerCase())
    ) || fullText.includes('전국');
    
    return hasRegion;
}

// 점수 계산 (v6.0 시스템 재사용)
function calculateScore(title, content, agency) {
    let score = 0;
    const text = `${title} ${content}`.toLowerCase();
    
    // 기본 점수
    score += 20;
    
    // 핵심 키워드 가중치
    const keywordWeights = {
        '디자인': 15, '브랜딩': 15, '브랜드': 12,
        '홈페이지': 12, '카탈로그': 10, '마케팅': 10,
        'ui/ux': 13, 'uiux': 13, 'gui': 8,
        '바우처': 8, '수출': 7, '혁신': 6,
        '창원': 8, '경남': 6, '전국': 3
    };
    
    Object.entries(keywordWeights).forEach(([keyword, weight]) => {
        if (text.includes(keyword.toLowerCase())) {
            score += weight;
        }
    });
    
    // 기관별 가산점
    if (agency.includes('한국디자인진흥원')) score += 10;
    if (agency.includes('KOTRA') || agency.includes('코트라')) score += 8;
    if (agency.includes('한국지식재산보호원')) score += 6;
    
    return Math.min(score, 100);
}

// 데이터 변환 및 필터링
function transformApiData(apiData) {
    if (!apiData || !apiData.jsonArray) {
        console.log('❌ API 응답 데이터 구조가 예상과 다릅니다.');
        return [];
    }
    
    const items = apiData.jsonArray || [];
    const itemsArray = Array.isArray(items) ? items : [items];
    
    console.log(`📊 원본 데이터: ${itemsArray.length}개`);
    
    const filtered = itemsArray
        .filter(item => {
            return shouldIncludeNotice(
                item.policyNm || '', 
                item.policyCn || '', 
                item.cnstcDept || ''
            );
        })
        .map(item => ({
            title: item.pblancNm || '제목 없음', 
agency: item.jrsdInsttNm || '기관 정보 없음',
period: `${item.reqstBeginEndDe || ''} ~ ${item.reqstBeginEndDe || ''}`,
deadline: item.reqstBeginEndDe || '',
link: item.pblancUrl || '#',
summary: item.bsnsSumryCn ? item.bsnsSumryCn.substring(0, 200) + '...' : '내용 없음',
            source: 'BizInfo_API_v7',
            score: calculateScore(
                item.policyNm || '', 
                item.policyCn || '', 
                item.cnstcDept || ''
            )
        }));
    
    console.log(`🎯 필터링 결과: ${filtered.length}개`);
    return filtered;
}

// 메인 실행 함수
async function runMailnaraV7() {
    console.log('🚀 MAILNARA v7.0 실제 운영 시작');
    console.log('🎯 타겟: 3개 기관 (KIDP, RIPC, KOTRA)');
    console.log('🔍 대상: 크리에이티브마루 맞춤 키워드');
    
    try {
        // 1. API 데이터 수집
        const apiData = await getBizinfoAPI();
        if (!apiData) {
            throw new Error('API 데이터 수집 실패');
        }
        
        // 2. 데이터 변환 및 필터링
        const notices = transformApiData(apiData);
        
        // 3. 결과 통계
        console.log('\n📊 수집 결과:');
        console.log(`   총 공고: ${notices.length}개`);
        
        if (notices.length > 0) {
            const agencies = [...new Set(notices.map(n => n.agency))];
            agencies.forEach(agency => {
                const count = notices.filter(n => n.agency === agency).length;
                console.log(`   ${agency}: ${count}개`);
            });
            
            const highScore = notices.filter(n => n.score >= 70).length;
            const avgScore = Math.round(notices.reduce((sum, n) => sum + n.score, 0) / notices.length);
            console.log(`   고득점(70↑): ${highScore}개`);
            console.log(`   평균점수: ${avgScore}점`);
        }
        
        // 4. 메일 발송
        console.log('\n📧 메일 발송 중...');
        const emailSent = await sendNotificationEmail(notices);
        
        if (emailSent) {
            console.log('✅ MAILNARA v7.0 실행 완료!');
        } else {
            console.log('⚠️ 메일 발송 실패, 하지만 데이터 수집은 성공');
        }
        
        return {
            success: true,
            totalNotices: notices.length,
            highScoreNotices: notices.filter(n => n.score >= 70).length,
            emailSent: emailSent
        };
        
    } catch (error) {
        console.error('❌ MAILNARA v7.0 실행 실패:', error.message);
        return {
            success: false,
            error: error.message
        };
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
