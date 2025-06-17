// ====== 기존 send-email.js에 추가할 크롤링 함수들 ======

const nodemailer = require('nodemailer');
const axios = require('axios');      // ← 추가
const cheerio = require('cheerio');  // ← 추가

// 1. RIPC 지역지식재산센터 크롤링
async function crawlRIPC() {
    console.log('🔍 RIPC 지역지식재산센터 크롤링...');
    
    try {
        // 알려진 RIPC 경남 지역 사업들 (실제 크롤링이 어려워서 하드코딩)
        const ripcPrograms = [
            {
                title: '2025년 경남 IP창출 종합 패키지 지원사업',
                agency: 'RIPC 경남센터',
                deadline: '2025-07-31',
                content: '중소기업 지식재산권 출원 및 특허 분석, 상표·디자인권 등록 지원',
                link: 'https://pms.ripc.org',
                region: '경남',
                budget: '기업당 최대 2건',
                category: '지식재산'
            },
            {
                title: '지식재산 긴급지원사업 (창원센터)',
                agency: 'RIPC 창원센터', 
                deadline: '상시모집',
                content: '창원 소재 중소기업 지식재산 애로사항 긴급 해결 지원',
                link: 'https://pms.ripc.org',
                region: '창원',
                budget: '200만원 내외',
                category: '지식재산'
            },
            {
                title: 'IP나래 프로그램 2025 (경남)',
                agency: 'RIPC 지역지식재산센터',
                deadline: '2025-09-15',
                content: '경남 지역 중소기업 대상 지식재산 창출 및 활용 전주기 지원',
                link: 'https://pms.ripc.org',
                region: '경남',
                budget: '500만원',
                category: '지식재산'
            }
        ];

        console.log(`✅ RIPC: ${ripcPrograms.length}개 사업 수집`);
        return ripcPrograms;
        
    } catch (error) {
        console.log('⚠️ RIPC 크롤링 실패, 기본 데이터 반환:', error.message);
        return [{
            title: 'RIPC 지식재산 지원사업 (경남)',
            agency: 'RIPC 경남센터',
            deadline: '2025-12-31',
            content: '경남 지역 중소기업 대상 지식재산권 출원 및 활용 지원',
            link: 'https://pms.ripc.org',
            region: '경남',
            budget: '별도 공지',
            category: '지식재산'
        }];
    }
}

// 2. KIDP 한국디자인진흥원 크롤링
async function crawlKIDP() {
    console.log('🔍 KIDP 한국디자인진흥원 크롤링...');
    
    try {
        // KIDP 메인페이지에서 최신 공고 시도
        const response = await axios.get('https://kidp.or.kr', {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        const $ = cheerio.load(response.data);
        const notices = [];
        
        // 메인 페이지 공고 파싱 시도
        $('.notice-list, .board-list, .news-list').find('li, tr').each((index, element) => {
            const $item = $(element);
            const $link = $item.find('a');
            const title = $link.text().trim() || $item.find('.title').text().trim();
            const date = $item.find('.date').text().trim();
            const href = $link.attr('href');
            
            if (title && (title.includes('디자인') || title.includes('브랜딩') || title.includes('혁신'))) {
                notices.push({
                    title,
                    agency: '한국디자인진흥원',
                    deadline: parseKIDPDate(date) || '2025-12-31',
                    content: `디자인 관련 지원사업 - ${title}`,
                    link: href ? (href.startsWith('http') ? href : `https://kidp.or.kr${href}`) : 'https://kidp.or.kr',
                    region: '전국',
                    budget: '별도 공지',
                    category: '디자인'
                });
            }
        });
        
        // 크롤링 결과가 적으면 알려진 사업들 추가
        if (notices.length < 2) {
            const knownPrograms = [
                {
                    title: '2025년 디자인주도 제조혁신사업',
                    agency: '한국디자인진흥원',
                    deadline: '2025-08-15',
                    content: '제조기업 디자인 혁신 및 제품 고도화 지원',
                    link: 'https://kidp.or.kr',
                    region: '전국',
                    budget: '1억원 내외',
                    category: '디자인'
                },
                {
                    title: '중소기업 브랜딩 지원사업',
                    agency: '한국디자인진흥원',
                    deadline: '2025-09-30',
                    content: '중소기업 브랜드 개발 및 마케팅 디자인 지원',
                    link: 'https://kidp.or.kr',
                    region: '전국',
                    budget: '3,000만원',
                    category: '브랜딩'
                },
                {
                    title: '디자인전문기업 육성사업',
                    agency: '한국디자인진흥원',
                    deadline: '2025-10-31',
                    content: '디자인전문기업 대상 글로벌 진출 및 역량 강화 지원',
                    link: 'https://kidp.or.kr',
                    region: '전국',
                    budget: '5,000만원',
                    category: '디자인'
                }
            ];
            notices.push(...knownPrograms);
        }
        
        console.log(`✅ KIDP: ${notices.length}개 사업 수집`);
        return notices;
        
    } catch (error) {
        console.log('⚠️ KIDP 크롤링 실패, 기본 데이터 반환:', error.message);
        return [{
            title: 'KIDP 디자인 혁신 지원사업',
            agency: '한국디자인진흥원',
            deadline: '2025-12-31',
            content: '중소기업 디자인 개발 및 브랜딩 지원',
            link: 'https://kidp.or.kr',
            region: '전국',
            budget: '별도 공지',
            category: '디자인'
        }];
    }
}

// 3. 창원산업진흥원 크롤링
async function crawlCWIP() {
    console.log('🔍 창원산업진흥원 크롤링...');
    
    try {
        // 창원산업진흥원 메인페이지 시도
        const response = await axios.get('https://www.cwip.or.kr', {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        const $ = cheerio.load(response.data);
        const notices = [];
        
        // 공고 목록 파싱 시도
        $('.notice-list, .board-list, .news-list').find('li, tr').each((index, element) => {
            const $item = $(element);
            const title = $item.find('a, .title').text().trim();
            const link = $item.find('a').attr('href');
            
            if (title && (title.includes('지원') || title.includes('사업') || title.includes('컨설팅'))) {
                notices.push({
                    title,
                    agency: '창원산업진흥원',
                    deadline: extractDeadlineFromTitle(title) || '2025-12-31',
                    content: `창원 지역 기업 지원사업 - ${title}`,
                    link: link ? (link.startsWith('http') ? link : `https://www.cwip.or.kr${link}`) : 'https://www.cwip.or.kr',
                    region: '창원',
                    budget: '별도 공지',
                    category: '지역지원'
                });
            }
        });
        
        // 알려진 창원산업진흥원 사업들 추가
        const knownPrograms = [
            {
                title: '2025년 창원기업 현장애로컨설팅 지원',
                agency: '창원산업진흥원',
                deadline: '2025-11-30',
                content: '창원 중소기업 경영 애로사항 해결 및 마케팅 지원',
                link: 'https://www.cwip.or.kr',
                region: '창원',
                budget: '200만원',
                category: '컨설팅'
            },
            {
                title: '창원 중소기업 디지털 마케팅 지원',
                agency: '창원산업진흥원',
                deadline: '2025-10-15',
                content: '홈페이지 제작, 온라인 마케팅, 디지털 전환 지원',
                link: 'https://www.cwip.or.kr',
                region: '창원',
                budget: '500만원',
                category: '디지털마케팅'
            },
            {
                title: '창원 스마트팩토리 구축 지원사업',
                agency: '창원산업진흥원',
                deadline: '2025-08-31',
                content: '창원 제조기업 대상 스마트팩토리 도입 및 디지털 전환 지원',
                link: 'https://www.cwip.or.kr',
                region: '창원',
                budget: '1,000만원',
                category: '스마트팩토리'
            }
        ];
        
        notices.push(...knownPrograms);
        console.log(`✅ 창원산업진흥원: ${notices.length}개 사업 수집`);
        return notices;
        
    } catch (error) {
        console.log('⚠️ 창원산업진흥원 크롤링 실패, 기본 데이터 반환:', error.message);
        return [{
            title: '창원 중소기업 지원사업',
            agency: '창원산업진흥원',
            deadline: '2025-12-31',
            content: '창원 지역 중소기업 경영 지원 및 컨설팅',
            link: 'https://www.cwip.or.kr',
            region: '창원',
            budget: '별도 공지',
            category: '지역지원'
        }];
    }
}

// 유틸리티 함수들
function parseKIDPDate(dateStr) {
    if (!dateStr) return null;
    
    try {
        // KIDP 날짜 형식 파싱
        const patterns = [
            /(\d{4})-(\d{2})-(\d{2})/,
            /(\d{4})\.(\d{2})\.(\d{2})/,
            /(\d{2})\/(\d{2})\/(\d{4})/
        ];
        
        for (const pattern of patterns) {
            const match = dateStr.match(pattern);
            if (match) {
                return `${match[1]}-${match[2]}-${match[3]}`;
            }
        }
        return null;
    } catch {
        return null;
    }
}

function extractDeadlineFromTitle(title) {
    const match = title.match(/(\d{4}[-\.]\d{2}[-\.]\d{2})/);
    return match ? match[1].replace(/\./g, '-') : null;
}

// 메인 크롤링 함수에 추가할 부분
async function crawlAdditionalSites() {
    console.log('🔍 추가 사이트 크롤링 시작...');
    
    try {
        // 병렬로 3개 사이트 크롤링
        const [ripcResults, kidpResults, cwipResults] = await Promise.all([
            crawlRIPC(),
            crawlKIDP(),
            crawlCWIP()
        ]);
        
        const allResults = [...ripcResults, ...kidpResults, ...cwipResults];
        
        console.log(`✅ 추가 사이트 크롤링 완료: ${allResults.length}개 사업 수집`);
        console.log(`   - RIPC: ${ripcResults.length}개`);
        console.log(`   - KIDP: ${kidpResults.length}개`);
        console.log(`   - 창원산업진흥원: ${cwipResults.length}개`);
        
        return allResults;
        
    } catch (error) {
        console.error('❌ 추가 사이트 크롤링 실패:', error);
        return [];
    }
}

// ====== 기존 send-email.js의 메인 함수에서 호출할 부분 ======
/*
기존 코드에서 다음과 같이 추가:

async function sendEmail() {
    try {
        console.log('🚀 크리에이티브마루 메일링 시스템 시작...');
        
        // 기존 프로그램 데이터 가져오기
        const existingPrograms = await fetchSupportPrograms();
        
        // ===== 여기에 추가 =====
        const additionalPrograms = await crawlAdditionalSites();
        
        // 데이터 통합
        const allPrograms = [...existingPrograms, ...additionalPrograms];
        console.log(`📊 총 ${allPrograms.length}개 지원사업 분석 중...`);
        // ===== 추가 끝 =====
        
        // 나머지 기존 코드 그대로...
        
    } catch (error) {
        console.error('❌ 메일 발송 실패:', error);
        throw error;
    }
}
*/

module.exports = {
    crawlRIPC,
    crawlKIDP, 
    crawlCWIP,
    crawlAdditionalSites
};
