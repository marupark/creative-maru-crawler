// send-email.js - 지식재산 확장 버전
const nodemailer = require('nodemailer');

// 키워드 점수 체계 확장
const keywordScores = {
  // 1순위 핵심 키워드 (30점)
  "디자인": 30, "디자인개발": 30, "시각디자인": 30, "그래픽디자인": 30, "로고디자인": 30, "패키지디자인": 30,
  "홈페이지": 30, "홈페이지제작": 30, "웹사이트": 30, "웹사이트제작": 30,
  
  // 2순위 중요 키워드 (20점)
  "UI": 20, "UX": 20, "UI/UX": 20, "사용자경험": 20, "웹디자인": 20,
  "브랜드": 20, "브랜딩": 20, "브랜드구축": 20, "기업이미지": 20,
  "카탈로그": 20, "카탈로그제작": 20, "브로슈어": 20,
  "수출": 20, "해외진출": 20, "글로벌마케팅": 20, "수출지원": 20, "해외마케팅": 20,
  
  // 🆕 지식재산 관련 키워드 (25점) - 높은 점수
  "지식재산": 25, "IP": 25, "특허": 25, "상표": 25, "디자인권": 25, "저작권": 25,
  "IP나래": 25, "지식재산긴급지원": 25, "특허출원": 25, "상표등록": 25,
  
  // 3순위 관련 키워드 (10-15점)
  "웹개발": 15, "웹구축": 15, "반응형웹": 15, "웹시스템": 15,
  "CI": 15, "BI": 15, "CI/BI": 15, "기업아이덴티티": 15,
  "인쇄": 10, "인쇄물": 10, "리플릿": 10,
  "마케팅": 10, "홍보": 10, "온라인마케팅": 10,
  "바우처": 10, "혁신바우처": 10, "수출바우처": 10,
  
  // 🆕 경남 관련 키워드 (15점) - 지역 가산점 확대
  "경남": 15, "경상남도": 15, "창원": 15, "경남센터": 15, "경남테크노파크": 15
};

// 창업/스타트업 제외 키워드
const startupKeywords = ["스타트업", "창업", "멘토링", "K-스타트업", "인큐베이팅"];

// 🆕 마감일 계산 함수
function calculateDaysUntilDeadline(deadlineStr) {
  if (!deadlineStr) return 999;
  
  // 다양한 날짜 형식 처리
  const today = new Date();
  let deadline;
  
  // "2025-06-30", "2025.06.30", "상시모집" 등 처리
  if (deadlineStr.includes("상시") || deadlineStr.includes("수시")) {
    return 999; // 상시모집은 긴급하지 않음
  }
  
  // 날짜 파싱
  const dateMatch = deadlineStr.match(/(\d{4})[-.](\d{1,2})[-.](\d{1,2})/);
  if (dateMatch) {
    deadline = new Date(dateMatch[1], dateMatch[2] - 1, dateMatch[3]);
  } else {
    return 999; // 파싱 실패시 긴급하지 않음으로 처리
  }
  
  const timeDiff = deadline.getTime() - today.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  return daysDiff;
}

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
      
      // 🆕 자동 태그 생성
      if (keyword.includes("경남") || keyword.includes("창원")) {
        tags.push("#경남센터");
      }
      if (keyword.includes("IP") || keyword.includes("지식재산") || keyword.includes("특허")) {
        tags.push("#지식재산");
      }
      if (keyword.includes("IP나래")) {
        tags.push("#IP나래");
      }
      if (keyword.includes("지식재산긴급지원")) {
        tags.push("#지식재산긴급지원");
      }
    }
  }
  
  // 기본 태그 추가
  if (allText.includes("디자인")) tags.push("#디자인");
  if (allText.includes("홈페이지") || allText.includes("웹사이트")) tags.push("#홈페이지");
  if (allText.includes("브랜드")) tags.push("#브랜딩");
  if (allText.includes("카탈로그")) tags.push("#카탈로그");
  if (allText.includes("수출")) tags.push("#수출");
  if (allText.includes("바우처")) tags.push("#바우처");
  
  // 최대 100점 제한
  if (score > 100) score = 100;
  
  // 강제 보정 규칙 적용
  const isStartup = startupKeywords.some(keyword => allText.includes(keyword.toLowerCase()));
  if (isStartup) {
    score = Math.min(score, 30);
  }
  
  // 디자인 키워드 포함 사업: 최소 60점 보장
  const hasDesignKeyword = ["디자인", "UI/UX", "브랜딩"].some(keyword => 
    allText.includes(keyword.toLowerCase())
  );
  if (hasDesignKeyword && !isStartup) {
    score = Math.max(score, 60);
  }
  
  // 🆕 마감일 기반 긴급도 판정
  const daysUntil = calculateDaysUntilDeadline(deadline);
  const isUrgent = daysUntil <= 14; // D-14 이내
  
  return { 
    score: Math.floor(score), 
    foundKeywords, 
    isStartup, 
    tags: [...new Set(tags)], // 중복 제거
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
  // 🆕 긴급도 우선 반영
  if (isUrgent) {
    return "긴급 확인 필요";
  }
  
  switch(grade) {
    case "A+": return "즉시 신청서 작성 및 제출 권장";
    case "A": return "상세 검토 후 신청 준비";
    case "B": return "신청 검토 및 담당자 문의";
    case "C": return "관심 대상, 모니터링";
    case "D": return "낮은 우선순위, 참고용";
    case "E": return "제외 대상";
  }
}

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

    // 🆕 샘플 데이터에 지식재산 사업 추가
    const projects = [
      {
        title: "초기창업패키지 브랜딩 지원사업",
        agency: "K-스타트업", 
        content: "초기창업기업 브랜드 구축을 위한 로고 디자인, 홈페이지 제작, 마케팅 콘텐츠 제작 지원",
        keywords: "브랜딩, 로고디자인, 홈페이지, 마케팅",
        deadline: "2025-06-30"
      },
      {
        title: "수출바우처 지원사업 (해외마케팅)",
        agency: "수출바우처",
        content: "해외 진출을 위한 홈페이지 다국어 구축, 카탈로그 제작, 브랜드 마케팅 지원",
        keywords: "홈페이지, 카탈로그, 해외마케팅, 브랜드",
        deadline: "2025-12-31"
      },
      {
        title: "디자인전문기업 지정 지원사업",
        agency: "한국디자인진흥원",
        content: "디자인 전문기업 육성을 위한 브랜드 개발, 패키지 디자인, UI/UX 디자인 프로젝트 지원",
        keywords: "디자인, 브랜드, 패키지디자인, UI/UX",
        deadline: "2025-08-15"
      },
      {
        title: "중소기업 혁신바우처 지원사업",
        agency: "혁신바우처",
        content: "R&D, 마케팅, 디자인 등 기술개발 및 혁신활동 지원. UI/UX 개선, 웹사이트 구축, 브랜드 개발 포함",
        keywords: "UI/UX, 웹디자인, 브랜드",
        deadline: "상시모집"
      },
      // 🆕 지식재산 관련 사업 추가
      {
        title: "경남 IP나래 지식재산 긴급지원사업",
        agency: "경남센터",
        content: "중소기업 지식재산 출원 및 등록 지원, 특허 상표 디자인권 등록 비용 지원",
        keywords: "지식재산, IP, 특허, 상표, 디자인권, IP나래",
        deadline: "2025-06-25"
      },
      {
        title: "경남 스마트제조 디지털전환 지원사업",
        agency: "경남테크노파크",
        content: "제조기업 디지털 전환을 위한 웹기반 관리시스템, 모니터링 대시보드, 브랜드 웹사이트 구축 지원",
        keywords: "디지털전환, 스마트팩토리, 웹시스템, 경남",
        deadline: "2025-09-30"
      }
    ];

    // 분석 실행
    const results = [];
    let urgentCount = 0;
    let aPlusCount = 0;
    let ipRelatedCount = 0;

    projects.forEach(project => {
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
        foundKeywords: analysis.foundKeywords
      };
      
      results.push(result);
      
      // 통계 집계
      if (analysis.isUrgent) urgentCount++;
      if (grade === "A+") aPlusCount++;
      if (analysis.tags.some(tag => tag.includes("지식재산") || tag.includes("IP"))) ipRelatedCount++;
    });

    // 🆕 긴급 사업과 A+ 사업 분리
    const urgentProjects = results.filter(r => r.isUrgent);
    const aPlusProjects = results.filter(r => r.grade === "A+" && !r.isUrgent);
    const ipProjects = results.filter(r => r.tags.includes("#지식재산") || r.tags.includes("#IP나래"));

    const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f8f9fa;">
    
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 800px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        
        <!-- 헤더 -->
        <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
                <h1 style="margin: 0; font-size: 24px; font-weight: 600;">지원사업 분석 리포트 (확장판)</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 14px;">크리에이티브마루 + 지식재산 특화 분석 | ${new Date().toLocaleDateString('ko-KR')}</p>
            </td>
        </tr>
        
        <tr>
            <td style="padding: 30px;">
                
                <!-- 🆕 긴급 사업 섹션 -->
                ${urgentProjects.length > 0 ? `
                <h2 style="color: #d63031; margin: 0 0 20px 0; background: #fff3cd; padding: 10px 15px; border-radius: 6px; border-left: 4px solid #e17055;">긴급 확인 필요 (D-14 이내)</h2>
                ${urgentProjects.map(project => `
                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #fff3cd; border: 1px solid #ffeaa7; border-left: 5px solid #d63031; border-radius: 8px; margin: 15px 0;">
                    <tr>
                        <td style="padding: 20px;">
                            <h3 style="margin: 0 0 8px 0; color: #d63031;">${project.title}</h3>
                            <p style="margin: 0 0 10px 0; font-size: 14px; color: #636e72;">${project.agency} | ${project.deadline} (D-${project.daysUntil})</p>
                            <p style="margin: 0; font-size: 14px;">${project.tags}</p>
                            <div style="background: #f8d7da; padding: 10px; margin: 10px 0; border-radius: 4px; color: #721c24;">
                                <strong>액션플랜:</strong> ${project.actionPlan}
                            </div>
                        </td>
                    </tr>
                </table>
                `).join('')}
                ` : ''}
                
                <!-- 통계 -->
                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 20px 0;">
                    <tr>
                        <td width="23%" style="text-align: center; background: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef;">
                            <p style="font-size: 28px; font-weight: 700; color: #d63031; margin: 0;">${urgentCount}</p>
                            <p style="font-size: 12px; color: #6c757d; margin: 5px 0 0 0;">긴급 사업</p>
                        </td>
                        <td width="2%"></td>
                        <td width="23%" style="text-align: center; background: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef;">
                            <p style="font-size: 28px; font-weight: 700; color: #00b894; margin: 0;">${aPlusCount}</p>
                            <p style="font-size: 12px; color: #6c757d; margin: 5px 0 0 0;">A+ 등급</p>
                        </td>
                        <td width="2%"></td>
                        <td width="23%" style="text-align: center; background: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef;">
                            <p style="font-size: 28px; font-weight: 700; color: #6f42c1; margin: 0;">${ipRelatedCount}</p>
                            <p style="font-size: 12px; color: #6c757d; margin: 5px 0 0 0;">지식재산 사업</p>
                        </td>
                        <td width="2%"></td>
                        <td width="23%" style="text-align: center; background: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef;">
                            <p style="font-size: 28px; font-weight: 700; color: #495057; margin: 0;">${results.length}</p>
                            <p style="font-size: 12px; color: #6c757d; margin: 5px 0 0 0;">총 사업</p>
                        </td>
                    </tr>
                </table>
                
                <!-- 🆕 지식재산 특화 섹션 -->
                ${ipProjects.length > 0 ? `
                <h2 style="color: #6f42c1; margin: 30px 0 20px 0; background: #e9ecef; padding: 10px 15px; border-radius: 6px; border-left: 5px solid #6f42c1;">지식재산 특화 사업</h2>
                ${ipProjects.map(project => `
                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #e9ecef; border-left: 5px solid #6f42c1; border-radius: 8px; margin: 15px 0;">
                    <tr>
                        <td style="padding: 20px;">
                            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                <tr>
                                    <td>
                                        <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #2d3436;">${project.title}</h3>
                                        <p style="margin: 0 0 15px 0; font-size: 14px; color: #636e72;">${project.agency}</p>
                                    </td>
                                    <td style="text-align: right;">
                                        <span style="background: #6f42c1; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px;">${project.grade} 등급</span>
                                        <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: 700; color: #2d3436;">${project.score}점</p>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin: 15px 0; font-size: 14px; color: #6f42c1; font-weight: 600;">${project.tags}</p>
                            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; font-size: 14px; color: #495057; border-left: 3px solid #6f42c1;">
                                <strong>액션플랜:</strong> ${project.actionPlan}
                            </div>
                        </td>
                    </tr>
                </table>
                `).join('')}
                ` : ''}
                
                <!-- A+ 등급 사업 -->
                ${aPlusProjects.length > 0 ? `
                <h2 style="color: #00b894; margin: 30px 0 20px 0; background: #d1ecf1; padding: 10px 15px; border-radius: 6px; border-left: 5px solid #00b894;">A+ 등급 사업 (즉시 신청 권장)</h2>
                ${aPlusProjects.map(project => `
                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: white; border: 1px solid #e9ecef; border-left: 5px solid #00b894; border-radius: 8px; margin: 15px 0;">
                    <tr>
                        <td style="padding: 20px;">
                            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                <tr>
                                    <td>
                                        <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #2d3436;">${project.title}</h3>
                                        <p style="margin: 0 0 15px 0; font-size: 14px; color: #636e72;">${project.agency}</p>
                                    </td>
                                    <td style="text-align: right;">
                                        <span style="background: #00b894; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px;">${project.grade} 등급</span>
                                        <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: 700; color: #2d3436;">${project.score}점</p>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin: 15px 0; font-size: 14px;">${project.tags}</p>
                            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; font-size: 14px; color: #495057; border-left: 3px solid #00b894;">
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
            <td style="background: #f8f9fa; padding: 20px 30px; text-align: center; font-size: 12px; color: #6c757d; border-top: 1px solid #e9ecef;">
                <p style="margin: 0;"><strong>크리에이티브마루</strong> | 경상남도 창원<br>
                이메일: pm@cmaru.com | 사업분야: 홈페이지제작, 카탈로그제작, 브랜드마케팅, 지식재산<br>
                <small>본 메일은 GPT 자동분석 시스템(확장판)에 의해 생성되었습니다.</small></p>
            </td>
        </tr>
        
    </table>
    
</body>
</html>
    `;

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.RECIPIENT_EMAIL || 'pm@cmaru.com',
      subject: '[GPT 자동분석] 지원사업 요약 리포트 (지식재산 확장판)',
      html: htmlTemplate,
    };

    console.log(`📮 발송 대상: ${mailOptions.to}`);
    console.log(`🚨 긴급 사업: ${urgentCount}개`);
    console.log(`⭐ A+ 사업: ${aPlusCount}개`);
    console.log(`🎯 지식재산 사업: ${ipRelatedCount}개`);
    
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
