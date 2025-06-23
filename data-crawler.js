// ===== MAILNARA v6.0 실제 크롤링 시스템 =====
// 크리에이티브마루 운영용 - 샘플 데이터 완전 제거
// data-crawler.js

const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');

// ===== 1. 개선된 필터링 로직 (덜 엄격하게) =====
function shouldIncludeNotice(title, content, agency) {
    const titleLower = title.toLowerCase();
    const contentLower = content.toLowerCase();
    const text = `${titleLower} ${contentLower}`;
    
    // ❌ 강력한 제외 키워드만 (필수 차단)
    const hardExcludeKeywords = [
        'ip나래', 'ip 나래', '나래',
        '멘토링', '창업경진대회', '경진대회',
        '스마트팩토리', '전시참가'
    ];
    
    // 강력 제외 체크
    for (const keyword of hardExcludeKeywords) {
        if (titleLower.includes(keyword)) {
            return { include: false, reason: `강력제외: ${keyword}` };
        }
    }
    
    // ✅ 포함 키워드 (범위 확대)
    const includeKeywords = [
        // 핵심 사업 키워드
        '디자인', '브랜딩', '브랜드', '리뉴얼', '홈페이지', '카탈로그', '마케팅',
        'ui/ux', 'uiux', 'gui', '웹사이트', '웹 사이트', '홍보물', '영상',
        '시각디자인', '시각 디자인', 'bi', 'ci', '패키지디자인', '패키지 디자인',
        
        // 마케팅 확장
        '광고', '프로모션', '홍보전략', '브랜드마케팅', '디지털마케팅',
        '온라인마케팅', '해외마케팅', '수출마케팅', '글로벌마케팅',
        
        // 사업 유형
        '바우처', 'voucher', '지원사업', '지원', '육성', '개발지원',
        '수출', '해외', '글로벌', '국제', '혁신', '제조혁신',
        
        // 기관 관련
        '경남', '창원', '김해', '밀양', '부산', '울산'
    ];
    
    // 포함 키워드 체크
    for (const keyword of includeKeywords) {
        if (text.includes(keyword)) {
            return { include: true, reason: `포함키워드: ${keyword}` };
        }
    }
    
    // 기관별 특별 조건 (관대하게)
    if (agency.includes('바우처') || agency.includes('KOTRA') || agency.includes('디자인')) {
        return { include: true, reason: '기관 특별조건' };
    }
    
    return { include: false, reason: '포함키워드 없음' };
}

// ===== 2. 개선된 점수 산정 로직 =====
function calculateEnhancedScore(title, content, agency) {
    let score = 0;
    let scoreDetails = [];
    
    const text = `${title} ${content}`.toLowerCase();
    
    // 점수 기준표 (JSON으로 분리 가능)
    const scoreRules = {
        // 핵심 사업 영역 (높은 점수)
        '홈페이지|웹사이트|웹개발': 35,
        '카탈로그|브로슈어|인쇄물': 30,
        '브랜딩|브랜드|ci|bi|로고': 35,
        '디자인|시각디자인|그래픽|패키지디자인': 30,
        'ui/ux|uiux|사용자경험': 25,
        '마케팅|홍보|광고|프로모션': 25,
        
        // 사업 유형별 가산점
        '수출|해외|글로벌|국제': 20,
        '바우처|voucher': 15,
        '혁신|제조혁신|디지털혁신': 20,
        '중소기업|스타트업': 10,
        
        // 지역 가산점
        '경남|창원|김해|밀양': 15,
        '부산|울산': 10
    };
    
    // 점수 계산
    for (const [pattern, points] of Object.entries(scoreRules)) {
        const regex = new RegExp(pattern, 'i');
        if (regex.test(text)) {
            score += points;
            scoreDetails.push(`${pattern}: +${points}점`);
        }
    }
    
    // 기관별 보정
    if (agency.includes('KOTRA') || agency.includes('수출바우처')) {
        score += 10;
        scoreDetails.push('수출기관 보정: +10점');
    }
    
    if (agency.includes('디자인진흥원')) {
        score += 15;
        scoreDetails.push('디자인 전문기관 보정: +15점');
    }
    
    // 최대 100점 제한
    score = Math.min(score, 100);
    
    // 등급 결정
    let grade;
    if (score >= 85) grade = 'A+';
    else if (score >= 75) grade = 'A';
    else if (score >= 65) grade = 'B+';
    else if (score >= 55) grade = 'B';
    else if (score >= 45) grade = 'C+';
    else grade = 'C';
    
    return { score, grade, scoreDetails };
}

// ===== 3. 실제 사이트 크롤링 함수들 =====

/**
 * RIPC 지역지식재산센터 크롤링
 */
async function crawlRIPC() {
    try {
        console.log('[실제크롤링] RIPC 지역지식재산센터...');
        
        const notices = [];
        
        // 여러 페이지 크롤링
        for (let page = 1; page <= 3; page++) {
            const url = `https://pms.ripc.org/pms/biz/applicant/notice/list.do?page=${page}`;
            
            try {
                const response = await axios.get(url, {
                    timeout: 10000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });
                
                const $ = cheerio.load(response.data);
                
                $('table tr').each((index, element) => {
                    try {
                        const $row = $(element);
                        const title = $row.find('td').eq(1).text().trim();
                        const agency = 'RIPC 지역지식재산센터';
                        const period = $row.find('td').eq(3).text().trim();
                        const link = $row.find('a').attr('href');
                        
                        if (title && title !== '제목' && title.length > 5) {
                            const filterResult = shouldIncludeNotice(title, '', agency);
                            
                            const notice = {
                                title: title,
                                agency: agency,
                                period: period,
                                deadline: extractDeadline(period),
                                link: link ? (link.startsWith('http') ? link : `https://pms.ripc.org${link}`) : '#',
                                summary: `RIPC ${title}`,
                                source: 'RIPC_실제크롤링',
                                crawledAt: new Date().toISOString(),
                                filterResult: filterResult
                            };
                            
                            notices.push(notice);
                        }
                    } catch (err) {
                        console.log(`RIPC 개별 공고 처리 오류: ${err.message}`);
                    }
                });
                
                console.log(`RIPC 페이지 ${page}: ${notices.length}개 공고 수집`);
                
                // 페이지 간 간격
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (pageError) {
                console.error(`RIPC 페이지 ${page} 오류: ${pageError.message}`);
                continue;
            }
        }
        
        console.log(`[완료] RIPC: ${notices.length}개 공고 수집`);
        return notices;
        
    } catch (error) {
        console.error('[실패] RIPC 크롤링 오류:', error.message);
        return [];
    }
}

/**
 * KIDP 한국디자인진흥원 크롤링
 */
async function crawlKIDP() {
    try {
        console.log('[실제크롤링] 한국디자인진흥원...');
        
        const response = await axios.get('https://kidp.or.kr/?menuno=1123', {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        const $ = cheerio.load(response.data);
        const notices = [];
        
        $('.board-list tr, table tr').each((index, element) => {
            try {
                const $row = $(element);
                const title = $row.find('td').eq(1).text().trim() || $row.find('.title').text().trim();
                const agency = '한국디자인진흥원';
                const period = $row.find('td').eq(3).text().trim() || $row.find('.date').text().trim();
                const link = $row.find('a').attr('href');
                
                if (title && title !== '제목' && title.length > 5) {
                    const filterResult = shouldIncludeNotice(title, '', agency);
                    
                    const notice = {
                        title: title,
                        agency: agency,
                        period: period,
                        deadline: extractDeadline(period),
                        link: link ? (link.startsWith('http') ? link : `https://www.kidp.or.kr${link}`) : '#',
                        summary: `KIDP ${title}`,
                        source: 'KIDP_실제크롤링',
                        crawledAt: new Date().toISOString(),
                        filterResult: filterResult
                    };
                    
                    notices.push(notice);
                }
            } catch (err) {
                console.log(`KIDP 개별 공고 처리 오류: ${err.message}`);
            }
        });
        
        console.log(`[완료] KIDP: ${notices.length}개 공고 수집`);
        return notices;
        
    } catch (error) {
        console.error('[실패] KIDP 크롤링 오류:', error.message);
        return [];
    }
}

/**
 * KOTRA 수출바우처 크롤링
 */
async function crawlKOTRA() {
    try {
        console.log('[실제크롤링] KOTRA 수출바우처...');
        
        const response = await axios.get('https://www.kotra.or.kr/subList/20000020753', {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        const $ = cheerio.load(response.data);
        const notices = [];
        
        $('.board-list tr, table tr, .program-list .item').each((index, element) => {
            try {
                const $row = $(element);
                const title = $row.find('.title').text().trim() || 
                             $row.find('td').eq(1).text().trim() ||
                             $row.find('h3').text().trim();
                const agency = 'KOTRA';
                const period = $row.find('.date').text().trim() || 
                              $row.find('td').eq(3).text().trim();
                const link = $row.find('a').attr('href');
                
                if (title && title.length > 5) {
                    const filterResult = shouldIncludeNotice(title, '', agency);
                    
                    const notice = {
                        title: title,
                        agency: agency,
                        period: period || '상시모집',
                        deadline: extractDeadline(period) || '상시',
                        link: link ? (link.startsWith('http') ? link : `https://www.kotra.or.kr${link}`) : '#',
                        summary: `KOTRA ${title}`,
                        source: 'KOTRA_실제크롤링',
                        crawledAt: new Date().toISOString(),
                        filterResult: filterResult
                    };
                    
                    notices.push(notice);
                }
            } catch (err) {
                console.log(`KOTRA 개별 공고 처리 오류: ${err.message}`);
            }
        });
        
        console.log(`[완료] KOTRA: ${notices.length}개 공고 수집`);
        return notices;
        
    } catch (error) {
        console.error('[실패] KOTRA 크롤링 오류:', error.message);
        return [];
    }
}

/**
 * 창원산업진흥원 크롤링
 */
async function crawlCWIP() {
    try {
        console.log('[실제크롤링] 창원산업진흥원...');
        
        const response = await axios.get('https://www.cwip.or.kr/', {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        const $ = cheerio.load(response.data);
        const notices = [];
        
        $('.notice-list tr, .board-list tr, table tr').each((index, element) => {
            try {
                const $row = $(element);
                const title = $row.find('td').eq(1).text().trim() || $row.find('.title').text().trim();
                const agency = '창원산업진흥원';
                const period = $row.find('td').eq(3).text().trim() || $row.find('.date').text().trim();
                const link = $row.find('a').attr('href');
                
                if (title && title !== '제목' && title.length > 5) {
                    const filterResult = shouldIncludeNotice(title, '', agency);
                    
                    const notice = {
                        title: title,
                        agency: agency,
                        period: period,
                        deadline: extractDeadline(period),
                        link: link ? (link.startsWith('http') ? link : `https://www.cwip.or.kr${link}`) : '#',
                        summary: `창원산업진흥원 ${title}`,
                        source: 'CWIP_실제크롤링',
                        crawledAt: new Date().toISOString(),
                        filterResult: filterResult
                    };
                    
                    notices.push(notice);
                }
            } catch (err) {
                console.log(`창원산업진흥원 개별 공고 처리 오류: ${err.message}`);
            }
        });
        
        console.log(`[완료] 창원산업진흥원: ${notices.length}개 공고 수집`);
        return notices;
        
    } catch (error) {
        console.error('[실패] 창원산업진흥원 크롤링 오류:', error.message);
        return [];
    }
}

// ===== 4. 통합 크롤링 및 JSON 생성 =====
async function crawlAllSitesAndSaveJSON() {
    console.log('=== MAILNARA v6.0 실제 크롤링 시작 ===');
    
    const startTime = new Date();
    const results = {
        metadata: {
            version: 'v6.0',
            crawledAt: startTime.toISOString(),
            dataSource: '실제크롤링',
            crawlStatus: {}
        },
        notices: {
            included: [],
            excluded: []
        },
        statistics: {}
    };
    
    try {
        // 실제 크롤링 실행
        const [ripcNotices, kidpNotices, kotraNotices, cwipNotices] = await Promise.allSettled([
            crawlRIPC(),
            crawlKIDP(), 
            crawlKOTRA(),
            crawlCWIP()
        ]);
        
        // 결과 통합
        const allNotices = [];
        
        // 크롤링 상태 기록
        results.metadata.crawlStatus = {
            RIPC: ripcNotices.status === 'fulfilled' ? `성공 ${ripcNotices.value.length}개` : `실패: ${ripcNotices.reason}`,
            KIDP: kidpNotices.status === 'fulfilled' ? `성공 ${kidpNotices.value.length}개` : `실패: ${kidpNotices.reason}`,
            KOTRA: kotraNotices.status === 'fulfilled' ? `성공 ${kotraNotices.value.length}개` : `실패: ${kotraNotices.reason}`,
            CWIP: cwipNotices.status === 'fulfilled' ? `성공 ${cwipNotices.value.length}개` : `실패: ${cwipNotices.reason}`
        };
        
        // 성공한 크롤링 결과만 합치기
        if (ripcNotices.status === 'fulfilled') allNotices.push(...ripcNotices.value);
        if (kidpNotices.status === 'fulfilled') allNotices.push(...kidpNotices.value);
        if (kotraNotices.status === 'fulfilled') allNotices.push(...kotraNotices.value);
        if (cwipNotices.status === 'fulfilled') allNotices.push(...cwipNotices.value);
        
        // 필터링 및 점수 계산
        for (const notice of allNotices) {
            const scoreResult = calculateEnhancedScore(notice.title, notice.summary, notice.agency);
            notice.score = scoreResult.score;
            notice.grade = scoreResult.grade;
            notice.scoreDetails = scoreResult.scoreDetails;
            
            if (notice.filterResult.include) {
                results.notices.included.push(notice);
            } else {
                results.notices.excluded.push(notice);
            }
        }
        
        // 통계 생성
        results.statistics = {
            totalCrawled: allNotices.length,
            includedCount: results.notices.included.length,
            excludedCount: results.notices.excluded.length,
            averageScore: results.notices.included.length > 0 ? 
                Math.round(results.notices.included.reduce((sum, n) => sum + n.score, 0) / results.notices.included.length) : 0,
            gradeDistribution: {
                'A+': results.notices.included.filter(n => n.grade === 'A+').length,
                'A': results.notices.included.filter(n => n.grade === 'A').length,
                'B+': results.notices.included.filter(n => n.grade === 'B+').length,
                'B': results.notices.included.filter(n => n.grade === 'B').length,
                'C+': results.notices.included.filter(n => n.grade === 'C+').length,
                'C': results.notices.included.filter(n => n.grade === 'C').length
            }
        };
        
        // JSON 파일 저장
        const jsonData = JSON.stringify(results, null, 2);
        fs.writeFileSync('mailnara-data.json', jsonData, 'utf8');
        
        const endTime = new Date();
        const duration = (endTime - startTime) / 1000;
        
        console.log('=== 크롤링 완료 ===');
        console.log(`소요 시간: ${duration}초`);
        console.log(`총 수집: ${allNotices.length}개`);
        console.log(`포함: ${results.notices.included.length}개`);
        console.log(`제외: ${results.notices.excluded.length}개`);
        console.log(`평균 점수: ${results.statistics.averageScore}점`);
        console.log('JSON 파일 저장: mailnara-data.json');
        
        return results;
        
    } catch (error) {
        console.error('크롤링 전체 오류:', error);
        results.metadata.error = error.message;
        
        // 에러 상황에서도 JSON 저장 (디버깅용)
        fs.writeFileSync('mailnara-data-error.json', JSON.stringify(results, null, 2), 'utf8');
        
        throw error;
    }
}

// ===== 5. 유틸리티 함수 =====
function extractDeadline(periodText) {
    if (!periodText) return '상시';
    
    if (/상시|수시|연중/.test(periodText)) {
        return '상시';
    }
    
    const datePattern = /(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})/;
    const match = periodText.match(datePattern);
    
    if (match) {
        const [, year, month, day] = match;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    if (periodText.includes('~')) {
        const parts = periodText.split('~');
        if (parts.length > 1) {
            return extractDeadline(parts[1].trim());
        }
    }
    
    return periodText;
}

// ===== 실행 =====
if (require.main === module) {
    crawlAllSitesAndSaveJSON()
        .then(() => {
            console.log('✅ 데이터 수집 및 JSON 생성 완료');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ 실행 실패:', error);
            process.exit(1);
        });
}

module.exports = {
    crawlAllSitesAndSaveJSON,
    shouldIncludeNotice,
    calculateEnhancedScore
};
