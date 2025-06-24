// send-email-v7.js - MAILNARA v7.0 API 기반 메일러
// v6.0 메일러를 API 데이터 형식에 맞게 개선

const nodemailer = require('nodemailer');

// 메일 발송 설정 (v6.0 동일)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// v7.0용 메일 템플릿 (API 데이터 형식에 맞게 수정)
function generateEmailHTML(notices) {
    const totalCount = notices.length;
    const highScoreCount = notices.filter(n => n.score >= 70).length;
    const avgScore = totalCount > 0 ? Math.round(notices.reduce((sum, n) => sum + n.score, 0) / totalCount) : 0;
    
    // 기관별 통계
    const agencyStats = {};
    notices.forEach(notice => {
        const agency = notice.agency;
        if (!agencyStats[agency]) agencyStats[agency] = 0;
        agencyStats[agency]++;
    });

    const emailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: 'Malgun Gothic', sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .header .subtitle { margin: 10px 0 0 0; opacity: 0.9; font-size: 16px; }
            .stats { display: flex; justify-content: space-around; padding: 20px; background: #f8f9fa; }
            .stat-item { text-align: center; }
            .stat-number { font-size: 24px; font-weight: bold; color: #667eea; }
            .stat-label { font-size: 12px; color: #666; margin-top: 5px; }
            .content { padding: 0; }
            .notice-item { border-bottom: 1px solid #eee; padding: 20px; }
            .notice-item:last-child { border-bottom: none; }
            .notice-title { font-size: 18px; font-weight: bold; color: #333; margin: 0 0 10px 0; line-height: 1.4; }
            .notice-meta { display: flex; gap: 15px; margin: 10px 0; }
            .meta-item { font-size: 14px; color: #666; }
            .notice-summary { color: #555; margin: 10px 0; line-height: 1.6; font-size: 14px; }
            .notice-link { display: inline-block; margin-top: 10px; padding: 8px 16px; background: #667eea; color: white; text-decoration: none; border-radius: 4px; font-size: 14px; }
            .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
            .badge-api { background: #28a745; color: white; }
            .badge-score { background: #17a2b8; color: white; }
            .badge-high { background: #fd7e14; color: white; }
            .footer { padding: 20px; text-align: center; background: #f8f9fa; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚀 MAILNARA v7.0</h1>
                <div class="subtitle">크리에이티브마루 맞춤 지원사업 정보 (API 기반)</div>
            </div>
            
            <div class="stats">
                <div class="stat-item">
                    <div class="stat-number">${totalCount}</div>
                    <div class="stat-label">총 공고수</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${highScoreCount}</div>
                    <div class="stat-label">고득점 (70점↑)</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${avgScore}점</div>
                    <div class="stat-label">평균 점수</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">3개</div>
                    <div class="stat-label">타겟 기관</div>
                </div>
            </div>

            <div class="content">
                ${notices.length === 0 ? `
                    <div style="padding: 40px; text-align: center; color: #666;">
                        <h3>😔 조건에 맞는 공고가 없습니다</h3>
                        <p>KIDP, RIPC, KOTRA에서 크리에이티브마루 맞춤 공고를 찾지 못했습니다.</p>
                        <p>내일 다시 확인해보겠습니다!</p>
                    </div>
                ` : notices.map(notice => `
                    <div class="notice-item">
                        <div class="notice-title">${notice.title}</div>
                        
                        <div class="notice-meta">
                            <span class="meta-item">📅 ${notice.period}</span>
                            <span class="meta-item">🏢 ${notice.agency}</span>
                            <span class="badge badge-api">API데이터</span>
                            <span class="badge badge-score">${notice.score}점</span>
                            ${notice.score >= 70 ? '<span class="badge badge-high">고득점</span>' : ''}
                        </div>
                        
                        <div class="notice-summary">
                            ${notice.summary.length > 150 ? notice.summary.substring(0, 150) + '...' : notice.summary}
                        </div>
                        
                        <a href="${notice.link}" class="notice-link" target="_blank">공고 상세보기 →</a>
                    </div>
                `).join('')}
            </div>
            
            <div class="footer">
                <p><strong>📊 기관별 수집 현황:</strong></p>
                ${Object.entries(agencyStats).map(([agency, count]) => 
                    `<span style="margin: 0 10px;">${agency}: ${count}개</span>`
                ).join('')}
                <br><br>
                <p>💡 v7.0 업그레이드: 안정적 API 기반 수집 | 3개 기관 집중 타겟팅 | 크리에이티브마루 맞춤 필터링</p>
                <p>🔗 GitHub: MAILNARA v7.0 | 📧 문의: pm@cmaru.com</p>
            </div>
        </div>
    </body>
    </html>`;
    
    return emailHTML;
}

// 메일 발송 함수 (v6.0 개선)
async function sendNotificationEmail(notices) {
    const totalCount = notices.length;
    const highScoreCount = notices.filter(n => n.score >= 70).length;
    
    // 제목 생성
    let subject;
    if (totalCount === 0) {
        subject = '📭 MAILNARA v7.0 - 오늘은 맞춤 공고가 없습니다';
    } else if (highScoreCount > 0) {
        subject = `🎯 MAILNARA v7.0 - 고득점 ${highScoreCount}개 포함, 총 ${totalCount}개 공고 발견!`;
    } else {
        subject = `📢 MAILNARA v7.0 - 총 ${totalCount}개 공고 (API 기반 수집)`;
    }
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'pm@cmaru.com', // 크리에이티브마루 이메일
        subject: subject,
        html: generateEmailHTML(notices),
        attachments: []
    };
    
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ v7.0 메일 발송 성공:', info.messageId);
        console.log(`📊 발송 내용: 총 ${totalCount}개 공고, 고득점 ${highScoreCount}개`);
        return true;
    } catch (error) {
        console.error('❌ v7.0 메일 발송 실패:', error);
        return false;
    }
}

module.exports = {
    sendNotificationEmail,
    generateEmailHTML
};
