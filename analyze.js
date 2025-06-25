// analyze.js - 크리에이티브마루 맞춤 점수 분석 로직

function analyzeNoticeEnhanced(title, content, agency) {
    let score = 20; // 기본 점수
    const text = `${title} ${content}`.toLowerCase();

    // 키워드별 가중치
    const keywordWeights = {
        '디자인': 15,
        '브랜딩': 15,
        '홈페이지': 12,
        '카탈로그': 10,
        'ui/ux': 13,
        '수출': 7,
        '혁신': 6,
        '경남': 6,
        '전국': 3
    };

    // 키워드 포함 여부 분석
    for (const [keyword, weight] of Object.entries(keywordWeights)) {
        if (text.includes(keyword.toLowerCase())) {
            score += weight;
        }
    }

    // 기관 기반 가산점
    if (agency.includes('산업통상자원부')) score += 8;
    if (agency.includes('경상남도')) score += 10;

    // 최대 점수 제한
    return Math.min(score, 100);
}

module.exports = { analyzeNoticeEnhanced };
