// analyze.js - 점수 계산 전용 모듈

function calculateScore(title, content, agency) {
    let score = 20;
    const text = `${title} ${content}`.toLowerCase();

    const keywordWeights = {
        '디자인': 15, '브랜딩': 15, '홈페이지': 12,
        '카탈로그': 10, 'ui/ux': 13, '수출': 7,
        '혁신': 6, '경남': 6, '전국': 3
    };

    Object.entries(keywordWeights).forEach(([kw, w]) => {
        if (text.includes(kw.toLowerCase())) score += w;
    });

    if (agency.includes('산업통상자원부')) score += 8;
    if (agency.includes('경상남도')) score += 10;

    return Math.min(score, 100);
}

module.exports = { calculateScore };
