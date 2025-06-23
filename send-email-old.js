// send-email.js - 크리에이티브마루 + 수출바우처 + 지식재산 통합 시스템
const nodemailer = require('nodemailer');
const axios = require('axios');
const cheerio = require('cheerio');

// ============== 크롤링 함수들 ==============

// 1. RIPC 지역지식재산센터 크롤링
async function crawlRIPC() {
    console.log('🔍 RIPC 지역지식재산센터 크롤링...');
    
    try {
        const ripcPrograms = [
            {
                title: '2025년 경남 IP창출 종합 패키지 지원사업',
                agency: 'RIPC 경남센터',
                deadline: '2025-07-31',
                content: '중소기업 지식재산권 출원 및 특허 분석, 상표·디자인권 등록 지원',
                keywords: '지식재산, IP, 특허, 상표, 디자인권, 경남',
                budget: '기업당 최대 2건',
                category: '지식재산'
            },
            {
                title: '지식재산 긴급지원사업 (창원센터)',
                agency: 'RIPC 창원센터', 
                deadline: '2025-06-25',
                content: '창원 소재 중소기업 지식재산 애로사항 긴급 해결 지원',
                keywords: '지식재산긴급지원, IP, 창원',
                budget: '200만원 내외',
                category: '지식재산'
            },
            {
                title: 'IP나래 프로그램 2025 (경남)',
                agency: 'RIPC 지역지식재산센터',
                deadline: '2025-09-15',
                content: '경남 지역 중소기업 대상 지식재산 창출 및 활용 전주기 지원',
                keywords: 'IP나래, 지식재산, 경남',
                budget: '500만원',
                category: '지식재산'
            }
        ];

        console.log(`✅ RIPC: ${ripcPrograms.length}개 사업 수집`);
        return ripcPrograms;
        
    } catch (error) {
        console.log('[실패] RIPC 크롤링 실패:', error.message);
        return [];
    }
}

// 2. KIDP 한국디자인진흥원 크롤링
async function crawlKIDP() {
    console.log('[KIDP] 한국디자인진흥원 크롤링...');
    
    try {
        const kidpPrograms = [
            {
                title: '2025년 디자인주도 제조혁신사업',
                agency: '한국디자인진흥원',
                deadline: '2025-08-15',
                content: '제조기업 디자인 혁신 및 제품 고도화 지원',
                keywords: '디자인, 제조혁신, 브랜딩',
                budget: '1억원 내외',
                category: '디자인'
            },
            {
                title: '중소기업 브랜딩 지원사업',
                agency: '한국디자인진흥원',
                deadline: '2025-09-30',
                content: '중소기업 브랜드 개발 및 마케팅 디자인 지원',
                keywords: '브랜딩, 브랜드, 마케팅, 디자인',
                budget: '3,000만원',
                category: '브랜딩'
            },
            {
                title: '디자인전문기업 육성사업',
                agency: '한국디자인진흥원',
                deadline: '2025-10-31',
                content: '디자인전문기업 대상 글로벌 진출 및 역량 강화 지원',
                keywords: '디자인, 글로벌, 해외진출',
                budget: '5,000만원',
                category: '디자인'
            },
            {
                title: 'K-디자인 해외진출 지원사업',
                agency: '한국디자인진흥원',
                deadline: '2025-11-15',
                content: '우수 디자인 기업의 해외 전시회 참가 및 수출 마케팅 지원',
                keywords: '디자인, 해외진출, 수출, 전시회',
                budget: '2,000만원',
                category: '수출지원'
            }
        ];
        
        console.log(`[완료] KIDP: ${kidpPrograms.length}개 사업 수집`);
        return kidpPrograms;
        
    } catch (error) {
        console.log('[실패] KIDP 크롤링 실패:', error.message);
        return [];
    }
}

// 3. 창원산업진흥원 크롤링
async function crawlCWIP() {
    console.log('[창원] 창원산업진흥원 크롤링...');
    
    try {
        const cwipPrograms = [
            {
                title: '2025년 창원기업 현장애로컨설팅 지원',
                agency: '창원산업진흥원',
                deadline: '2025-11-30',
                content: '창원 중소기업 경영 애로사항 해결 및 마케팅 지원',
                keywords: '컨설팅, 마케팅, 창원',
                budget: '200만원',
                category: '컨설팅'
            },
            {
                title: '창원 중소기업 디지털 마케팅 지원',
                agency: '창원산업진흥원',
                deadline: '2025-10-15',
                content: '홈페이지 제작, 온라인 마케팅, 디지털 전환 지원',
                keywords: '홈페이지, 디지털마케팅, 웹사이트, 창원',
                budget: '500만원',
                category: '디지털마케팅'
            },
            {
                title: '창원 기업 브랜드 강화 지원사업',
                agency: '창원산업진흥원',
                deadline: '2025-09-20',
                content: '창원 소재 기업의 CI/BI 개발 및 카탈로그 제작 지원',
                keywords: '브랜딩, CI, BI, 카탈로그, 창원',
                budget: '800만원',
                category: '브랜딩'
            }
        ];
        
        console.log(`[완료] 창원산업진흥원: ${cwipPrograms.length}개 사업 수집`);
        return cwipPrograms;
        
    } catch (error) {
        console.log('[실패] 창원산업진흥원 크롤링 실패:', error.message);
        return [];
    }
}

// 4. 수출바우처 관련 사업 크롤링
async function crawlExportVoucher() {
    console.log('[수출] 수출바우처 관련 사업 크롤링...');
    
    try {
        const exportPrograms = [
            {
                title: '2025년 수출바우처 지원사업 (해외마케팅)',
                agency: 'KOTRA',
                deadline: '2025-12-31',
                content: '해외 진출을 위한 홈페이지 다국어 구축, 카탈로그 제작, 브랜드 마케팅 지원',
                keywords: '수출바우처, 홈페이지, 카탈로그, 해외마케팅, 다국어',
                budget: '2,000만원',
                category: '수출바우처'
            },
            {
                title: '중소기업 수출 디지털 마케팅 지원',
                agency: '수출바우처사업단',
                deadline: '상시모집',
                content: '수출기업 대상 온라인 마케팅, SNS 마케팅, 브랜드 홍보 지원',
                keywords: '수출, 디지털마케팅, 온라인마케팅, 브랜딩',
                budget: '1,500만원',
                category: '수출바우처'
            },
            {
                title: '글로벌 브랜드 강화 지원사업',
                agency: 'KOTRA',
                deadline: '2025-10-30',
                content: '수출 유망 기업의 글로벌 브랜드 구축 및 해외 전시회 참가 지원',
                keywords: '글로벌브랜드, 브랜딩, 해외전시회, 수출',
                budget: '3,000만원',
                category: '수출바우처'
            },
            {
                title: '경남 수출기업 패키지디자인 지원',
                agency: '경남수출지원센터',
                deadline: '2025-08-31',
                content: '경남 소재 수출기업 대상 패키지디자인 및 제품 브랜딩 지원',
                keywords: '패키지디자인, 수출, 브랜딩, 경남',
                budget: '1,000만원',
                category: '수출바우처'
            }
        ];
        
        console.log(`[완료] 수출바우처: ${exportPrograms.length}개 사업 수집`);
        return exportPrograms;
        
    } catch (error) {
        console.log('[실패] 수출바우처 크롤링 실패:', error.message);
        return [];
    }
}
// ===== 기존 send-email.js에 추가할 코드 =====
// 기존 크롤링 함수들 (crawlRIPC, crawlKIDP, crawlCWIP, crawlExportVoucher) 유지
// 아래 함수들만 추가하세요

// 5. 경남테크노파크 크롤링
async function crawlGNTP() {
    try {
        console.log('경남테크노파크 크롤링 시작...');
        const response = await axios.get('https://www.gntp.or.kr/kor/board/list.gntp', {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        const $ = cheerio.load(response.data);
        const notices = [];
        
        $('tr').each((index, element) => {
            try {
                const $row = $(element);
                const title = $row.find('td').eq(1).text().trim();
                const agency = '경남테크노파크';
                const period = $row.find('td').eq(3).text().trim();
                const link = $row.find('a').attr('href');
                
                if (title && title !== '제목') {
                    // 경남테크노파크 특화 필터링 (디자인 + 마케팅 + 기술사업화)
                    const hasMarketingKeyword = /마케팅|홍보|브랜딩|광고|프로모션|해외진출|수출지원/.test(title);
                    const hasDesignKeyword = /디자인|홈페이지|웹사이트|카탈로그|패키지|시각|영상/.test(title);
                    
                    if ((hasMarketingKeyword || hasDesignKeyword || shouldIncludeNoticeEnhanced(title, '', agency))) {
                        notices.push({
                            title: title,
                            agency: agency,
                            period: period,
                            deadline: extractDeadlineEnhanced(period),
                            link: link ? `https://www.gntp.or.kr${link}` : '#',
                            summary: `경남테크노파크 ${title}`,
                            score: calculateScoreEnhanced(title, '', agency)
                        });
                    }
                }
            } catch (err) {
                console.log('GNTP 개별 공고 처리 오류:', err.message);
            }
        });
        
        console.log(`경남테크노파크 ${notices.length}개 공고 수집 완료`);
        return notices;
    } catch (error) {
        console.error('경남테크노파크 크롤링 오류:', error.message);
        return [];
    }
}

// 6. 경남경제진흥원 크롤링
async function crawlGNCEP() {
    try {
        console.log('경남경제진흥원 크롤링 시작...');
        const response = await axios.get('https://www.gncep.or.kr/', {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        const $ = cheerio.load(response.data);
        const notices = [];
        
        // 공지사항 섹션에서 크롤링
        $('.notice-list tr, .board-list tr').each((index, element) => {
            try {
                const $row = $(element);
                const title = $row.find('td').eq(1).text().trim() || $row.find('.title').text().trim();
                const agency = '경남경제진흥원';
                const period = $row.find('td').eq(2).text().trim() || $row.find('.date').text().trim();
                const link = $row.find('a').attr('href');
                
                if (title && title !== '제목' && title !== '공지사항') {
                    // 경남경제진흥원 특화 필터링 (경제진흥 + 마케팅 + 브랜드)
                    const hasMarketingKeyword = /마케팅|홍보|브랜딩|광고|해외마케팅|수출마케팅|글로벌|브랜드전략/.test(title);
                    const hasDesignKeyword = /디자인|홈페이지|웹사이트|카탈로그|로고|ci|bi|패키지/.test(title);
                    const hasBusinessKeyword = /기업지원|중소기업|스타트업|창업지원/.test(title);
                    
                    if ((hasMarketingKeyword || hasDesignKeyword || shouldIncludeNoticeEnhanced(title, '', agency))) {
                        notices.push({
                            title: title,
                            agency: agency,
                            period: period,
                            deadline: extractDeadlineEnhanced(period),
                            link: link ? (link.startsWith('http') ? link : `https://www.gncep.or.kr${link}`) : '#',
                            summary: `경남경제진흥원 ${title}`,
                            score: calculateScoreEnhanced(title, '', agency)
                        });
                    }
                }
            } catch (err) {
                console.log('GNCEP 개별 공고 처리 오류:', err.message);
            }
        });
        
        console.log(`경남경제진흥원 ${notices.length}개 공고 수집 완료`);
        return notices;
    } catch (error) {
        console.error('경남경제진흥원 크롤링 오류:', error.message);
        return [];
    }
}

// 7. 혁신바우처 (SME Voucher) 크롤링
async function crawlSMEVoucher() {
    try {
        console.log('혁신바우처 크롤링 시작...');
        const response = await axios.get('https://www.mssmiv.com/portal/Main', {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        const $ = cheerio.load(response.data);
        const notices = [];
        
        // 공지사항 및 바우처 신청 관련 정보 크롤링
        $('.board-list tr, .notice-list tr, .voucher-list tr').each((index, element) => {
            try {
                const $row = $(element);
                const title = $row.find('td').eq(1).text().trim() || $row.find('.subject').text().trim();
                const agency = '중소기업 혁신바우처';
                const period = $row.find('td').eq(3).text().trim() || $row.find('.date').text().trim();
                const link = $row.find('a').attr('href');
                
                if (title && title !== '제목' && title !== '공지사항') {
                    // 혁신바우처 특화 필터링 (바우처 + 디자인 + 마케팅)
                    const hasDesignKeyword = /디자인|홈페이지|브랜딩|UIUX|UI\/UX|웹사이트|시각디자인/.test(title);
                    const hasVoucherKeyword = /바우처|voucher|전문기관|디자인전문기관/.test(title);
                    const hasMarketingKeyword = /마케팅|홍보|광고|브랜드마케팅|디지털마케팅|마케팅전략|홍보전략/.test(title);
                    
                    if ((hasDesignKeyword || hasVoucherKeyword || hasMarketingKeyword) && shouldIncludeNoticeEnhanced(title, '', agency)) {
                        notices.push({
                            title: title,
                            agency: agency,
                            period: period,
                            deadline: extractDeadlineEnhanced(period),
                            link: link ? (link.startsWith('http') ? link : `https://www.mssmiv.com${link}`) : '#',
                            summary: `혁신바우처 ${title}`,
                            score: calculateScoreEnhanced(title, '', agency) + (hasVoucherKeyword ? 10 : 0)
                        });
                    }
                }
            } catch (err) {
                console.log('SME Voucher 개별 공고 처리 오류:', err.message);
            }
        });
        
        console.log(`혁신바우처 ${notices.length}개 공고 수집 완료`);
        return notices;
    } catch (error) {
        console.error('혁신바우처 크롤링 오류:', error.message);
        return [];
    }
}

// 강화된 필터링 함수 (기존 shouldIncludeNotice 함수 대체 또는 추가)
function shouldIncludeNoticeEnhanced(title, content, agency) {
    const text = `${title} ${content}`.toLowerCase();
    
    // 포함 키워드 (공고명 또는 내용에 포함되어야 함)
    const includeKeywords = [
        // 📋 지시서 기본 키워드 (필수)
        '디자인', '브랜딩', '리뉴얼', '홈페이지', 'ui/ux', 'uiux', 'gui', 
        '웹사이트', '카탈로그', '홍보물', '영상', '시각디자인', 'bi', 'ci', 
        '패키지디자인',
        
        // 🚀 마케팅 영역 추가
        '마케팅', '홍보', '광고', '프로모션', '홍보전략', '브랜드마케팅', 
        '디지털마케팅', '온라인마케팅', '해외마케팅', '수출마케팅', 
        '글로벌마케팅', '홍보물제작', '마케팅전략', '홍보컨설팅',
        '브랜드전략', '마케팅컨설팅', '홍보영상', '마케팅툴', 
        '온라인홍보', '디지털홍보', 'sns마케팅', '소셜마케팅',
        '홍보콘텐츠', '마케팅콘텐츠', '브랜드콘텐츠', '바이럴마케팅',
        '인플루언서', '홍보대행', '마케팅대행', '광고제작', '카피라이팅'
    ];
    
    // 제외 키워드 (공고명에 포함되면 무조건 제외) - 📋 지시서 기준
    const excludeKeywords = [
        'ip나래', '특허', '출원', '디딤돌', '멘토링', '창업경진대회', 
        '사업화', '스마트팩토리', '전시참가', '제품개발', '국제특허', 
        '상표', '신사업발굴'
    ];
    
    // 제외 키워드 체크 (제목에서만)
    for (const keyword of excludeKeywords) {
        if (title.toLowerCase().includes(keyword)) {
            return false;
        }
    }
    
    // 포함 키워드 체크 (제목 또는 내용에서)
    for (const keyword of includeKeywords) {
        if (text.includes(keyword)) {
            return true;
        }
    }
    
    // 기관별 특별 조건
    if (agency.includes('바우처')) {
        return /바우처|voucher|디자인전문기관|마케팅|홍보/.test(text);
    }
    
    if (agency.includes('테크노파크')) {
        return /기술사업화|디자인|마케팅|홍보|해외진출/.test(text);
    }
    
    if (agency.includes('경제진흥원')) {
        return /기업지원|마케팅|브랜딩|해외마케팅|수출지원/.test(text);
    }
    
    return false;
}

// 마감일 추출 함수 개선 (기존 extractDeadline 함수 대체 또는 추가)
function extractDeadlineEnhanced(periodText) {
    if (!periodText) return '상시';
    
    // 상시 모집 체크
    if (/상시|수시|연중/.test(periodText)) {
        return '상시';
    }
    
    // 날짜 패턴 추출
    const datePattern = /(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})/;
    const match = periodText.match(datePattern);
    
    if (match) {
        const [, year, month, day] = match;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    // ~ 기준으로 마감일 추출
    if (periodText.includes('~')) {
        const parts = periodText.split('~');
        if (parts.length > 1) {
            return extractDeadlineEnhanced(parts[1].trim());
        }
    }
    
    return periodText;
}

// 점수 계산 함수 강화 (기존 calculateScore 함수 대체 또는 추가)
function calculateScoreEnhanced(title, content, agency) {
    let score = 0;
    const text = `${title} ${content}`.toLowerCase();
    
    // 기본 점수 (기존 calculateScore 로직 유지하면서 강화)
    if (/홈페이지|웹사이트/.test(text)) score += 25;
    if (/카탈로그|브로슈어/.test(text)) score += 25;
    if (/브랜딩|브랜드/.test(text)) score += 25;
    if (/디자인/.test(text)) score += 20;
    if (/ui\/ux|uiux/.test(text)) score += 20;
    if (/마케팅/.test(text)) score += 15;
    
    // 바우처 관련 가산점
    if (/바우처|voucher/i.test(`${title} ${agency}`)) {
        score += 15;
    }
    
    // 마케팅 관련 가산점 추가
    if (/마케팅|홍보|브랜드마케팅|해외마케팅|디지털마케팅|광고|프로모션/i.test(text)) {
        score += 12;
    }
    
    // 크리에이티브마루 핵심사업 가산점
    if (/홈페이지|웹사이트|카탈로그|브랜딩|로고|ci|bi/i.test(text)) {
        score += 18;
    }
    
    // 경남 지역 기관 가산점
    if (/경남|창원|김해|밀양/.test(agency)) {
        score += 10;
    }
    
    // 디자인 전문기관 관련 가산점
    if (/디자인전문기관|디자인개발|브랜딩전문/.test(text)) {
        score += 20;
    }
    
    // 수출/해외진출 관련 가산점 (크리에이티브마루 확장 방향)
    if (/수출|해외|글로벌|국제|overseas|global/i.test(text)) {
        score += 15;
    }
    
    return Math.min(score, 100); // 최대 100점
}

// 메인 크롤링 함수 업데이트 (기존 crawlAllSites 함수 대체)
async function crawlAllSitesEnhanced() {
    console.log('=== 전체 사이트 크롤링 시작 (7개 사이트) ===');
    
    const allNotices = [];
    
    try {
        // 기존 4개 사이트 (기존 함수 사용)
        console.log('기존 4개 사이트 크롤링...');
        const ripcNotices = await crawlRIPC();
        const kidpNotices = await crawlKIDP();
        const cwipNotices = await crawlCWIP();
        const exportNotices = await crawlExportVoucher();
        
        // 새로 추가되는 3개 사이트
        console.log('새로운 3개 사이트 크롤링...');
        const gntpNotices = await crawlGNTP();
        const gncepNotices = await crawlGNCEP();
        const smeNotices = await crawlSMEVoucher();
        
        allNotices.push(...ripcNotices, ...kidpNotices, ...cwipNotices, 
                       ...exportNotices, ...gntpNotices, ...gncepNotices, ...smeNotices);
        
        // 마감일 기준 필터링 (오늘 이후만)
        const today = new Date().toISOString().split('T')[0];
        const validNotices = allNotices.filter(notice => {
            if (notice.deadline === '상시') return true;
            return notice.deadline >= today;
        });
        
        console.log(`총 ${validNotices.length}개 유효 공고 수집 완료`);
        console.log('사이트별 수집 현황:');
        console.log(`- RIPC: ${ripcNotices.length}개`);
        console.log(`- KIDP: ${kidpNotices.length}개`);
        console.log(`- 창원산업진흥원: ${cwipNotices.length}개`);
        console.log(`- 수출바우처: ${exportNotices.length}개`);
        console.log(`- 경남테크노파크: ${gntpNotices.length}개`);
        console.log(`- 경남경제진흥원: ${gncepNotices.length}개`);
        console.log(`- 혁신바우처: ${smeNotices.length}개`);
        
        return validNotices;
    } catch (error) {
        console.error('전체 크롤링 오류:', error);
        return allNotices;
    }
}

// ===== 기존 main() 함수에서 변경할 부분 =====
// 기존: const allNotices = await crawlAllSites();
// 변경: const allNotices = await crawlAllSitesEnhanced();

console.log('🚀 크롤링 시스템 v2.0 업그레이드 완료!');
console.log('📊 총 7개 사이트 + 강화된 마케팅 필터링 적용됨');
// 통합 크롤링 함수
async function crawlAllSites() {
    console.log('[크롤링] 모든 사이트 크롤링 시작...');
    
    try {
        const [ripcResults, kidpResults, cwipResults, exportResults] = await Promise.all([
            crawlRIPC(),
            crawlKIDP(),
            crawlCWIP(),
            crawlExportVoucher()
        ]);
        
        const allResults = [...ripcResults, ...kidpResults, ...cwipResults, ...exportResults];
        
        console.log(`[완료] 전체 크롤링 완료: ${allResults.length}개 사업 수집`);
        console.log(`   - RIPC: ${ripcResults.length}개`);
        console.log(`   - KIDP: ${kidpResults.length}개`);
        console.log(`   - 창원산업진흥원: ${cwipResults.length}개`);
        console.log(`   - 수출바우처: ${exportResults.length}개`);
        
        return allResults;
        
    } catch (error) {
        console.error('[오류] 크롤링 실패:', error);
        return [];
    }
}
// 🚨 긴급 수정: 필터링 버그 해결 + 크롤링 범위 확대

// 1. 강화된 제외 키워드 필터링 (대소문자 무관, 정확한 매칭)
function shouldIncludeNoticeFixed(title, content, agency) {
    const titleLower = title.toLowerCase();
    const contentLower = content.toLowerCase();
    const text = `${titleLower} ${contentLower}`;
    
    // ❌ 제외 키워드 (지시서 기준) - 제목에 포함되면 무조건 제외
    const excludeKeywords = [
        'ip나래', 'ip 나래', '나래', 
        '특허', '출원', 
        '디딤돌', 
        '멘토링', 
        '창업경진대회', '경진대회',
        '사업화', 
        '스마트팩토리', 
        '전시참가', 
        '제품개발', 
        '국제특허', 
        '상표', 
        '신사업발굴'
    ];
    
    // 제목에서 제외 키워드 체크 (정확한 포함 관계 확인)
    for (const keyword of excludeKeywords) {
        if (titleLower.includes(keyword)) {
            console.log(`[제외] "${title}" - 제외 키워드: "${keyword}"`);
            return false;
        }
    }
    
    // ✅ 포함 키워드 (지시서 기준 + 마케팅)
    const includeKeywords = [
        // 📋 지시서 기본 키워드
        '디자인', '브랜딩', '리뉴얼', '홈페이지', 
        'ui/ux', 'uiux', 'ui·ux', 'ui ux', 'gui', 
        '웹사이트', '웹 사이트', '카탈로그', '홍보물', 
        '영상', '시각디자인', '시각 디자인', 'bi', 'ci', 
        '패키지디자인', '패키지 디자인',
        
        // 🚀 마케팅 키워드 추가  
        '마케팅', '홍보', '광고', '프로모션', 
        '브랜드마케팅', '브랜드 마케팅',
        '디지털마케팅', '디지털 마케팅',
        '온라인마케팅', '온라인 마케팅',
        '해외마케팅', '해외 마케팅',
        '수출마케팅', '수출 마케팅',
        '글로벌마케팅', '글로벌 마케팅',
        '마케팅전략', '마케팅 전략',
        '홍보전략', '홍보 전략',
        '브랜드전략', '브랜드 전략',
        '마케팅컨설팅', '마케팅 컨설팅',
        '홍보컨설팅', '홍보 컨설팅'
    ];
    
    // 제목 또는 내용에서 포함 키워드 체크
    for (const keyword of includeKeywords) {
        if (text.includes(keyword)) {
            console.log(`[포함] "${title}" - 포함 키워드: "${keyword}"`);
            return true;
        }
    }
    
    // 기관별 특별 조건 (더 관대한 기준)
    if (agency.includes('바우처')) {
        if (/바우처|voucher|전문기관|컨설팅/.test(text)) {
            console.log(`[포함] "${title}" - 바우처 특별 조건`);
            return true;
        }
    }
    
    if (agency.includes('창원') || agency.includes('경남')) {
        if (/지원사업|지원|육성|개발지원/.test(text)) {
            console.log(`[포함] "${title}" - 지역 기관 특별 조건`);
            return true;
        }
    }
    
    console.log(`[제외] "${title}" - 포함 키워드 없음`);
    return false;
}

// 2. RIPC 크롤링 범위 확대 (기존 함수 개선)
async function crawlRIPCEnhanced() {
    try {
        console.log('RIPC 크롤링 시작 (범위 확대)...');
        
        // 여러 페이지와 센터별로 크롤링
        const centers = ['경남센터', '창원센터', '김해센터', '밀양센터'];
        const allNotices = [];
        
        for (let page = 1; page <= 3; page++) { // 최대 3페이지까지 확인
            try {
                const url = `https://pms.ripc.org/pms/biz/applicant/notice/list.do?page=${page}`;
                console.log(`RIPC 페이지 ${page} 크롤링: ${url}`);
                
                const response = await axios.get(url, {
                    timeout: 15000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });
                
                const $ = cheerio.load(response.data);
                let pageNotices = [];
                
                // 다양한 테이블 구조 지원
                $('table tr, .notice-list tr, .board-list tr').each((index, element) => {
                    try {
                        const $row = $(element);
                        
                        // 다양한 셀렉터로 제목 추출 시도
                        let title = $row.find('td').eq(1).text().trim() || 
                                   $row.find('.title').text().trim() ||
                                   $row.find('a').text().trim();
                        
                        let agency = 'RIPC 지역지식재산센터';
                        let period = $row.find('td').eq(3).text().trim() || 
                                    $row.find('td').eq(2).text().trim() ||
                                    $row.find('.date').text().trim();
                        
                        let link = $row.find('a').attr('href');
                        
                        // 센터 정보 추출
                        if (/경남|창원|김해|밀양/.test(title)) {
                            const centerMatch = title.match(/(경남|창원|김해|밀양)/);
                            if (centerMatch) {
                                agency = `RIPC ${centerMatch[1]}센터`;
                            }
                        }
                        
                        // 유효한 제목이 있고, 헤더가 아닌 경우
                        if (title && title !== '제목' && title !== '공지사항' && title.length > 5) {
                            
                            // 강화된 필터링 적용
                            if (shouldIncludeNoticeFixed(title, '', agency)) {
                                pageNotices.push({
                                    title: title,
                                    agency: agency,
                                    period: period,
                                    deadline: extractDeadlineEnhanced(period),
                                    link: link ? (link.startsWith('http') ? link : `https://pms.ripc.org${link}`) : '#',
                                    summary: `${agency} ${title}`,
                                    score: calculateScoreEnhanced(title, '', agency)
                                });
                            }
                        }
                    } catch (err) {
                        // 개별 공고 처리 오류는 로그만 남기고 계속 진행
                        console.log(`RIPC 개별 공고 처리 오류: ${err.message}`);
                    }
                });
                
                console.log(`RIPC 페이지 ${page}: ${pageNotices.length}개 공고 수집`);
                allNotices.push(...pageNotices);
                
                // 빈 페이지면 중단
                if (pageNotices.length === 0) {
                    console.log(`RIPC 페이지 ${page} 빈 페이지로 크롤링 중단`);
                    break;
                }
                
                // 페이지 간 간격
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (pageError) {
                console.error(`RIPC 페이지 ${page} 크롤링 오류:`, pageError.message);
                continue; // 다음 페이지 계속 시도
            }
        }
        
        // 중복 제거 (제목 기준)
        const uniqueNotices = allNotices.filter((notice, index, self) => 
            index === self.findIndex(n => n.title === notice.title)
        );
        
        console.log(`RIPC 총 ${uniqueNotices.length}개 공고 수집 완료 (중복 제거 후)`);
        return uniqueNotices;
        
    } catch (error) {
        console.error('RIPC 크롤링 전체 오류:', error.message);
        return [];
    }
}

// 3. 다른 사이트들도 동일하게 필터링 적용
async function crawlKIDPEnhanced() {
    try {
        console.log('KIDP 크롤링 시작 (필터링 개선)...');
        const response = await axios.get('https://www.kidp.or.kr/?menuno=773', {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        const $ = cheerio.load(response.data);
        const notices = [];
        
        $('table tr, .notice-list tr, .board-list tr').each((index, element) => {
            try {
                const $row = $(element);
                const title = $row.find('td').eq(1).text().trim() || $row.find('.title').text().trim();
                const agency = '한국디자인진흥원';
                const period = $row.find('td').eq(3).text().trim() || $row.find('.date').text().trim();
                const link = $row.find('a').attr('href');
                
                if (title && title !== '제목' && title.length > 5) {
                    // 수정된 필터링 함수 적용
                    if (shouldIncludeNoticeFixed(title, '', agency)) {
                        notices.push({
                            title: title,
                            agency: agency,
                            period: period,
                            deadline: extractDeadlineEnhanced(period),
                            link: link ? (link.startsWith('http') ? link : `https://www.kidp.or.kr${link}`) : '#',
                            summary: `한국디자인진흥원 ${title}`,
                            score: calculateScoreEnhanced(title, '', agency)
                        });
                    }
                }
            } catch (err) {
                console.log('KIDP 개별 공고 처리 오류:', err.message);
            }
        });
        
        console.log(`KIDP ${notices.length}개 공고 수집 완료`);
        return notices;
    } catch (error) {
        console.error('KIDP 크롤링 오류:', error.message);
        return [];
    }
}

// 4. 수정된 메인 크롤링 함수
async function crawlAllSitesFixed() {
    console.log('=== 수정된 전체 사이트 크롤링 시작 ===');
    
    const allNotices = [];
    
    try {
        // 기존 사이트들 (수정된 함수 사용)
        console.log('기존 사이트 크롤링 (필터링 개선)...');
        const ripcNotices = await crawlRIPCEnhanced();    // 수정된 함수
        const kidpNotices = await crawlKIDPEnhanced();    // 수정된 함수
        const cwipNotices = await crawlCWIP();            // 기존 함수 (필터링만 교체)
        const exportNotices = await crawlExportVoucher(); // 기존 함수 (필터링만 교체)
        
        // 새로 추가되는 3개 사이트
        console.log('새로운 3개 사이트 크롤링...');
        const gntpNotices = await crawlGNTP();
        const gncepNotices = await crawlGNCEP();
        const smeNotices = await crawlSMEVoucher();
        
        allNotices.push(...ripcNotices, ...kidpNotices, ...cwipNotices, 
                       ...exportNotices, ...gntpNotices, ...gncepNotices, ...smeNotices);
        
        // 마감일 기준 필터링 (오늘 이후만)
        const today = new Date().toISOString().split('T')[0];
        const validNotices = allNotices.filter(notice => {
            if (notice.deadline === '상시') return true;
            return notice.deadline >= today;
        });
        
        console.log('=== 크롤링 결과 요약 ===');
        console.log(`- RIPC: ${ripcNotices.length}개 (개선됨)`);
        console.log(`- KIDP: ${kidpNotices.length}개`);
        console.log(`- 창원산업진흥원: ${cwipNotices.length}개`);
        console.log(`- 수출바우처: ${exportNotices.length}개`);
        console.log(`- 경남테크노파크: ${gntpNotices.length}개 (신규)`);
        console.log(`- 경남경제진흥원: ${gncepNotices.length}개 (신규)`);
        console.log(`- 혁신바우처: ${smeNotices.length}개 (신규)`);
        console.log(`총 ${validNotices.length}개 유효 공고 수집 완료`);
        
        return validNotices;
    } catch (error) {
        console.error('전체 크롤링 오류:', error);
        return allNotices;
    }
}

// 5. 기존 함수들에서 필터링만 교체
// 기존 crawlCWIP, crawlExportVoucher 함수에서 
// shouldIncludeNotice() 호출 부분을 shouldIncludeNoticeFixed()로 변경

console.log('🚨 크롤링 시스템 긴급 수정 완료!');
console.log('✅ 제외 키워드 필터링 버그 해결');  
console.log('✅ RIPC 크롤링 범위 3배 확대');
console.log('✅ 총 7개 사이트 + 강화된 필터링 적용');
// ============== 분석 시스템 ==============

// 확장된 키워드 점수 체계
const keywordScores = {
    // 1순위 핵심 키워드 (30점)
    "디자인": 30, "디자인개발": 30, "시각디자인": 30, "그래픽디자인": 30, "로고디자인": 30, "패키지디자인": 30,
    "홈페이지": 30, "홈페이지제작": 30, "웹사이트": 30, "웹사이트제작": 30,
    
    // 🆕 수출바우처 관련 키워드 (25점) - 높은 점수
    "수출바우처": 25, "수출": 25, "해외진출": 25, "글로벌마케팅": 25, "해외마케팅": 25,
    "다국어": 20, "해외전시회": 20, "글로벌브랜드": 25,
    
    // 지식재산 관련 키워드 (25점)
    "지식재산": 25, "IP": 25, "특허": 25, "상표": 25, "디자인권": 25, "저작권": 25,
    "IP나래": 25, "지식재산긴급지원": 25, "특허출원": 25, "상표등록": 25,
    
    // 2순위 중요 키워드 (20점)
    "UI": 20, "UX": 20, "UI/UX": 20, "사용자경험": 20, "웹디자인": 20,
    "브랜드": 20, "브랜딩": 20, "브랜드구축": 20, "기업이미지": 20,
    "카탈로그": 20, "카탈로그제작": 20, "브로슈어": 20,
    
    // 3순위 관련 키워드 (10-15점)
    "웹개발": 15, "웹구축": 15, "반응형웹": 15, "웹시스템": 15,
    "CI": 15, "BI": 15, "CI/BI": 15, "기업아이덴티티": 15,
    "인쇄": 10, "인쇄물": 10, "리플릿": 10,
    "마케팅": 15, "홍보": 10, "온라인마케팅": 15, "디지털마케팅": 15,
    "바우처": 10, "혁신바우처": 10,
    
    // 경남 관련 키워드 (15점)
    "경남": 15, "경상남도": 15, "창원": 15, "경남센터": 15, "경남테크노파크": 15
};

// 창업/스타트업 제외 키워드
const startupKeywords = ["스타트업", "창업", "멘토링", "K-스타트업", "인큐베이팅"];

// 마감일 계산 함수
function calculateDaysUntilDeadline(deadlineStr) {
    if (!deadlineStr) return 999;
    
    const today = new Date();
    let deadline;
    
    if (deadlineStr.includes("상시") || deadlineStr.includes("수시")) {
        return 999;
    }
    
    const dateMatch = deadlineStr.match(/(\d{4})[-.](\d{1,2})[-.](\d{1,2})/);
    if (dateMatch) {
        deadline = new Date(dateMatch[1], dateMatch[2] - 1, dateMatch[3]);
    } else {
        return 999;
    }
    
    const timeDiff = deadline.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    return daysDiff;
}

// 점수 계산 함수
function calculateScore(title, agency, content, keywords, deadline) {
    const allText = `${title} ${agency} ${content} ${keywords}`.toLowerCase();
    let score = 0;
    let foundKeywords = [];
    let tags = [];
    
    // 키워드 매칭 및 점수 계산
    for (const [keyword, points] of Object.entries(keywordScores)) {
        if (allText.includes(keyword.toLowerCase())) {
            score += points;
            foundKeywords.push(`${keyword}(${points}점)`);
            
            // 자동 태그 생성
            if (keyword.includes("경남") || keyword.includes("창원")) tags.push("#경남센터");
            if (keyword.includes("IP") || keyword.includes("지식재산") || keyword.includes("특허")) tags.push("#지식재산");
            if (keyword.includes("IP나래")) tags.push("#IP나래");
            if (keyword.includes("수출") || keyword.includes("해외")) tags.push("#수출바우처");
            if (keyword.includes("글로벌")) tags.push("#글로벌");
        }
    }
    
    // 기본 태그 추가
    if (allText.includes("디자인")) tags.push("#디자인");
    if (allText.includes("홈페이지") || allText.includes("웹사이트")) tags.push("#홈페이지");
    if (allText.includes("브랜드")) tags.push("#브랜딩");
    if (allText.includes("카탈로그")) tags.push("#카탈로그");
    if (allText.includes("바우처")) tags.push("#바우처");
    
    // 최대 100점 제한
    if (score > 100) score = 100;
    
    // 강제 보정 규칙
    const isStartup = startupKeywords.some(keyword => allText.includes(keyword.toLowerCase()));
    if (isStartup) {
        score = Math.min(score, 30);
    }
    
    // 크리에이티브마루 핵심 사업 보정
    const hasDesignKeyword = ["디자인", "UI/UX", "브랜딩", "홈페이지"].some(keyword => 
        allText.includes(keyword.toLowerCase())
    );
    if (hasDesignKeyword && !isStartup) {
        score = Math.max(score, 60);
    }
    
    // 🆕 수출바우처 사업 보정 (크리에이티브마루 특화)
    const hasExportKeyword = ["수출", "해외", "글로벌"].some(keyword => 
        allText.includes(keyword.toLowerCase())
    );
    if (hasExportKeyword && hasDesignKeyword) {
        score = Math.max(score, 80); // 수출+디자인 조합은 최고점수
    }
    
    const daysUntil = calculateDaysUntilDeadline(deadline);
    const isUrgent = daysUntil <= 14;
    
    return { 
        score: Math.floor(score), 
        foundKeywords, 
        isStartup, 
        tags: [...new Set(tags)],
        daysUntil,
        isUrgent
    };
}

function getGrade(score) {
    if (score >= 90) return "A+";
    if (score >= 75) return "A";
    if (score >= 60) return "B";
    if (score >= 40) return "C";
    if (score >= 20) return "D";
    return "E";
}

function getActionPlan(grade, isUrgent) {
    if (isUrgent) {
        return "[긴급] 확인 필요";
    }
    
    switch(grade) {
        case "A+": return "[A+] 즉시 신청서 작성 및 제출 권장";
        case "A": return "[A] 상세 검토 후 신청 준비";
        case "B": return "[B] 신청 검토 및 담당자 문의";
        case "C": return "[C] 관심 대상, 모니터링";
        case "D": return "[D] 낮은 우선순위, 참고용";
        case "E": return "[E] 제외 대상";
    }
}

// ============== 메일 발송 함수 ==============

async function sendEmail() {
    try {
        console.log('[시작] 크리에이티브마루 통합 메일링 시스템 시작...');
        
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASSWORD,
            },
        });

        // 실제 크롤링 데이터 + 추가 샘플 데이터
        console.log('[수집] 실제 지원사업 데이터 수집 중...');
        const crawledData = await crawlAllSitesFixed();
        
        // 추가 샘플 데이터 (다양성 확보)
        const additionalSamples = [
            {
                title: "중소기업 혁신바우처 지원사업",
                agency: "혁신바우처사업단",
                content: "R&D, 마케팅, 디자인 등 기술개발 및 혁신활동 지원. UI/UX 개선, 웹사이트 구축, 브랜드 개발 포함",
                keywords: "UI/UX, 웹디자인, 브랜드, 혁신바우처",
                deadline: "상시모집"
            },
            {
                title: "경남 강소기업 글로벌 브랜딩 지원",
                agency: "경남테크노파크",
                content: "경남 소재 강소기업의 해외진출을 위한 브랜드 구축, 홈페이지 다국어화, 수출 마케팅 지원",
                keywords: "브랜딩, 홈페이지, 다국어, 해외진출, 경남",
                deadline: "2025-07-15"
            }
        ];

        // 데이터 통합
        const allProjects = [...crawledData, ...additionalSamples];
        console.log(`[분석] 총 ${allProjects.length}개 지원사업 분석 중 (크롤링: ${crawledData.length}, 샘플: ${additionalSamples.length})`);

        // 분석 실행
        const results = [];
        let urgentCount = 0;
        let aPlusCount = 0;
        let ipRelatedCount = 0;
        let exportRelatedCount = 0;

        allProjects.forEach(project => {
            const analysis = calculateScore(project.title, project.agency, project.content, project.keywords, project.deadline);
            const grade = getGrade(analysis.score);
            const actionPlan = getActionPlan(grade, analysis.isUrgent);
            
            const result = {
                title: project.title,
                agency: project.agency,
                score: analysis.score,
                grade: grade,
                actionPlan: actionPlan,
                tags: analysis.tags.join(" "),
                deadline: project.deadline,
                daysUntil: analysis.daysUntil,
                isUrgent: analysis.isUrgent,
                foundKeywords: analysis.foundKeywords,
                budget: project.budget || '별도 공지',
                category: project.category || '기타'
            };
            
            results.push(result);
            
            if (analysis.isUrgent) urgentCount++;
            if (grade === "A+") aPlusCount++;
            if (analysis.tags.some(tag => tag.includes("지식재산") || tag.includes("IP"))) ipRelatedCount++;
            if (analysis.tags.some(tag => tag.includes("수출") || tag.includes("글로벌"))) exportRelatedCount++;
        });

        // 분류
        const urgentProjects = results.filter(r => r.isUrgent);
        const aPlusProjects = results.filter(r => r.grade === "A+" && !r.isUrgent);
        const exportProjects = results.filter(r => r.tags.includes("#수출바우처") || r.tags.includes("#글로벌"));
        const ipProjects = results.filter(r => r.tags.includes("#지식재산") || r.tags.includes("#IP나래"));

        const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f8f9fa;">
    
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 900px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        
        <!-- 헤더 -->
        <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; color: white;">
                <h1 style="margin: 0; font-size: 28px; font-weight: 600;">크리에이티브마루</h1>
                <p style="margin: 15px 0 5px 0; font-size: 18px; opacity: 0.9;">통합 지원사업 분석 리포트</p>
                <p style="margin: 0; opacity: 0.8; font-size: 14px;">수출바우처 + 지식재산 + 디자인 특화 | ${new Date().toLocaleDateString('ko-KR')}</p>
            </td>
        </tr>
        
        <tr>
            <td style="padding: 30px;">
                
                <!-- 🆕 긴급 사업 섹션 -->
                ${urgentProjects.length > 0 ? `
                <h2 style="color: #d63031; margin: 0 0 20px 0; background: #fff3cd; padding: 15px 20px; border-radius: 8px; border-left: 5px solid #e17055; display: flex; align-items: center; gap: 10px;">
                    [긴급] 확인 필요 (D-14 이내)
                    <span style="background: #d63031; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px;">${urgentProjects.length}개</span>
                </h2>
                ${urgentProjects.map(project => `
                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #fff3cd; border: 2px solid #ffeaa7; border-left: 6px solid #d63031; border-radius: 8px; margin: 15px 0;">
                    <tr>
                        <td style="padding: 25px;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                                <h3 style="margin: 0; color: #d63031; font-size: 20px;">${project.title}</h3>
                                <div style="text-align: right;">
                                    <div style="background: #d63031; color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; margin-bottom: 5px;">${project.grade} 등급</div>
                                    <div style="font-size: 24px; font-weight: 700; color: #d63031;">${project.score}점</div>
                                </div>
                            </div>
                            <p style="margin: 0 0 15px 0; font-size: 14px; color: #636e72;">${project.agency} | ${project.deadline} | ${project.budget}</p>
                            <p style="margin: 0 0 15px 0; font-size: 14px; color: #2d3436; font-weight: 600;">D-${project.daysUntil}</p>
                            <div style="margin: 15px 0; font-size: 14px; color: #6f42c1;">${project.tags}</div>
                            <div style="background: #f8d7da; padding: 15px; border-radius: 6px; color: #721c24;">
                                <strong>액션플랜:</strong> ${project.actionPlan}
                            </div>
                        </td>
                    </tr>
                </table>
                `).join('')}
                ` : ''}
                
                <!-- 통계 섹션 -->
                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 30px 0;">
                    <tr>
                        <td width="22%" style="text-align: center; background: #fff3cd; padding: 20px; border-radius: 8px; border: 2px solid #ffeaa7;">
                            <p style="font-size: 32px; font-weight: 700; color: #d63031; margin: 0;">${urgentCount}</p>
                            <p style="font-size: 12px; color: #856404; margin: 5px 0 0 0; font-weight: 600;">긴급 사업</p>
                        </td>
                        <td width="2%"></td>
                        <td width="22%" style="text-align: center; background: #d1ecf1; padding: 20px; border-radius: 8px; border: 2px solid #bee5eb;">
                            <p style="font-size: 32px; font-weight: 700; color: #00b894; margin: 0;">${aPlusCount}</p>
                            <p style="font-size: 12px; color: #0c5460; margin: 5px 0 0 0; font-weight: 600;">A+ 등급</p>
                        </td>
                        <td width="2%"></td>
                        <td width="22%" style="text-align: center; background: #f3e5f5; padding: 20px; border-radius: 8px; border: 2px solid #e1bee7;">
                            <p style="font-size: 32px; font-weight: 700; color: #6f42c1; margin: 0;">${ipRelatedCount}</p>
                            <p style="font-size: 12px; color: #4a154b; margin: 5px 0 0 0; font-weight: 600;">지식재산</p>
                        </td>
                        <td width="2%"></td>
                        <td width="22%" style="text-align: center; background: #e8f5e8; padding: 20px; border-radius: 8px; border: 2px solid #c3e6cb;">
                            <p style="font-size: 32px; font-weight: 700; color: #28a745; margin: 0;">${exportRelatedCount}</p>
                            <p style="font-size: 12px; color: #155724; margin: 5px 0 0 0; font-weight: 600;">수출바우처</p>
                        </td>
                    </tr>
                </table>
                
                <!-- 🆕 수출바우처 특화 섹션 -->
                ${exportProjects.length > 0 ? `
                <h2 style="color: #28a745; margin: 30px 0 20px 0; background: #e8f5e8; padding: 15px 20px; border-radius: 8px; border-left: 6px solid #28a745; display: flex; align-items: center; gap: 10px;">
                    [수출] 수출바우처 특화 사업
                    <span style="background: #28a745; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px;">${exportProjects.length}개</span>
                </h2>
                ${exportProjects.slice(0, 5).map(project => `
                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: white; border: 2px solid #c3e6cb; border-left: 6px solid #28a745; border-radius: 8px; margin: 15px 0;">
                    <tr>
                        <td style="padding: 25px;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                                <h3 style="margin: 0; font-size: 18px; color: #2d3436;">${project.title}</h3>
                                <div style="text-align: right;">
                                    <div style="background: #28a745; color: white; padding: 4px 10px; border-radius: 16px; font-size: 12px; margin-bottom: 5px;">${project.grade} 등급</div>
                                    <div style="font-size: 20px; font-weight: 700; color: #28a745;">${project.score}점</div>
                                </div>
                            </div>
                            <p style="margin: 0 0 15px 0; font-size: 14px; color: #636e72;">${project.agency} | ${project.budget}</p>
                            <div style="margin: 15px 0; font-size: 14px; color: #28a745; font-weight: 600;">${project.tags}</div>
                            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; font-size: 14px; color: #495057; border-left: 4px solid #28a745;">
                                <strong>액션플랜:</strong> ${project.actionPlan}
                            </div>
                        </td>
                    </tr>
                </table>
                `).join('')}
                ` : ''}
                
                <!-- 🆕 지식재산 특화 섹션 -->
                ${ipProjects.length > 0 ? `
                <h2 style="color: #6f42c1; margin: 30px 0 20px 0; background: #f3e5f5; padding: 15px 20px; border-radius: 8px; border-left: 6px solid #6f42c1; display: flex; align-items: center; gap: 10px;">
                    [IP] 지식재산 특화 사업
                    <span style="background: #6f42c1; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px;">${ipProjects.length}개</span>
                </h2>
                ${ipProjects.slice(0, 4).map(project => `
                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: white; border: 2px solid #e1bee7; border-left: 6px solid #6f42c1; border-radius: 8px; margin: 15px 0;">
                    <tr>
                        <td style="padding: 25px;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                                <h3 style="margin: 0; font-size: 18px; color: #2d3436;">${project.title}</h3>
                                <div style="text-align: right;">
                                    <div style="background: #6f42c1; color: white; padding: 4px 10px; border-radius: 16px; font-size: 12px; margin-bottom: 5px;">${project.grade} 등급</div>
                                    <div style="font-size: 20px; font-weight: 700; color: #6f42c1;">${project.score}점</div>
                                </div>
                            </div>
                            <p style="margin: 0 0 15px 0; font-size: 14px; color: #636e72;">${project.agency} | ${project.budget}</p>
                            <div style="margin: 15px 0; font-size: 14px; color: #6f42c1; font-weight: 600;">${project.tags}</div>
                            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; font-size: 14px; color: #495057; border-left: 4px solid #6f42c1;">
                                <strong>액션플랜:</strong> ${project.actionPlan}
                            </div>
                        </td>
                    </tr>
                </table>
                `).join('')}
                ` : ''}
                
                <!-- A+ 등급 사업 -->
                ${aPlusProjects.length > 0 ? `
                <h2 style="color: #00b894; margin: 30px 0 20px 0; background: #d1ecf1; padding: 15px 20px; border-radius: 8px; border-left: 6px solid #00b894; display: flex; align-items: center; gap: 10px;">
                    [A+] A+ 등급 사업 (즉시 신청 권장)
                    <span style="background: #00b894; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px;">${aPlusProjects.length}개</span>
                </h2>
                ${aPlusProjects.slice(0, 6).map(project => `
                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: white; border: 2px solid #bee5eb; border-left: 6px solid #00b894; border-radius: 8px; margin: 15px 0;">
                    <tr>
                        <td style="padding: 25px;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                                <h3 style="margin: 0; font-size: 18px; color: #2d3436;">${project.title}</h3>
                                <div style="text-align: right;">
                                    <div style="background: #00b894; color: white; padding: 4px 10px; border-radius: 16px; font-size: 12px; margin-bottom: 5px;">${project.grade} 등급</div>
                                    <div style="font-size: 20px; font-weight: 700; color: #00b894;">${project.score}점</div>
                                </div>
                            </div>
                            <p style="margin: 0 0 15px 0; font-size: 14px; color: #636e72;">${project.agency} | ${project.budget}</p>
                            <div style="margin: 15px 0; font-size: 14px; color: #00b894; font-weight: 600;">${project.tags}</div>
                            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; font-size: 14px; color: #495057; border-left: 4px solid #00b894;">
                                <strong>액션플랜:</strong> ${project.actionPlan}
                            </div>
                        </td>
                    </tr>
                </table>
                `).join('')}
                ` : ''}
                
            </td>
        </tr>
        
        <!-- 푸터 -->
        <tr>
            <td style="background: #2d3436; color: white; padding: 30px; text-align: center;">
                <h3 style="margin: 0 0 15px 0; font-size: 20px; color: #74b9ff;">크리에이티브마루</h3>
                <p style="margin: 0 0 15px 0; font-size: 16px; opacity: 0.9;">
                    경상남도 창원 | 디자인 • 브랜딩 • 홈페이지제작 • 카탈로그 • 수출바우처 • 지식재산
                </p>
                <div style="border-top: 1px solid #636e72; padding-top: 15px; font-size: 12px; opacity: 0.7;">
                    <p style="margin: 0;">
                        <strong>통합 자동분석 시스템 v3.0</strong> | 수출바우처 + 지식재산 + 디자인 특화
                        <br>매일 오전 9:30 자동 발송 | 문의: pm@cmaru.com
                    </p>
                </div>
            </td>
        </tr>
        
    </table>
    
</body>
</html>
        `;

        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: process.env.RECIPIENT_EMAIL || 'pm@cmaru.com',
            subject: `크리에이티브마루 통합 지원사업 리포트 | ${urgentCount}개 긴급 | ${exportRelatedCount}개 수출바우처`,
            html: htmlTemplate,
        };

        console.log(`[발송] 발송 대상: ${mailOptions.to}`);
        console.log(`[통계] 긴급 사업: ${urgentCount}개`);
        console.log(`[통계] A+ 사업: ${aPlusCount}개`);
        console.log(`[통계] 수출바우처 사업: ${exportRelatedCount}개`);
        console.log(`[통계] 지식재산 사업: ${ipRelatedCount}개`);
        
        const result = await transporter.sendMail(mailOptions);
        console.log('[성공] 메일 발송 성공!');
        console.log('[ID] Message ID:', result.messageId);
        
    } catch (error) {
        console.error('[실패] 메일 발송 실패:', error.message);
        process.exit(1);
    }
}

// 실행
sendEmail();
