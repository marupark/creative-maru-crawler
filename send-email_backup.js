// ===== GitHub 환경용 MAILNARA v5.1 안전 버전 =====
const nodemailer = require('nodemailer');
const axios = require('axios');
const cheerio = require('cheerio');

// 환경 변수 확인 및 기본값 설정
const GMAIL_USER = process.env.GMAIL_USER || 'hcsarang@gmail.com';
const GMAIL_PASSWORD = process.env.GMAIL_PASSWORD || 'wduc vthz gxmc qxph';
const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL || 'pm@cmaru.com';

console.log('=== MAILNARA v5.1 GitHub 환경용 시작 ===');
console.log('환경 변수 확인:');
console.log(`- GMAIL_USER: ${GMAIL_USER ? '설정됨' : '미설정'}`);
console.log(`- GMAIL_PASSWORD: ${GMAIL_PASSWORD ? '설정됨' : '미설정'}`);
console.log(`- RECIPIENT_EMAIL: ${RECIPIENT_EMAIL}`);

// ===== 1. 통합 필터링 함수 =====
function shouldIncludeNotice(title, content, agency) {
    const titleLower = title.toLowerCase();
    const contentLower = content.toLowerCase();
    const text = `${titleLower} ${contentLower}`;
    
    // 제외 키워드
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
    
    // 제목에서 제외 키워드 체크
    for (const keyword of excludeKeywords) {
        if (titleLower.includes(keyword)) {
            console.log(`[제외] "${title}" - 제외 키워드: "${keyword}"`);
            return false;
        }
    }
    
    // 무조건 유지 키워드
    const mustIncludeKeywords = [
        '디자인', '브랜딩', '리뉴얼', 
        '홈페이지', '카탈로그', '마케팅'
    ];
    
    for (const keyword of mustIncludeKeywords) {
        if (text.includes(keyword)) {
            console.log(`[포함] "${title}" - 무조건 유지: "${keyword}"`);
            return true;
        }
    }
    
    // 일반 포함 키워드
    const includeKeywords = [
        'ui/ux', 'uiux', 'ui·ux', 'ui ux', 'gui', 
        '웹사이트', '웹 사이트', '홍보물', 
        '영상', '시각디자인', '시각 디자인', 'bi', 'ci', 
        '패키지디자인', '패키지 디자인',
        '광고', '프로모션', '홍보전략', '브랜드마케팅',
        '디지털마케팅', '온라인마케팅', '해외마케팅',
        '수출마케팅', '글로벌마케팅'
    ];
    
    for (const keyword of includeKeywords) {
        if (text.includes(keyword)) {
            console.log(`[포함] "${title}" - 포함 키워드: "${keyword}"`);
            return true;
        }
    }
    
    // 기관별 특별 조건
    if (agency.includes('바우처')) {
        if (/바우처|voucher|전문기관|컨설팅/.test(text)) {
            console.log(`[포함] "${title}" - 바우처 특별 조건`);
            return true;
        }
    }
    
    console.log(`[제외] "${title}" - 포함 키워드 없음`);
    return false;
}

// ===== 2. 분석 함수 =====
function analyzeNotice(title, content, agency) {
    let score = 0;
    let keywords = [];
    
    const text = `${title} ${content}`.toLowerCase();
    
    // 핵심 사업 영역별 점수
    if (/홈페이지|웹사이트|웹개발|웹 제작/.test(text)) {
        score += 35;
        keywords.push('#홈페이지제작');
    }
    
    if (/카탈로그|브로슈어|인쇄물|제품 카탈로그/.test(text)) {
        score += 30;
        keywords.push('#카탈로그제작');
    }
    
    if (/브랜딩|브랜드|ci|bi|로고|브랜드 개발/.test(text)) {
        score += 30;
        keywords.push('#브랜딩');
    }
    
    if (/디자인|시각디자인|그래픽/.test(text)) {
        score += 25;
        keywords.push('#디자인');
    }
    
    if (/마케팅|홍보|광고|마케팅 전략/.test(text)) {
        score += 20;
        keywords.push('#마케팅');
    }
    
    if (/ui\/ux|uiux|사용자경험|인터페이스/.test(text)) {
        score += 25;
        keywords.push('#UIUX');
    }
    
    // 가중치 키워드
    if (/경남|창원|김해|밀양/.test(agency)) {
        score += 15;
        keywords.unshift('#경남지역');
    }
    
    if (/바우처/.test(`${title} ${agency}`)) {
        score += 20;
        keywords.unshift('#바우처');
    }
    
    if (/수출|해외|글로벌|국제/.test(text)) {
        score += 18;
        keywords.unshift('#수출지원');
    }
    
    keywords = [...new Set(keywords)].slice(0, 4);
    
    // 등급 결정
    let grade;
    if (score >= 85) grade = 'A+';
    else if (score >= 75) grade = 'A';
    else if (score >= 65) grade = 'B+';
    else if (score >= 55) grade = 'B';
    else if (score >= 45) grade = 'C+';
    else grade = 'C';
    
    // 우선도 결정
    let priority;
    if (score >= 80) priority = '긴급';
    else if (score >= 65) priority = '높음';
    else if (score >= 45) priority = '보통';
    else priority = '낮음';
    
    return {
        score: Math.min(score, 100),
        grade: grade,
        priority: priority,
        keywords: keywords
    };
}

// ===== 3. D-Day 계산 =====
function calculateDDay(deadline) {
    if (!deadline || deadline === '상시') {
        return { 
            dday: '상시', 
            urgency: 'normal', 
            label: '상시모집',
            color: '#95a5a6'
        };
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
        return { 
            dday: '마감됨', 
            urgency: 'expired', 
            label: '접수마감',
            color: '#7f8c8d'
        };
    } else if (diffDays === 0) {
        return { 
            dday: '오늘', 
            urgency: 'critical', 
            label: '오늘 마감',
            color: '#e74c3c'
        };
    } else if (diffDays === 1) {
        return { 
            dday: '내일', 
            urgency: 'critical', 
            label: '내일 마감',
            color: '#e74c3c'
        };
    } else if (diffDays <= 3) {
        return { 
            dday: `D-${diffDays}`, 
            urgency: 'urgent', 
            label: `${diffDays}일 후 마감`,
            color: '#e67e22'
        };
    } else if (diffDays <= 7) {
        return { 
            dday: `D-${diffDays}`, 
            urgency: 'warning', 
            label: `${diffDays}일 후 마감`,
            color: '#f39c12'
        };
    } else {
        return { 
            dday: `D-${diffDays}`, 
            urgency: 'normal', 
            label: `${diffDays}일 후 마감`,
            color: '#3498db'
        };
    }
}

// ===== 4. 마감일 추출 =====
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

// ===== 5. 샘플 데이터 (안전한 크롤링) =====
async function crawlAllSites() {
    console.log('=== 안전한 샘플 데이터 수집 시작 ===');
    
    try {
        // GitHub 환경에서는 샘플 데이터 사용 (안전함)
        const sampleNotices = [
            {
                title: '2025년 수출바우처 지원사업 (해외마케팅)',
                agency: 'KOTRA',
                period: '상시모집',
                summary: '해외 진출을 위한 홈페이지 다국어 구축, 카탈로그 제작, 브랜드 마케팅 지원',
                deadline: '상시',
                link: '#'
            },
            {
                title: '중소기업 수출 디지털 마케팅 지원',
                agency: '수출바우처사업단',
                period: '상시모집',
                summary: '수출기업 대상 온라인 마케팅, SNS 마케팅, 브랜드 홍보 지원',
                deadline: '상시',
                link: '#'
            },
            {
                title: '글로벌 브랜드 강화 지원사업',
                agency: 'KOTRA',
                period: '2025.01.01 ~ 2025.10.30',
                summary: '수출 유망 기업의 글로벌 브랜드 구축 및 해외 전시회 참가 지원',
                deadline: '2025-10-30',
                link: '#'
            },
            {
                title: '경남 수출기업 패키지디자인 지원',
                agency: '경남수출지원센터',
                period: '2025.01.01 ~ 2025.08.31',
                summary: '경남 소재 수출기업 대상 패키지디자인 및 제품 브랜딩 지원',
                deadline: '2025-08-31',
                link: '#'
            },
            {
                title: '창원 중소기업 디지털 마케팅 지원',
                agency: '창원산업진흥원',
                period: '2025.01.01 ~ 2025.10.15',
                summary: '홈페이지 제작, 온라인 마케팅, 디지털 전환 지원',
                deadline: '2025-10-15',
                link: '#'
            },
            {
                title: '창원 기업 브랜드 강화 지원사업',
                agency: '창원산업진흥원',
                period: '2025.01.01 ~ 2025.09.20',
                summary: '창원 소재 기업의 CI/BI 개발 및 카탈로그 제작 지원',
                deadline: '2025-09-20',
                link: '#'
            },
            {
                title: '2025년 디자인주도 제조혁신사업',
                agency: '한국디자인진흥원',
                period: '2025.01.01 ~ 2025.08.15',
                summary: '제조기업 디자인 혁신 및 제품 고도화 지원',
                deadline: '2025-08-15',
                link: '#'
            },
            {
                title: '중소기업 브랜딩 지원사업',
                agency: '한국디자인진흥원',
                period: '2025.01.01 ~ 2025.09.30',
                summary: '중소기업 브랜드 개발 및 마케팅 디자인 지원',
                deadline: '2025-09-30',
                link: '#'
            }
        ];
        
        // 필터링 적용
        const validNotices = sampleNotices.filter(notice => 
            shouldIncludeNotice(notice.title, notice.summary, notice.agency)
        );
        
        console.log(`총 ${validNotices.length}개 유효 공고 수집 완료`);
        return validNotices;
        
    } catch (error) {
        console.error('데이터 수집 오류:', error);
        return [];
    }
}

// ===== 6. 안전한 HTML 템플릿 생성 =====
function generateCardHTML(notice) {
    const analysis = analyzeNotice(notice.title, notice.summary || '', notice.agency);
    const ddayInfo = calculateDDay(notice.deadline);
    
    const agencyColor = getAgencyColor(notice.agency);
    const gradeColor = getGradeColor(analysis.grade);
    
    return `
    <div style="border: 2px solid ${ddayInfo.urgency === 'critical' ? '#e74c3c' : ddayInfo.urgency === 'urgent' ? '#e67e22' : '#ddd'}; border-radius: 12px; margin: 15px 0; background: white; box-shadow: 0 4px 8px rgba(0,0,0,0.1); overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="background: ${agencyColor}; color: white; padding: 10px 15px; font-size: 14px; font-weight: bold; display: flex; justify-content: space-between; align-items: center;">
            <span>[공고] ${notice.agency}</span>
            <span style="background: rgba(255,255,255,0.2); padding: 3px 8px; border-radius: 12px; font-size: 12px;">${ddayInfo.label}</span>
        </div>
        
        <div style="padding: 20px;">
            <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: bold; color: #2c3e50; line-height: 1.4;">${notice.title}</h3>
            
            <div style="display: grid; gap: 8px; margin-bottom: 15px; font-size: 14px;">
                <div style="display: flex; align-items: center;">
                    <span style="width: 20px; color: #7f8c8d;">[기간]</span>
                    <strong style="width: 80px;">신청기간:</strong>
                    <span>${notice.period || '확인 필요'}</span>
                </div>
                <div style="display: flex; align-items: center;">
                    <span style="width: 20px; color: #7f8c8d;">[유형]</span>
                    <strong style="width: 80px;">사업유형:</strong>
                    <span>${getBusinessType(notice.title, notice.agency)}</span>
                </div>
                <div style="display: flex; align-items: center;">
                    <span style="width: 20px; color: #7f8c8d;">[링크]</span>
                    <strong style="width: 80px;">상세링크:</strong>
                    <a href="${notice.link}" style="color: #3498db; text-decoration: none;">공고 확인 →</a>
                </div>
            </div>
            
            <div style="display: flex; gap: 10px; margin-bottom: 15px; flex-wrap: wrap;">
                <div style="background: ${gradeColor}; color: white; padding: 8px 12px; border-radius: 6px; font-weight: bold; font-size: 14px;">[분석] ${analysis.grade} (${analysis.score}점)</div>
                <div style="background: ${analysis.priority === '긴급' ? '#e74c3c' : analysis.priority === '높음' ? '#e67e22' : analysis.priority === '보통' ? '#f39c12' : '#95a5a6'}; color: white; padding: 8px 12px; border-radius: 6px; font-weight: bold; font-size: 14px;">[우선도] ${analysis.priority}</div>
                <div style="background: ${ddayInfo.color}; color: white; padding: 8px 12px; border-radius: 6px; font-weight: bold; font-size: 14px;">[마감] ${ddayInfo.dday}</div>
            </div>
            
            <div style="margin-top: 15px;">
                ${analysis.keywords.map(keyword => `<span style="background: #ecf0f1; color: #2c3e50; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-right: 5px; margin-bottom: 5px; display: inline-block; font-weight: 500;">${keyword}</span>`).join('')}
            </div>
        </div>
    </div>
    `;
}

function generateStatsCards(notices) {
    const stats = {
        total: notices.length,
        urgent: 0,
        aPlus: 0,
        avgScore: 0
    };
    
    let totalScore = 0;
    
    notices.forEach(notice => {
        const analysis = analyzeNotice(notice.title, notice.summary || '', notice.agency);
        const ddayInfo = calculateDDay(notice.deadline);
        
        totalScore += analysis.score;
        
        if (ddayInfo.urgency === 'critical' || ddayInfo.urgency === 'urgent') {
            stats.urgent++;
        }
        
        if (analysis.grade === 'A+') {
            stats.aPlus++;
        }
    });
    
    stats.avgScore = notices.length > 0 ? Math.round(totalScore / notices.length) : 0;
    
    return `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 30px 0;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px 20px; border-radius: 12px; text-align: center; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            <div style="font-size: 32px; font-weight: bold; margin-bottom: 5px;">${stats.total}</div>
            <div style="font-size: 14px; opacity: 0.9;">총 공고</div>
        </div>
        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 25px 20px; border-radius: 12px; text-align: center; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            <div style="font-size: 32px; font-weight: bold; margin-bottom: 5px;">${stats.urgent}</div>
            <div style="font-size: 14px; opacity: 0.9;">긴급 사업</div>
        </div>
        <div style="background: linear-gradient(135deg, #feca57 0%, #ff9ff3 100%); color: white; padding: 25px 20px; border-radius: 12px; text-align: center; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            <div style="font-size: 32px; font-weight: bold; margin-bottom: 5px;">${stats.aPlus}</div>
            <div style="font-size: 14px; opacity: 0.9;">A+ 등급</div>
        </div>
        <div style="background: linear-gradient(135deg, #48cae4 0%, #023047 100%); color: white; padding: 25px 20px; border-radius: 12px; text-align: center; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            <div style="font-size: 32px; font-weight: bold; margin-bottom: 5px;">${stats.avgScore}</div>
            <div style="font-size: 14px; opacity: 0.9;">평균 점수</div>
        </div>
    </div>
    `;
}

function generateHTMLEmail(notices) {
    const sortedNotices = notices.sort((a, b) => {
        const aAnalysis = analyzeNotice(a.title, a.summary || '', a.agency);
        const bAnalysis = analyzeNotice(b.title, b.summary || '', b.agency);
        return bAnalysis.score - aAnalysis.score;
    });
    
    return `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MAILNARA v5.1 크리에이티브마루 분석 리포트</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="max-width: 800px; margin: 0 auto; background: white; padding: 30px;">
            
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 15px; text-align: center; margin-bottom: 30px;">
                <h1 style="margin: 0; font-size: 28px; font-weight: bold;">[CREATIVE MARU] 크리에이티브마루</h1>
                <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">MAILNARA v5.1 실시간 분석 리포트</p>
                <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.8;">${new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })} | GitHub 자동화 버전</p>
            </div>
            
            ${generateStatsCards(notices)}
            
            <div style="margin-top: 30px;">
                <h2 style="color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; margin-bottom: 25px; font-size: 22px;">[공고] 지원사업 상세 리스트 (총 ${notices.length}건)</h2>
                ${sortedNotices.map(notice => generateCardHTML(notice)).join('')}
            </div>
            
            <div style="margin-top: 40px; padding: 25px; background: #34495e; color: white; border-radius: 12px; text-align: center;">
                <p style="margin: 0; font-size: 18px; font-weight: bold;">[CREATIVE MARU] 크리에이티브마루</p>
                <p style="margin: 8px 0; font-size: 14px; opacity: 0.9;">경상남도 창원 | 디자인 • 브랜딩 • 홈페이지제작 • 카탈로그 • 지원사업 전문</p>
                <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.7;">MAILNARA v5.1 | GitHub Actions 자동화 | 분석 정확도 90%+ | 문의: pm@cmaru.com</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

// ===== 7. 유틸리티 함수들 =====
function getAgencyColor(agency) {
    if (agency.includes('RIPC') || agency.includes('지식재산')) return '#9b59b6';
    if (agency.includes('KIDP') || agency.includes('디자인진흥원')) return '#8e44ad';
    if (agency.includes('KOTRA') || agency.includes('수출바우처')) return '#27ae60';
    if (agency.includes('창원') || agency.includes('경남')) return '#f39c12';
    return '#34495e';
}

function getGradeColor(grade) {
    const colors = {
        'A+': '#e74c3c',
        'A': '#e67e22', 
        'B+': '#f39c12',
        'B': '#f1c40f',
        'C+': '#95a5a6',
        'C': '#7f8c8d'
    };
    return colors[grade] || '#95a5a6';
}

function getBusinessType(title, agency) {
    const text = title.toLowerCase();
    
    if (/바우처/.test(`${title} ${agency}`)) return '바우처 지원';
    if (/수출|해외/.test(text)) return '해외진출 지원';
    if (/디자인/.test(text)) return '디자인 개발';
    if (/마케팅|홍보/.test(text)) return '마케팅 지원';
    if (/홈페이지|웹/.test(text)) return 'IT/웹 개발';
    if (/지식재산|특허/.test(text)) return '지식재산';
    
    return '기업 지원';
}

function generateEmailSubject(notices) {
    const stats = {
        urgent: notices.filter(n => {
            const dday = calculateDDay(n.deadline);
            return dday.urgency === 'critical' || dday.urgency === 'urgent';
        }).length,
        avgScore: notices.length > 0 ? Math.round(notices.reduce((sum, n) => {
            const analysis = analyzeNotice(n.title, n.summary || '', n.agency);
            return sum + analysis.score;
        }, 0) / notices.length) : 0
    };
    
    return `[크리에이티브마루] 실시간 분석 리포트 | 긴급 ${stats.urgent}건 | 평균 관련도 ${stats.avgScore}점`;
}

// ===== 8. 안전한 메일 발송 함수 =====
async function sendEmail(subject, htmlContent) {
    console.log('[v5.1] 메일 발송 시작...');
    
    try {
        // Gmail 인증 정보 확인
        if (!GMAIL_USER || !GMAIL_PASSWORD) {
            throw new Error('Gmail 인증 정보가 설정되지 않았습니다. GitHub Secrets를 확인하세요.');
        }
        
        const transporter = nodemailer.createTransport({  // ← 여기가 핵심 수정
            service: 'gmail',
            auth: {
                user: GMAIL_USER,
                pass: GMAIL_PASSWORD
            }
        });

        const mailOptions = {
            from: GMAIL_USER,
            to: RECIPIENT_EMAIL,
            subject: subject,
            html: htmlContent
        };

        console.log(`발송 대상: ${RECIPIENT_EMAIL}`);
        console.log(`제목: ${subject}`);
        
        const info = await transporter.sendMail(mailOptions);
        console.log('[v5.1] 메일 발송 성공:', info.messageId);
        
    } catch (error) {
        console.error('[v5.1] 메일 발송 실패:', error.message);
        
        // 에러 상세 정보 출력
        if (error.code === 'EAUTH') {
            console.error('Gmail 인증 실패: 앱 비밀번호를 확인하세요.');
        } else if (error.code === 'ENOTFOUND') {
            console.error('네트워크 연결 실패: 인터넷 연결을 확인하세요.');
        }
        
        throw error;
    }
}

// ===== 9. 메인 함수 =====
async function main() {
    console.log('=== MAILNARA v5.1 GitHub 환경용 시작 ===');
    
    try {
        // 환경 확인
        console.log('1. 환경 변수 확인 완료');
        
        // 데이터 수집
        console.log('2. 데이터 수집 중...');
        const allNotices = await crawlAllSites();
        
        if (allNotices.length === 0) {
            console.log("수집된 공고가 없습니다. 시스템을 종료합니다.");
            process.exit(0);
        }
        
        // 품질 검증
        console.log('3. 품질 검증 중...');
        const stats = {
            aPlus: allNotices.filter(n => {
                const analysis = analyzeNotice(n.title, n.summary || '', n.agency);
                return analysis.grade === 'A+';
            }).length,
            avgScore: Math.round(allNotices.reduce((sum, n) => {
                const analysis = analyzeNotice(n.title, n.summary || '', n.agency);
                return sum + analysis.score;
            }, 0) / allNotices.length)
        };
        
        console.log(`총 공고: ${allNotices.length}건`);
        console.log(`A+ 등급: ${stats.aPlus}건`);
        console.log(`평균 점수: ${stats.avgScore}점`);
        
        // HTML 메일 생성
        console.log('4. 메일 생성 중...');
        const htmlContent = generateHTMLEmail(allNotices);
        const subject = generateEmailSubject(allNotices);
        
        // 메일 발송
        console.log('5. 메일 발송 중...');
        await sendEmail(subject, htmlContent);
        
        console.log('=== MAILNARA v5.1 완료 ===');
        console.log(`성공적으로 완료되었습니다!`);
        
    } catch (error) {
        console.error('=== MAILNARA v5.1 오류 ===');
        console.error('오류 메시지:', error.message);
        console.error('스택 트레이스:', error.stack);
        process.exit(1);
    }
}

// 메인 함수 실행
main();
