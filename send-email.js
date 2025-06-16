// send-email.js
const nodemailer = require('nodemailer');

async function sendEmail() {
  try {
    console.log('📧 메일 발송 시작...');
    
    // ✅ 올바른 메서드명: createTransport
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

    const htmlTemplate = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px; }
        .content { padding: 30px; background: white; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .urgent { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #e17055; }
        .project-card { background: white; border: 1px solid #e9ecef; border-radius: 8px; margin: 15px 0; padding: 20px; border-left: 5px solid #00b894; }
        .grade-badge { background: #00b894; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .keyword-tag { background: #f1f3f4; color: #5f6368; padding: 4px 8px; margin: 2px; border-radius: 12px; font-size: 12px; display: inline-block; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 20px 0; }
        .stat-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-number { font-size: 28px; font-weight: 700; color: #495057; margin: 0; }
        .cta-button { background: #00b894; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 10px 5px; display: inline-block; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎯 지원사업 분석 리포트</h1>
        <p>크리에이티브마루 맞춤 분석 결과 | ${new Date().toLocaleDateString('ko-KR')}</p>
    </div>
    
    <div class="content">
        <div class="urgent">
            <h3>🚨 긴급 확인 필요 (D-13일)</h3>
            <p><strong>초기창업패키지 브랜딩 지원사업</strong><br>
            마감: 2025-06-30 | 지원금: 최대 5천만원<br>
            브랜딩 관련도 높으나 창업사업 제한 적용 → <strong>금주 내 신청 여부 결정 필요</strong></p>
        </div>

        <div class="stats">
            <div class="stat-card">
                <p class="stat-number">3</p>
                <p>A+ 등급</p>
            </div>
            <div class="stat-card">
                <p class="stat-number">1</p>
                <p>B 등급</p>
            </div>
            <div class="stat-card">
                <p class="stat-number">6억원</p>
                <p>최대 지원금</p>
            </div>
        </div>

        <h2>🏆 A+ 등급 사업 (즉시 신청 권장)</h2>
        
        <div class="project-card">
            <h3>수출바우처 지원사업 (해외마케팅)</h3>
            <span class="grade-badge">A+ 등급 100점</span>
            <p><strong>기관:</strong> 수출바우처</p>
            <p><strong>마감:</strong> 2025-12-31 (D-197)</p>
            <p><strong>지원금:</strong> 최대 3억원</p>
            <div>
                <span class="keyword-tag">#홈페이지</span>
                <span class="keyword-tag">#브랜딩</span>
                <span class="keyword-tag">#카탈로그</span>
                <span class="keyword-tag">#수출</span>
                <span class="keyword-tag">#마케팅</span>
            </div>
            <p><strong>액션플랜:</strong> 즉시 신청서 작성 및 제출 권장</p>
        </div>

        <div class="project-card">
            <h3>디자인전문기업 지정 지원사업</h3>
            <span class="grade-badge">A+ 등급 100점</span>
            <p><strong>기관:</strong> 한국디자인진흥원</p>
            <p><strong>마감:</strong> 2025-08-15 (D-59)</p>
            <p><strong>지원금:</strong> 최대 1억원</p>
            <div>
                <span class="keyword-tag">#디자인</span>
                <span class="keyword-tag">#브랜딩</span>
                <span class="keyword-tag">#UI/UX</span>
            </div>
            <p><strong>액션플랜:</strong> 즉시 신청서 작성 및 제출 권장</p>
        </div>

        <div class="project-card">
            <h3>중소기업 혁신바우처 지원사업</h3>
            <span class="grade-badge">A+ 등급 100점</span>
            <p><strong>기관:</strong> 혁신바우처</p>
            <p><strong>마감:</strong> 상시모집</p>
            <p><strong>지원금:</strong> 최대 2억원</p>
            <div>
                <span class="keyword-tag">#디자인</span>
                <span class="keyword-tag">#홈페이지</span>
                <span class="keyword-tag">#브랜딩</span>
                <span class="keyword-tag">#UI/UX</span>
                <span class="keyword-tag">#마케팅</span>
            </div>
            <p><strong>액션플랜:</strong> 즉시 신청서 작성 및 제출 권장</p>
        </div>

        <h2>📋 B 등급 사업 (검토 후 신청)</h2>
        
        <div class="project-card" style="border-left-color: #fdcb6e;">
            <h3>경남 스마트제조 디지털전환 지원사업</h3>
            <span class="grade-badge" style="background: #fdcb6e; color: #2d3436;">B 등급 70점</span>
            <p><strong>기관:</strong> 경남테크노파크</p>
            <p><strong>마감:</strong> 2025-09-30 (D-105)</p>
            <p><strong>지원금:</strong> 최대 2억원</p>
            <div>
                <span class="keyword-tag">#홈페이지</span>
                <span class="keyword-tag">#브랜딩</span>
            </div>
            <p><strong>액션플랜:</strong> 신청 검토 및 담당자 문의</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <a href="https://www.mssmiv.com/portal/Main" class="cta-button">💼 혁신바우처 신청하기</a>
            <a href="https://www.kidp.or.kr/?menuno=773" class="cta-button">🎨 디자인전문기업 신청하기</a>
        </div>
    </div>
    
    <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d;">
        <p><strong>크리에이티브마루</strong> | 경상남도 창원<br>
        📧 pm@cmaru.com | 🌐 홈페이지제작·카탈로그제작·브랜드마케팅<br>
        <small>본 메일은 GPT 자동분석 시스템에 의해 생성되었습니다.</small></p>
    </div>
</body>
</html>
    `;

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.RECIPIENT_EMAIL || 'pm@cmaru.com',
      subject: '[GPT 자동분석] 2025년 지원사업 요약 리포트',
      html: htmlTemplate,
    };

    console.log(`📮 발송 대상: ${mailOptions.to}`);
    
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ 메일 발송 성공!');
    console.log('📧 Message ID:', result.messageId);
    
  } catch (error) {
    console.error('❌ 메일 발송 실패:', error.message);
    process.exit(1);
  }
}

// 실행
sendEmail();
