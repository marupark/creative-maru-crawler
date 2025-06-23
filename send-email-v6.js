// ===== MAILNARA v6.0 메일 발송 시스템 =====
// JSON 데이터 기반 운영용 메일 시스템
// send-email-v6.js

const fs = require('fs');
const nodemailer = require('nodemailer');

// 환경 변수
const GMAIL_USER = process.env.GMAIL_USER || 'hcsarang@gmail.com';
const GMAIL_PASSWORD = process.env.GMAIL_PASSWORD || 'wduc vthz gxmc qxph';
const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL || 'pm@cmaru.com';

console.log('=== MAILNARA v6.0 운영용 메일 시스템 ===');

// ===== 1. JSON 데이터 로드 =====
function loadCrawledData() {
    try {
        // 실제 크롤링 데이터 우선 로드
        if (fs.existsSync('mailnara-data.json')) {
            console.log('[데이터] 실제 크롤링 데이터 로드: mailnara-data.json');
            const data = fs.readFileSync('mailnara-data.json', 'utf8');
            return JSON.parse(data);
        }
        
        // 에러 데이터라도 있으면 로드
        if (fs.existsSync('mailnara-data-error.json')) {
            console.log('[데이터] 에러 상황 데이터 로드: mailnara-data-error.json');
            const data = fs.readFileSync('mailnara-data-error.json', 'utf8');
            return JSON.parse(data);
        }
        
        // 완전 실패 시에만 fallback
        console.log('[경고] JSON 파일이 없음. Fallback 데이터 사용.');
        return createFallbackData();
        
    } catch (error) {
        console.error('[오류] JSON 데이터 로드 실패:', error.message);
        return createFallbackData();
    }
}

// ===== 2. Fallback 데이터 (최소한의 안전망) =====
function createFallbackData() {
    console.log('[Fallback] 최소한의 안전망 데이터 생성 중...');
    
    return {
        metadata: {
            version: 'v6.0-fallback',
            crawledAt: new Date().toISOString(),
            dataSource: 'Fallback_안전망',
            crawlStatus: {
                error: '실제 크롤링 실패로 인한 fallback 데이터 사용'
            }
        },
        notices: {
            included: [
                {
                    title: '[Fallback] 실제 크롤링 데이터 준비 중',
                    agency: 'MAILNARA 시스템',
                    period: '시스템 점검 중',
                    deadline: '상시',
                    link: '#',
                    summary: '실제 크롤링 시스템 점검 중입니다.',
                    source: 'Fallback',
                    score: 0,
                    grade: 'SYSTEM',
                    filterResult: { include: true, reason: 'fallback' }
                }
            ],
            excluded: []
        },
        statistics: {
            totalCrawled: 1,
            includedCount: 1,
            excludedCount: 0,
            averageScore: 0,
            gradeDistribution: { 'SYSTEM': 1 }
        }
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

// ===== 4. 메일 템플릿 생성 =====
function generateDataSourceBadge(dataSource) {
    if (dataSource === '실제크롤링') {
        return '<span style="background: #27ae60; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">✅ 실제데이터</span>';
    } else if (dataSource.includes('Fallback')) {
        return '<span style="background: #e74c3c; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">⚠️ Fallback</span>';
    } else {
        return '<span style="background: #f39c12; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">❓ 확인필요</span>';
    }
}

function generateNoticeCard(notice) {
    const ddayInfo = calculateDDay(notice.deadline);
    const agencyColor = getAgencyColor(notice.agency);
    const gradeColor = getGradeColor(notice.grade);
    
    return `
    <div style="border: 2px solid ${ddayInfo.urgency === 'critical' ? '#e74c3c' : ddayInfo.urgency === 'urgent' ? '#e67e22' : '#ddd'}; border-radius: 12px; margin: 15px 0; background: white; box-shadow: 0 4px 8px rgba(0,0,0,0.1); overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="background: ${agencyColor}; color: white; padding: 10px 15px; font-size: 14px; font-weight: bold; display: flex; justify-content: space-between; align-items: center;">
            <span>[공고] ${notice.agency}</span>
            <div>
                ${generateDataSourceBadge(notice.source || '확인필요')}
                <span style="background: rgba(255,255,255,0.2); padding: 3px 8px; border-radius: 12px; font-size: 12px; margin-left: 5px;">${ddayInfo.label}</span>
            </div>
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
                ${notice.scoreDetails && notice.scoreDetails.length > 0 ? `
                <div style="display: flex; align-items: flex-start;">
                    <span style="width: 20px; color: #7f8c8d;">[점수]</span>
                    <strong style="width: 80px;">점수상세:</strong>
                    <span style="font-size: 12px; color: #666;">${notice.scoreDetails.join(', ')}</span>
                </div>
                ` : ''}
            </div>
            
            <div style="display: flex; gap: 10px; margin-bottom: 15px; flex-wrap: wrap;">
                <div style="background: ${gradeColor}; color: white; padding: 8px 12px; border-radius: 6px; font-weight: bold; font-size: 14px;">[분석] ${notice.grade} (${notice.score}점)</div>
                <div style="background: ${ddayInfo.color}; color: white; padding: 8px 12px; border-radius: 6px; font-weight: bold; font-size: 14px;">[마감] ${ddayInfo.dday}</div>
                ${notice.filterResult ? `<div style="background: ${notice.filterResult.include ? '#27ae60' : '#95a5a6'}; color: white; padding: 8px 12px; border-radius: 6px; font-weight: bold; font-size: 14px;">[필터] ${notice.filterResult.reason}</div>` : ''}
            </div>
        </div>
    </div>
    `;
}

function generateStatsCards(data) {
    const stats = data.statistics;
    
    return `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 30px 0;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px 20px; border-radius: 12px; text-align: center; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            <div style="font-size: 32px; font-weight: bold; margin-bottom: 5px;">${stats.totalCrawled}</div>
            <div style="font-size: 14px; opacity: 0.9;">총 수집</div>
        </div>
        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 25px 20px; border-radius: 12px; text-align: center; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            <div style="font-size: 32px; font-weight: bold; margin-bottom: 5px;">${stats.includedCount}</div>
            <div style="font-size: 14px; opacity: 0.9;">포함 공고</div>
        </div>
        <div style="background: linear-gradient(135deg, #feca57 0%, #ff9ff3 100%); color: white; padding: 25px 20px; border-radius: 12px; text-align: center; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            <div style="font-size: 32px; font-weight: bold; margin-bottom: 5px;">${stats.gradeDistribution['A+'] || 0}</div>
            <div style="font-size: 14px; opacity: 0.9;">A+ 등급</div>
        </div>
        <div style="background: linear-gradient(135deg, #48cae4 0%, #023047 100%); color: white; padding: 25px 20px; border-radius: 12px; text-align: center; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            <div style="font-size: 32px; font-weight: bold; margin-bottom: 5px;">${stats.averageScore}</div>
            <div style="font-size: 14px; opacity: 0.9;">평균 점수</div>
        </div>
    </div>
    `;
}

function generateCrawlStatusTable(crawlStatus) {
    const statusRows = Object.entries(crawlStatus).map(([site, status]) => {
        const isSuccess = status.includes('성공');
        const statusColor = isSuccess ? '#27ae60' : '#e74c3c';
        
        return `
        <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${site}</td>
            <td style="padding: 8px; border: 1px solid #ddd; color: ${statusColor};">${status}</td>
        </tr>
        `;
    }).join('');
    
    return `
    <div style="margin: 20px 0;">
        <h3 style="color: #2c3e50; margin-bottom: 10px;">📊 크롤링 상태</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
                <tr style="background: #f8f9fa;">
                    <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">사이트</th>
                    <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">상태</th>
                </tr>
            </thead>
            <tbody>
                ${statusRows}
            </tbody>
        </table>
    </div>
    `;
}

function generateHTMLEmail(data) {
    const includedNotices = data.notices.included.sort((a, b) => b.score - a.score);
    const excludedCount = data.notices.excluded.length;
    
    return `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MAILNARA v6.0 운영용 리포트</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="max-width: 800px; margin: 0 auto; background: white; padding: 30px;">
            
            <!-- 헤더 -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 15px; text-align: center; margin-bottom: 30px;">
                <h1 style="margin: 0; font-size: 28px; font-weight: bold;">[CREATIVE MARU] 크리에이티브마루</h1>
                <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">MAILNARA v6.0 운영용 분석 리포트</p>
                <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.8;">
                    ${new Date(data.metadata.crawledAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })} | 
                    ${generateDataSourceBadge(data.metadata.dataSource)}
                </p>
            </div>
            
            <!-- KPI 통계 -->
            ${generateStatsCards(data)}
            
            <!-- 크롤링 상태 -->
            ${generateCrawlStatusTable(data.metadata.crawlStatus)}
            
            <!-- 공고 리스트 -->
            <div style="margin-top: 30px;">
                <h2 style="color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; margin-bottom: 25px; font-size: 22px;">
                    [공고] 지원사업 리스트 (포함: ${includedNotices.length}건 | 제외: ${excludedCount}건)
                </h2>
                
                ${includedNotices.length > 0 ? 
                    includedNotices.map(notice => generateNoticeCard(notice)).join('') :
                    '<div style="padding: 20px; text-align: center; color: #666;">포함된 공고가 없습니다.</div>'
                }
                
                ${excludedCount > 0 ? `
                <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                    <h3 style="margin: 0 0 10px 0; color: #666;">제외된 공고: ${excludedCount}건</h3>
                    <p style="margin: 0; font-size: 14px; color: #888;">필터링 조건에 맞지 않아 제외된 공고들입니다.</p>
                </div>
                ` : ''}
            </div>
            
            <!-- 푸터 -->
            <div style="margin-top: 40px; padding: 25px; background: #34495e; color: white; border-radius: 12px; text-align: center;">
                <p style="margin: 0; font-size: 18px; font-weight: bold;">[CREATIVE MARU] 크리에이티브마루</p>
                <p style="margin: 8px 0; font-size: 14px; opacity: 0.9;">경상남도 창원 | 디자인 • 브랜딩 • 홈페이지제작 • 카탈로그 • 지원사업 전문</p>
                <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.7;">
                    MAILNARA v6.0 운영용 | 실제 데이터 기반 | 
                    크롤링 시간: ${new Date(data.metadata.crawledAt).toLocaleString('ko-KR')} | 
                    문의: pm@cmaru.com
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
}

// ===== 5. 유틸리티 함수들 =====
function getAgencyColor(agency) {
    if (agency.includes('RIPC') || agency.includes('지식재산')) return '#9b59b6';
    if (agency.includes('KIDP') || agency.includes('디자인진흥원')) return '#8e44ad';
    if (agency.includes('KOTRA') || agency.includes('수출바우처')) return '#27ae60';
    if (agency.includes('창원') || agency.includes('경남')) return '#f39c12';
    if (agency.includes('MAILNARA')) return '#34495e';
    return '#34495e';
}

function getGradeColor(grade) {
    const colors = {
        'A+': '#e74c3c',
        'A': '#e67e22', 
        'B+': '#f39c12',
        'B': '#f1c40f',
        'C+': '#95a5a6',
        'C': '#7f8c8d',
        'SYSTEM': '#34495e'
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
    if (/혁신/.test(text)) return '혁신 지원';
    
    return '기업 지원';
}

function generateEmailSubject(data) {
    const stats = data.statistics;
    const urgentCount = data.notices.included.filter(n => {
        const dday = calculateDDay(n.deadline);
        return dday.urgency === 'critical' || dday.urgency === 'urgent';
    }).length;
    
    const dataSourceLabel = data.metadata.dataSource === '실제크롤링' ? '실제데이터' : 'Fallback';
    
    return `[크리에이티브마루] v6.0 운영리포트 | ${dataSourceLabel} | 긴급 ${urgentCount}건 | 평균 ${stats.averageScore}점`;
}

// ===== 6. 메일 발송 함수 =====
async function sendEmail(subject, htmlContent) {
    console.log('[v6.0] 메일 발송 시작...');
    
    try {
        if (!GMAIL_USER || !GMAIL_PASSWORD) {
            throw new Error('Gmail 인증 정보가 설정되지 않았습니다.');
        }
        
        const transporter = nodemailer.createTransport({
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
        console.log('[v6.0] 메일 발송 성공:', info.messageId);
        
    } catch (error) {
        console.error('[v6.0] 메일 발송 실패:', error.message);
        throw error;
    }
}

// ===== 7. 메인 함수 =====
async function main() {
    console.log('=== MAILNARA v6.0 운영용 메일 시스템 시작 ===');
    
    try {
        // 1. JSON 데이터 로드
        console.log('1. 데이터 로드 중...');
        const data = loadCrawledData();
        
        // 2. 데이터 검증
        console.log('2. 데이터 검증 중...');
        console.log(`- 데이터 소스: ${data.metadata.dataSource}`);
        console.log(`- 총 수집: ${data.statistics.totalCrawled}건`);
        console.log(`- 포함: ${data.statistics.includedCount}건`);
        console.log(`- 제외: ${data.statistics.excludedCount}건`);
        console.log(`- 평균 점수: ${data.statistics.averageScore}점`);
        
        // 3. 메일 생성
        console.log('3. 메일 생성 중...');
        const htmlContent = generateHTMLEmail(data);
        const subject = generateEmailSubject(data);
        
        // 4. 메일 발송
        console.log('4. 메일 발송 중...');
        await sendEmail(subject, htmlContent);
        
        console.log('=== MAILNARA v6.0 완료 ===');
        console.log('✅ 운영용 메일 발송 성공');
        
    } catch (error) {
        console.error('=== MAILNARA v6.0 오류 ===');
        console.error('오류 메시지:', error.message);
        console.error('스택 트레이스:', error.stack);
        process.exit(1);
    }
}

// 실행
if (require.main === module) {
    main();
}

module.exports = { main, generateHTMLEmail, loadCrawledData };
