// send-email.js - 간단한 버전
const nodemailer = require('nodemailer');

async function sendEmail() {
  try {
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

    const htmlTemplate = `
    <!-- 여기에 HTML 메일 템플릿 -->
    `;

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.RECIPIENT_EMAIL || 'pm@cmaru.com',
      subject: '[GPT 자동분석] 2025년 지원사업 요약 리포트',
      html: htmlTemplate,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ 메일 발송 성공:', result.messageId);
    
  } catch (error) {
    console.error('❌ 메일 발송 실패:', error);
    throw error;
  }
}

sendEmail();
