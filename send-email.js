// send-email.js - 메일 클라이언트 호환 버전
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
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f8f9fa;">
    
    <!-- 메인 컨테이너 -->
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 800px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        
        <!-- 헤더 -->
        <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
                <h1 style="margin: 0; font-size: 24px; font-weight: 600;">🎯 지원사업 분석 리포트</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 14px;">크리에이티브마루 맞춤 분석 결과 | ${new Date().toLocaleDateString('ko-KR')}</p>
            </td>
        </tr>
        
        <!-- 본문 -->
        <tr>
            <td style="padding: 30px;">
                
                <!-- 긴급 알림 -->
                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #fff3cd; border: 1px solid #ffeaa7; border-left: 4px solid #e17055; border-radius: 8px; margin: 20px 0;">
                    <tr>
                        <td style="padding: 20px;">
                            <h3 style="margin: 0 0 10px 0; color: #d63031; font-size: 16px;">🚨 긴급 확인 필요 (D-13일)</h3>
                            <p style="margin: 0; line-height: 1.5;">
                                <strong>초기창업패키지 브랜딩 지원사업</strong><br>
                                마감: 2025-06-30 | 지원금: 최대 5천만원<br>
                                브랜딩 관련도 높으나 창업사업 제한 적용 → <strong>금주 내 신청 여부 결정 필요</strong>
                            </p>
                        </td>
                    </tr>
                </table>
                
                <!-- 통계 그리드 -->
                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 20px 0;">
                    <tr>
                        <td width="23%" style="text-align: center; background: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef; margin-right: 2%;">
                            <p style="font-size: 28px; font-weight: 700; color: #495057; margin: 0;">3</p>
                            <p style="font-size: 12px; color: #6c757d; margin: 5px 0 0 0; text-transform: uppercase;">A+ 등급</p>
                        </td>
                        <td width="2%"></td>
                        <td width="23%" style="text-align: center; background: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef;">
                            <p style="font-size: 28px; font-weight: 700; color: #495057; margin: 0;">1</p>
                            <p style="font-size: 12px; color: #6c757d; margin: 5px 0 0 0; text-transform: uppercase;">B 등급</p>
                        </td>
                        <td width="2%"></td>
                        <td width="23%" style="text-align: center; background: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef;">
                            <p style="font-size: 28px; font-weight: 700; color: #495057; margin: 0;">6억원</p>
                            <p style="font-size: 12px; color: #6c757d; margin: 5px 0 0 0; text-transform: uppercase;">최대 지원금</p>
                        </td>
                        <td width="2%"></td>
                        <td width="23%" style="text-align: center; background: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef;">
                            <p style="font-size: 28px; font-weight: 700; color: #495057; margin: 0;">51점</p>
                            <p style="font-size: 12px; color: #6c757d; margin: 5px 0 0 0; text-transform: uppercase;">평균 관련도</p>
                        </td>
                    </tr>
                </table>
                
                <h2 style="color: #2d3436; margin: 30px 0 20px 0;">🏆 A+ 등급 사업 (즉시 신청 권장)</h2>
                
                <!-- A+ 사업 1: 수출바우처 -->
                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #e9ecef; border-left: 5px solid #00b894; border-radius: 8px; margin: 15px 0; overflow: hidden;">
                    <tr>
                        <td style="padding: 20px;">
                            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                <tr>
                                    <td>
                                        <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #2d3436;">수출바우처 지원사업 (해외마케팅)</h3>
                                        <p style="margin: 0 0 15px 0; font-size: 14px; color: #636e72;">수출바우처</p>
                                    </td>
                                    <td style="text-align: right;">
                                        <span style="background: #00b894; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">A+ 등급</span>
                                        <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: 700; color: #2d3436;">100점</p>
                                    </td>
                                </tr>
                            </table>
                            
                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 15px 0;">
                                <tr>
                                    <td style="font-size: 14px; color: #636e72; font-weight: 500; padding: 4px 0;">마감일:</td>
                                    <td style="font-size: 14px; color: #2d3436; font-weight: 600; text-align: right; padding: 4px 0;">2025-12-31 (D-197)</td>
                                </tr>
                                <tr>
                                    <td style="font-size: 14px; color: #636e72; font-weight: 500; padding: 4px 0;">지원금액:</td>
                                    <td style="font-size: 14px; color: #2d3436; font-weight: 600; text-align: right; padding: 4px 0;">최대 3억원</td>
                                </tr>
                            </table>
                            
                            <p style="margin: 15px 0; font-size: 14px;">
                                <span style="background: #f1f3f4; color: #5f6368; padding: 4px 8px; margin: 2px; border-radius: 12px; font-size: 12px;">#홈페이지</span>
                                <span style="background: #f1f3f4; color: #5f6368; padding: 4px 8px; margin: 2px; border-radius: 12px; font-size: 12px;">#브랜딩</span>
                                <span style="background: #f1f3f4; color: #5f6368; padding: 4px 8px; margin: 2px; border-radius: 12px; font-size: 12px;">#카탈로그</span>
                                <span style="background: #f1f3f4; color: #5f6368; padding: 4px 8px; margin: 2px; border-radius: 12px; font-size: 12px;">#수출</span>
                                <span style="background: #f1f3f4; color: #5f6368; padding: 4px 8px; margin: 2px; border-radius: 12px; font-size: 12px;">#마케팅</span>
                            </p>
                            
                            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; font-size: 14px; color: #495057; border-left: 3px solid #6c757d;">
                                <strong>액션플랜:</strong> 즉시 신청서 작성 및 제출 권장
                            </div>
                        </td>
                    </tr>
                </table>
                
                <!-- A+ 사업 2: 디자인전문기업 -->
                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #e9ecef; border-left: 5px solid #00b894; border-radius: 8px; margin: 15px 0; overflow: hidden;">
                    <tr>
                        <td style="padding: 20px;">
                            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                <tr>
                                    <td>
                                        <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #2d3436;">디자인전문기업 지정 지원사업</h3>
                                        <p style="margin: 0 0 15px 0; font-size: 14px; color: #636e72;">한국디자인진흥원</p>
                                    </td>
                                    <td style="text-align: right;">
                                        <span style="background: #00b894; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">A+ 등급</span>
                                        <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: 700; color: #2d3436;">100점</p>
                                    </td>
                                </tr>
                            </table>
                            
                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 15px 0;">
                                <tr>
                                    <td style="font-size: 14px; color: #636e72; font-weight: 500; padding: 4px 0;">마감일:</td>
                                    <td style="font-size: 14px; color: #2d3436; font-weight: 600; text-align: right; padding: 4px 0;">2025-08-15 (D-59)</td>
                                </tr>
                                <tr>
                                    <td style="font-size: 14px; color: #636e72; font-weight: 500; padding: 4px 0;">지원금액:</td>
                                    <td style="font-size: 14px; color: #2d3436; font-weight: 600; text-align: right; padding: 4px 0;">최대 1억원</td>
                                </tr>
                            </table>
                            
                            <p style="margin: 15px 0; font-size: 14px;">
                                <span style="background: #f1f3f4; color: #5f6368; padding: 4px 8px; margin: 2px; border-radius: 12px; font-size: 12px;">#디자인</span>
                                <span style="background: #f1f3f4; color: #5f6368; padding: 4px 8px; margin: 2px; border-radius: 12px; font-size: 12px;">#브랜딩</span>
                                <span style="background: #f1f3f4; color: #5f6368; padding: 4px 8px; margin: 2px; border-radius: 12px; font-size: 12px;">#UI/UX</span>
                            </p>
                            
                            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; font-size: 14px; color: #495057; border-left: 3px solid #6c757d;">
                                <strong>액션플랜:</strong> 즉시 신청서 작성 및 제출 권장
                            </div>
                        </td>
                    </tr>
                </table>
                
                <!-- A+ 사업 3: 혁신바우처 -->
                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #e9ecef; border-left: 5px solid #00b894; border-radius: 8px; margin: 15px 0; overflow: hidden;">
                    <tr>
                        <td style="padding: 20px;">
                            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                <tr>
                                    <td>
                                        <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #2d3436;">중소기업 혁신바우처 지원사업</h3>
                                        <p style="margin: 0 0 15px 0; font-size: 14px; color: #636e72;">혁신바우처</p>
                                    </td>
                                    <td style="text-align: right;">
                                        <span style="background: #00b894; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">A+ 등급</span>
                                        <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: 700; color: #2d3436;">100점</p>
                                    </td>
                                </tr>
                            </table>
                            
                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 15px 0;">
                                <tr>
                                    <td style="font-size: 14px; color: #636e72; font-weight: 500; padding: 4px 0;">마감일:</td>
                                    <td style="font-size: 14px; color: #2d3436; font-weight: 600; text-align: right; padding: 4px 0;">상시모집</td>
                                </tr>
                                <tr>
                                    <td style="font-size: 14px; color: #636e72; font-weight: 500; padding: 4px 0;">지원금액:</td>
                                    <td style="font-size: 14px; color: #2d3436; font-weight: 600; text-align: right; padding: 4px 0;">최대 2억원</td>
                                </tr>
                            </table>
                            
                            <p style="margin: 15px 0; font-size: 14px;">
                                <span style="background: #f1f3f4; color: #5f6368; padding: 4px 8px; margin: 2px; border-radius: 12px; font-size: 12px;">#디자인</span>
                                <span style="background: #f1f3f4; color: #5f6368; padding: 4px 8px; margin: 2px; border-radius: 12px; font-size: 12px;">#홈페이지</span>
                                <span style="background: #f1f3f4; color: #5f6368; padding: 4px 8px; margin: 2px; border-radius: 12px; font-size: 12px;">#브랜딩</span>
                                <span style="background: #f1f3f4; color: #5f6368; padding: 4px 8px; margin: 2px; border-radius: 12px; font-size: 12px;">#UI/UX</span>
                                <span style="background: #f1f3f4; color: #5f6368; padding: 4px 8px; margin: 2px; border-radius: 12px; font-size: 12px;">#마케팅</span>
                            </p>
                            
                            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; font-size: 14px; color: #495057; border-left: 3px solid #6c757d;">
                                <strong>액션플랜:</strong> 즉시 신청서 작성 및 제출 권장
                            </div>
                        </td>
                    </tr>
                </table>
                
                <h2 style="color: #2d3436; margin: 30px 0 20px 0;">📋 B 등급 사업 (검토 후 신청)</h2>
                
                <!-- B 등급 사업: 경남 스마트제조 -->
                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #e9ecef; border-left: 5px solid #fdcb6e; border-radius: 8px; margin: 15px 0; overflow: hidden;">
                    <tr>
                        <td style="padding: 20px;">
                            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                <tr>
                                    <td>
                                        <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #2d3436;">경남 스마트제조 디지털전환 지원사업</h3>
                                        <p style="margin: 0 0 15px 0; font-size: 14px; color: #636e72;">경남테크노파크</p>
                                    </td>
                                    <td style="text-align: right;">
                                        <span style="background: #fdcb6e; color: #2d3436; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">B 등급</span>
                                        <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: 700; color: #2d3436;">70점</p>
                                    </td>
                                </tr>
                            </table>
                            
                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 15px 0;">
                                <tr>
                                    <td style="font-size: 14px; color: #636e72; font-weight: 500; padding: 4px 0;">마감일:</td>
                                    <td style="font-size: 14px; color: #2d3436; font-weight: 600; text-align: right; padding: 4px 0;">2025-09-30 (D-105)</td>
                                </tr>
                                <tr>
                                    <td style="font-size: 14px; color: #636e72; font-weight: 500; padding: 4px 0;">지원금액:</td>
                                    <td style="font-size: 14px; color: #2d3436; font-weight: 600; text-align: right; padding: 4px 0;">최대 2억원</td>
                                </tr>
                            </table>
                            
                            <p style="margin: 15px 0; font-size: 14px;">
                                <span style="background: #f1f3f4; color: #5f6368; padding: 4px 8px; margin: 2px; border-radius: 12px; font-size: 12px;">#홈페이지</span>
                                <span style="background: #f1f3f4; color: #5f6368; padding: 4px 8px; margin: 2px; border-radius: 12px; font-size: 12px;">#브랜딩</span>
                            </p>
                            
                            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; font-size: 14px; color: #495057; border-left: 3px solid #6c757d;">
                                <strong>액션플랜:</strong> 신청 검토 및 담당자 문의
                            </div>
                        </td>
                    </tr>
                </table>
                
                <!-- CTA 버튼 -->
                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 30px 0; text-align: center;">
                    <tr>
                        <td>
                            <a href="https://www.mssmiv.com/portal/Main" style="background: #00b894; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 10px 5px; display: inline-block;">💼 혁신바우처 신청하기</a>
                            <a href="https://www.kidp.or.kr/?menuno=773" style="background: #00b894; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 10px 5px; display: inline-block;">🎨 디자인전문기업 신청하기</a>
                        </td>
                    </tr>
                </table>
                
            </td>
        </tr>
        
        <!-- 푸터 -->
        <tr>
            <td style="background: #f8f9fa; padding: 20px 30px; text-align: center; font-size: 12px; color: #6c757d; border-top: 1px solid #e9ecef;">
                <p style="margin: 0;"><strong>크리에이티브마루</strong> | 경상남도 창원<br>
                📧 pm@cmaru.com | 🌐 홈페이지제작·카탈로그제작·브랜드마케팅<br>
                <small>본 메일은 GPT 자동분석 시스템에 의해 생성되었습니다.</small></p>
            </td>
        </tr>
        
    </table>
    
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
