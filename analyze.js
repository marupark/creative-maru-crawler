// analyze.js

function analyzeNoticeEnhanced(title, content, agency) {
  let score = 0;
  const keywords = [];

  const fullText = `${title} ${content} ${agency}`.toLowerCase();

  const keywordWeights = [
    { word: '경남', weight: 10 },
    { word: '창원', weight: 10 },
    { word: '중소기업', weight: 5 },
    { word: '디자인', weight: 7 },
    { word: '홈페이지', weight: 5 },
    { word: '수출바우처', weight: 10 },
    { word: '브랜드', weight: 5 },
    { word: '마케팅', weight: 5 },
    { word: '바우처', weight: 5 },
    { word: '온라인', weight: 3 }
  ];

  for (const { word, weight } of keywordWeights) {
    if (fullText.includes(word)) {
      score += weight;
      keywords.push(word);
    }
  }

  return {
    score,
    keywords
  };
}

module.exports = {
  analyzeNoticeEnhanced
};
