// ✅ [1] analyze.js — 점수 기준 완화 + 분석 상세화
function analyzeNoticeEnhanced(title, content, agency) {
  let score = 0;
  const keywords = [];

  const titleContent = `${title} ${content}`.toLowerCase();

  // 핵심 키워드 기반 점수 부여
  const keywordWeights = {
    "수출": 20,
    "디자인": 20,
    "홈페이지": 15,
    "브랜딩": 15,
    "카탈로그": 10,
    "온라인": 10,
    "동영상": 10,
    "콘텐츠": 10,
    "홍보": 10,
    "플랫폼": 5,
    "마케팅": 5
  };

  for (const [kw, pts] of Object.entries(keywordWeights)) {
    if (titleContent.includes(kw)) {
      score += pts;
      keywords.push(`#${kw}`);
    }
  }

  // 기관 신뢰도 가중치
  if (["디자인진흥원", "지역지식센터", "창원산업진흥원"].some(org => agency.includes(org))) {
    score += 10;
  }

  // 점수에 따라 등급 분류
  let grade = "D";
  if (score >= 70) grade = "A";
  else if (score >= 60) grade = "B";
  else if (score >= 40) grade = "C";

  return { score, grade, keywords };
}

module.exports = { analyzeNoticeEnhanced };
