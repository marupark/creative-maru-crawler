// send-email-v7.js - MAILNARA v7.2 API 기반 메일러
const nodemailer = require('nodemailer');

// 메일 발송 설정 (Gmail)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 메일 HTML 템플릿
function generateEmailHTML(notices) {
    const totalCount = notices.length;
    const highScoreCount = notices.filter(n => n.score >= 70).length;
    const avgScore = totalCount > 0 ? Math.round(notices.reduce((sum, n) => sum + n.score, 0) / totalCount) : 0;

    // 기관별 통계
    const agencyStats = {};
    notices.forEach(notice => {
        const agency = notice.agency || '기관 정보 없음';
        agencyStats[agency] = (agencyStats[agency] || 0) + 1;
    });

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: 'Malgun Gothic', sans-serif; padding: 20px; background: #f9f9f9; }
            .container { max-width: 800px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.05); }
            .header { background: linear-gradient(to right, #4a00e0, #8e2de2); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { margin: 0; font-size: 24px; }
            .stats { margin: 20px 0; display: flex; justify-content: space-around; text-align: center; }
            .stat { font-size: 16px; }
            .stat span { display: block; font-weight: bold; font-size: 20px; color: #4a00e0; }
            .notice { border-top: 1px solid #eee; padding: 15px 0; }
            .notice-title { font-size: 18px; font-weight: bold; color: #333; margin-bottom: 8px; }
            .notice-meta { font-size: 14px; color: #666; margin-bottom: 5px; }
            .notice-summary { font-size: 14px; color: #555; line-height: 1.5; }
            .notice-link { margin-top: 10px; display: inline-block; background: #4a00e0; color: white; padding: 6px 12px; text-decoration: none; border-radius: 4px; font-size: 13px; }
            .footer { margin-top: 30px; font-size: 12px; color: #999; text-align: center; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚀 MAILNARA v7.2 지원사업 알림</h1>
                <p>크리에이티브마루 맞춤형 정보</p>
            </div>
            <div class="stats">
                <div class="stat"><span>${totalCount}</span>총 공고</div>
                <div class="stat"><span>${highScoreCount}</span>고득점</div>
                <div class="stat"><span>${avgScore}점</span>평균 점수</div>
            </div>

            ${notices.length === 0 ? `
                <p style="text-align:center;">조건에 맞는 공고가 없습니다. 내일 다시 확인해보세요!</p>
            ` : notices.map(n => `
                <div class="notice">
                    <div class="notice-title">${n.title}</div>
                    <div class="notice-meta">📅 ${n.period} | 🏢 ${n.agency} | 점수: ${n.score}</div>
                    <div class="notice-summary">${n.summary ? (n.summary.length > 140 ? n.summary.substring(0, 140) + '...' : n.summary) : '내용 없음'}</div>
                    <a class="notice-link" href="${n.link}" target="_blank">📌 공고 보기</a>
                </div>
            `).join('')}

            <div class="footer">
                <p><strong>기관별 수집 현황:</strong></p>
                <p>${Object.entries(agencyStats).map(([a, c]) => `${a}: ${c}개`).join(' | ')}</p>
                <br>
                <p>💡 안정적 API 수집 기반, 크리에이티브마루 맞춤 필터링 적용</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

// 메일 발송 함수
async function sendNotificationEmail(notices) {
    const totalCount = notices.length;
    const highScoreCount = notices.filter(n => n.score >= 70).length;

    const subject = totalCount === 0
        ? '📭 MAILNARA v7.2 - 오늘은 맞춤 공고가 없습니다'
        : highScoreCount > 0
            ? `🎯 MAILNARA v7.2 - 고득점 ${highScoreCount}개 포함 총 ${totalCount}개 공고`
            : `📢 MAILNARA v7.2 - 총 ${totalCount}개 공고 도착`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'pm@cmaru.com',
        subject: subject,
        html: generateEmailHTML(notices)
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ 메일 발송 성공: ${info.messageId}`);
        return true;
    } catch (err) {
        console.error('❌ 메일 발송 실패:', err);
        return false;
    }
}

module.exports = {
    sendNotificationEmail,
    generateEmailHTML
};
