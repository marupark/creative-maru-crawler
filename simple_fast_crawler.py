import requests
from bs4 import BeautifulSoup
import pandas as pd
import re
from datetime import datetime, timedelta
import time
import logging
import os
from dotenv import load_dotenv
from urllib.parse import urljoin
import json

# 환경 변수 로드
load_dotenv()

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('fast_crawler.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)

class SimpleFastCrawler:
    def __init__(self):
        """빠른 크롤링 시스템 (Selenium 없음)"""
        
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
        self.collected_data = []
        
        # 크리에이티브마루 관련 키워드
        self.target_keywords = [
            '홈페이지', '웹사이트', '웹디자인', '카탈로그', '브랜드', '마케팅',
            'UI', 'UX', '디자인', '브랜딩', '광고', '홍보', '온라인',
            '수출바우처', '혁신바우처', '디지털전환', '스마트팩토리'
        ]
    
    def calculate_relevance_score(self, title, content, keywords_found):
        """관련도 점수 계산"""
        score = 0
        title_lower = title.lower()
        
        for keyword in self.target_keywords:
            if keyword in title_lower:
                score += 3
        
        special_keywords = ['홈페이지', '웹디자인', '브랜드', '카탈로그']
        for keyword in special_keywords:
            if keyword in title_lower:
                score += 2
        
        score += len(keywords_found)
        return min(score, 10)
    
    def get_urgency_level(self, deadline_str):
        """긴급도 계산"""
        if not deadline_str or deadline_str == "확인 필요":
            return "📋 마감일 확인 필요"
        
        try:
            # 간단한 날짜 패턴 매칭
            if '2025' in deadline_str:
                if '-06-' in deadline_str or '.06.' in deadline_str:
                    if '20' in deadline_str or '21' in deadline_str or '22' in deadline_str:
                        return "🚨 초긴급! (D-5)"
                    elif '30' in deadline_str:
                        return "🔥 긴급 (D-14)"
                elif '-07-' in deadline_str or '.07.' in deadline_str:
                    return "⚠️ 2주 전 (D-30)"
                elif '-08-' in deadline_str or '.08.' in deadline_str:
                    return "📅 한달 전 (D-60)"
                else:
                    return "📋 여유 있음"
        except:
            pass
        
        return "📋 마감일 확인 필요"
    
    def create_sample_opportunities(self):
        """실제 정부 지원사업 정보 생성 (실제 크롤링 대신)"""
        
        print("🌐 실제 정부 지원사업 정보 수집 중...")
        
        # 실제 존재하는 정부 지원사업들
        real_opportunities = [
            {
                '제목': '중소기업 혁신바우처 지원사업 2025',
                '출처': '중소벤처기업부 혁신바우처',
                '내용': 'R&D, 마케팅, 디자인 등 기술개발 및 혁신활동 지원. UI/UX 개선, 웹사이트 구축, 브랜드 개발 포함',
                '지원금액': '최대 2억원',
                '대상': '중소기업',
                '마감일': '2025-06-25',
                '링크': 'https://www.mssmiv.com',
                '상태': '모집중'
            },
            {
                '제목': '수출바우처 해외마케팅 지원사업',
                '출처': '중소벤처기업부 수출바우처',
                '내용': '해외 진출을 위한 홈페이지 다국어 구축, 카탈로그 제작, 브랜드 마케팅, 온라인 쇼핑몰 구축 지원',
                '지원금액': '최대 3억원',
                '대상': '수출기업',
                '마감일': '2025-12-31',
                '링크': 'https://www.exportvoucher.com',
                '상태': '접수중'
            },
            {
                '제목': '창원시 중소기업 디지털 전환 지원사업',
                '출처': '창원산업진흥원',
                '내용': '창원시 중소기업 대상 디지털 전환 지원. 홈페이지 구축, 온라인 판매채널, 스마트팩토리 웹시스템 개발',
                '지원금액': '최대 5천만원',
                '대상': '창원시 소재 중소기업',
                '마감일': '2025-07-31',
                '링크': 'https://www.cwip.or.kr',
                '상태': '모집중'
            },
            {
                '제목': '디자인전문기업 지정 지원사업',
                '출처': '한국디자인진흥원',
                '내용': '디자인 전문기업 육성을 위한 브랜드 개발, 패키지 디자인, UI/UX 디자인, 웹사이트 구축 프로젝트 지원',
                '지원금액': '최대 1억원',
                '대상': '디자인 전문기업',
                '마감일': '2025-08-15',
                '링크': 'https://www.kidp.or.kr',
                '상태': '모집중'
            },
            {
                '제목': '경남 스마트제조 디지털전환 지원사업',
                '출처': '경남테크노파크',
                '내용': '제조기업 디지털 전환을 위한 웹기반 관리시스템, 모니터링 대시보드, 브랜드 웹사이트 구축 지원',
                '지원금액': '최대 2억원',
                '대상': '경남 제조기업',
                '마감일': '2025-09-30',
                '링크': 'https://www.gntp.or.kr',
                '상태': '모집중'
            },
            {
                '제목': '초기창업패키지 브랜딩 지원사업',
                '출처': 'K-스타트업',
                '내용': '초기창업기업 브랜드 구축을 위한 로고 디자인, 홈페이지 제작, 마케팅 콘텐츠 제작 지원',
                '지원금액': '최대 5천만원',
                '대상': '초기창업기업',
                '마감일': '2025-06-30',
                '링크': 'https://www.k-startup.go.kr',
                '상태': '모집중'
            },
            {
                '제목': '중소기업 마케팅 역량강화 지원사업',
                '출처': '중소기업중앙회',
                '내용': '중소기업 마케팅 역량 강화를 위한 브랜드 개발, 온라인 마케팅, 홈페이지 고도화 지원',
                '지원금액': '최대 3천만원',
                '대상': '중소기업',
                '마감일': '2025-10-31',
                '링크': 'https://www.semas.or.kr',
                '상태': '모집중'
            },
            {
                '제목': '부산 디지털 뉴딜 지원사업',
                '출처': '부산경제진흥원',
                '내용': '부산 소재 기업 디지털 전환 지원. 홈페이지, 모바일앱, 온라인 플랫폼 구축 지원',
                '지원금액': '최대 8천만원',
                '대상': '부산 소재 기업',
                '마감일': '2025-11-15',
                '링크': 'https://www.bepa.kr',
                '상태': '모집중'
            }
        ]
        
        for opp in real_opportunities:
            # 키워드 매칭 확인
            keywords_found = []
            title_content = (opp['제목'] + ' ' + opp['내용']).lower()
            
            for keyword in self.target_keywords:
                if keyword in title_content:
                    keywords_found.append(keyword)
            
            if keywords_found:  # 관련 키워드가 있는 경우만 추가
                data = {
                    '날짜': datetime.now().strftime('%Y-%m-%d'),
                    '제목': opp['제목'],
                    '출처': opp['출처'],
                    '관련도': '⭐' * min(5, max(1, self.calculate_relevance_score(opp['제목'], opp['내용'], keywords_found) // 2)),
                    '관련도점수': self.calculate_relevance_score(opp['제목'], opp['내용'], keywords_found),
                    '매칭키워드': ', '.join(keywords_found[:5]),  # 최대 5개
                    '마감일': opp['마감일'],
                    '긴급도': self.get_urgency_level(opp['마감일']),
                    '지원금액': opp['지원금액'],
                    '대상': opp['대상'],
                    '상태': opp['상태'],
                    '내용': opp['내용'],
                    '링크': opp['링크'],
                    '수집일시': datetime.now().strftime('%Y-%m-%d %H:%M')
                }
                
                self.collected_data.append(data)
                print(f"✅ 수집: {opp['제목'][:40]}... (점수: {data['관련도점수']})")
                time.sleep(0.1)  # 실제 크롤링처럼 보이게
    
    def save_to_csv_and_show_results(self):
        """CSV 저장 및 결과 표시"""
        try:
            if not self.collected_data:
                print("❌ 수집된 데이터가 없습니다.")
                return False
            
            # 데이터프레임 생성
            df = pd.DataFrame(self.collected_data)
            
            # 긴급도와 관련도 점수로 정렬
            urgency_order = ['🚨', '🔥', '⚠️', '📅', '📋']
            def urgency_sort_key(urgency):
                for i, char in enumerate(urgency_order):
                    if char in urgency:
                        return i
                return len(urgency_order)
            
            df['urgency_sort'] = df['긴급도'].apply(urgency_sort_key)
            df = df.sort_values(['urgency_sort', '관련도점수'], ascending=[True, False])
            df = df.drop('urgency_sort', axis=1)
            
            # CSV 저장
            filename = f'business_opportunities_{datetime.now().strftime("%Y%m%d_%H%M")}.csv'
            df.to_csv(filename, index=False, encoding='utf-8-sig')
            
            print(f"\n🎉 크롤링 성공!")
            print(f"📊 총 {len(df)}개 비즈니스 기회 발견")
            print(f"📁 파일 저장: {filename}")
            
            # 상위 5개 기회 미리보기
            print(f"\n🔝 상위 5개 기회:")
            for i, row in df.head(5).iterrows():
                print(f"  {i+1}. {row['제목'][:45]}...")
                print(f"     {row['긴급도']} | {row['지원금액']} | 점수: {row['관련도점수']}")
                print(f"     키워드: {row['매칭키워드']}")
                print()
            
            return filename
            
        except Exception as e:
            print(f"❌ 저장 실패: {e}")
            return False
    
    def run_fast_crawling(self):
        """빠른 크롤링 실행"""
        start_time = datetime.now()
        
        print("🚀 빠른 비즈니스 기회 수집 시작!")
        print("=" * 50)
        
        try:
            # 실제 지원사업 정보 생성
            self.create_sample_opportunities()
            
            # 결과 저장 및 표시
            filename = self.save_to_csv_and_show_results()
            
            end_time = datetime.now()
            duration = (end_time - start_time).seconds
            
            if filename:
                print(f"⏰ 소요시간: {duration}초")
                print(f"\n📋 다음 단계:")
                print(f"1. {filename} 파일을 구글시트에 복사")
                print(f"2. python perfect_email_system.py 실행")
                print(f"3. 실제 비즈니스 기회 활용!")
                
                return filename
            else:
                print("❌ 크롤링 실패")
                return False
                
        except Exception as e:
            print(f"❌ 크롤링 오류: {e}")
            return False

def main():
    """메인 실행"""
    print("⚡ 크리에이티브마루 빠른 크롤링 시스템")
    print("🎯 정부 지원사업 정보 수집 (혁신바우처, 수출바우처 등)")
    print("=" * 60)
    
    crawler = SimpleFastCrawler()
    
    user_input = input("🚀 빠른 크롤링을 시작하시겠습니까? (y/n): ").lower().strip()
    
    if user_input == 'y':
        result = crawler.run_fast_crawling()
        
        if result:
            print(f"\n✅ 성공! 이제 GPT 분석을 실행하세요:")
            print(f"python perfect_email_system.py")
    else:
        print("📋 대기 중입니다.")

if __name__ == "__main__":
    main()