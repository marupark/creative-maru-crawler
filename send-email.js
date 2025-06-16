// send-email.js - 완전한 디자인 버전
const nodemailer = require('nodemailer');

async function sendEmail() {
  try {
    console.log('📧 메일 발송 시작...');
    
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
    <title>[GPT 자동분석] 2025년 지원사업 요약 리포트</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .email-container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .header .subtitle {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 14px;
        }
        .content {
            padding: 30px;
        }
        .urgent-notice {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #e17055;
        }
        .urgent-notice h3 {
            margin: 0 0 10px 0;
            color: #d63031;
            font-size: 16px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        .stat-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border: 1px solid #e9ecef;
        }
        .stat-number {
            font-size: 28px;
            font-weight: 700;
            color: #495057;
            margin: 0;
        }
        .stat-label {
            font-size: 12px;
            color: #6c757d;
            margin: 5px 0 0 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .project-card {
            background: white;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            margin: 15px 0;
            overflow: hidden;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .project-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .grade-a-plus {
            border-left: 5px solid #00b894;
        }
        .grade-a {
            border-left: 5px solid #0984e3;
        }
        .grade-b {
            border-left: 5px solid #fdcb6e;
        }
        .project-header {
            padding: 20px 20px 15px 20px;
        }
        .project-title {
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 8px 0;
            color: #2d3436;
        }
        .project-agency {
            font-size: 14px;
            color: #636e72;
            margin: 0 0 15px 0;
        }
        .grade-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        .grade-a-plus-badge {
            background: #00b894;
            color: white;
        }
        .grade-a-badge {
            background: #0984e3;
            color: white;
        }
        .grade-b-badge {
            background: #fdcb6e;
            color: #2d3436;
        }
        .score {
            float: right;
            font-size: 24px;
            font-weight: 700;
            color: #2d3436;
        }
        .project-details {
            padding: 0 20px 20px 20px;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 8px 0;
            font-size: 14px;
        }
        .detail-label {
            color: #636e72;
            font-weight: 500;
        }
        .detail-value {
            color: #2d3436;
            font-weight: 600;
        }
        .keywords {
            margin: 15px 0 0 0;
        }
        .keyword-tag {
            display: inline-block;
            background: #f1f3f4;
            color: #5f6368;
            padding: 4px 8px;
            margin: 2px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
        }
        .deadline-urgent {
            color: #d63031;
            font-weight: 700;
        }
        .deadline-normal {
            color: #636e72;
        }
        .action-plan {
            background: #f8f9fa;
            padding: 15px;
            margin: 15px 0 0 0;
            border-radius: 6px;
            font-size: 14px;
            color: #495057;
            border-left: 3px solid #6c757d;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            font-size: 12px;
            color: #6c757d;
            border-top: 1px solid #e9ecef;
        }
        .cta-button {
            display: inline-block;
            background: #00b894;
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
            margin: 10px 5px;
            transition: background 0.2s;
        }
        .cta-button:hover {
            background: #00a085;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>🎯 지원사업 분석 리포트</h1>
            <p class="subtitle">크리에이티브마루 맞춤 분석 결과 | ${new Date().toLocaleDateString('ko-KR')}</p>
        </div>
        
        <div class="content">
            <!-- 긴급 알림 -->
            <div class="urgent-notice">
                <h3>🚨 긴급 확인 필요 (D-13일)</h3>
                <p><strong>초기창업패키지 브랜딩 지원사업</strong><br>
                마감: 2025-06-30 | 지원금: 최대 5천만원<br>
                브랜딩 관련도 높으나 창업사업 제한 적용 → <strong>금주 내 신청 여부 결정 필요</strong></p>
            </div>

            <!-- 전체 통계 -->
            <div class="stats-grid">
                <div class="stat-card">
                    <p class="stat-number">3</p>
                    <p class="stat-label">A+ 등급</p>
                </div>
                <div class="stat-card">
                    <p class="stat-number">0</p>
                    <p class="stat-label">A 등급</p>
                </div>
                <div class="stat-card">
                    <p class="stat-number">1</p>
                    <p class="stat-label">B 등급</p>
                </div>
                <div class="stat-card">
                    <p class="stat-number">6억원</p>
                    <p class="stat-label">최대 지원금</p>
                </div>
            </div>

            <h2>🏆 A+ 등급 사업 (즉시 신청 권장)</h2>
            
            <!-- A+ 사업 1 -->
            <div class="project-card grade-a-plus">
                <div class="project-header">
                    <div class="project-title">수출바우처 지원사업 (해외마케팅)</div>
                    <div class="project-agency">수출바우처</div>
                    <span class="grade-badge grade-a-plus-badge">A+ 등급</span>
                    <span class="score">100점</span>
                </div>
                <div class="project-details">
                    <div class="detail-row">
                        <span class="detail-label">마감일:</span>
                        <span class="detail-value deadline-normal">2025-12-31 (D-197)</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">지원금액:</span>
                        <span class="detail-value">최대 3억원</span>
                    </div>
                    <div class="keywords">
                        <span class="keyword-tag">#홈페이지</span>
                        <span class="keyword-tag">#브랜딩</span>
                        <span class="keyword-tag">#카탈로그</span>
                        <span class="keyword-tag">#수출</span>
                        <span class="keyword-tag">#마케팅</span>
                    </div>
                    <div class="action-plan">
                        <strong>액션플랜:</strong> 즉시 신청서 작성 및 제출 권장
                    </div>
                </div>
            </div>

            <!-- A+ 사업 2 -->
            <div class="project-card grade-a-plus">
                <div class="project-header">
                    <div class="project-title">디자인전문기업 지정 지원사업</div>
                    <div class="project-agency">한국디자인진흥원</div>
                    <span class="grade-badge grade-a-plus-badge">A+ 등급</span>
                    <span class="score">100점</span>
                </div>
                <div class="project-details">
                    <div class="detail-row">
                        <span class="detail-label">마감일:</span>
                        <span class="detail-value deadline-normal">2025-08-15 (D-59)</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">지원금액:</span>
                        <span class="detail-value">최대 1억원</span>
                    </div>
                    <div class="keywords">
                        <span class="keyword-tag">#디자인</span>
                        <span class="keyword-tag">#브랜딩</span>
                        <span class="keyword-tag">#UI/UX</span>
                    </div>
                    <div class="action-plan">
                        <strong>액션플랜:</strong> 즉시 신청서 작성 및 제출 권장
                    </div>
                </div>
            </div>

            <!-- A+ 사업 3 -->
            <div class="project-card grade-a-plus">
                <div class="project-header">
                    <div class="project-title">중소기업 혁신바우처 지원사업</div>
                    <div class="project-agency">혁신바우처</div>
                    <span class="grade-badge grade-a-plus-badge">A+ 등급</span>
                    <span class="score">100점</span>
                </div>
                <div class="project-details">
                    <div class="detail-row">
                        <span class="detail-label">마감일:</span>
                        <span class="detail-value deadline-normal">상시모집</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">지원금액:</span>
                        <span class="detail-value">최대 2억원</span>
                    </div>
                    <div class="keywords">
                        <span class="keyword-tag">#디자인</span>
                        <span class="keyword-tag">#홈페이지</span>
                        <span class="keyword-tag">#브랜딩</span>
                        <span class="keyword-tag">#UI/UX</span>
                        <span class="keyword-tag">#마케팅</span>
                    </div>
                    <div class="action-plan">
                        <strong>액션플랜:</strong> 즉시 신청서 작성 및 제출 권장
                    </div>
                </div>
            </div>

            <h2>📋 B 등급 사업 (검토 후 신청)</h2>
            
            <!-- B 등급 사업 -->
            <div class="project-card grade-b">
                <div class="project-header">
                    <div class="project-title">경남 스마트제조 디지털전환 지원사업</div>
                    <div class="project-agency">경남테크노파크</div>
                    <span class="grade-badge grade-b-badge">B 등급</span>
                    <span class="score">70점</span>
                </div>
                <div class="project-details">
                    <div class="detail-row">
                        <span class="detail-label">마감일:</span>
                        <span class="detail-value deadline-normal">2025-09-30 (D-105)</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">지원금액:</span>
                        <span class="detail-value">최대 2억원</span>
                    </div>
                    <div class="keywords">
                        <span class="keyword-tag">#홈페이지</span>
                        <span class="keyword-tag">#브랜딩</span>
                    </div>
                    <div class="action-plan">
                        <strong>액션플랜:</strong> 신청 검토 및 담당자 문의
                    </div>
                </div>
            </div>

            <!-- CTA 버튼 -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://www.mssmiv.com/portal/Main" class="cta-button">💼 혁신바우처 신청하기</a>
                <a href="https://www.kidp.or.kr/?menuno=773" class="cta-button">🎨 디자인전문기업 신청하기</a>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>크리에이티브마루</strong> | 경상남도 창원<br>
            📧 pm@cmaru.com | 🌐 홈페이지제작·카탈로그제작·브랜드마케팅<br>
            <small>본 메일은 GPT 자동분석 시스템에 의해 생성되었습니다.</small></p>
        </div>
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
