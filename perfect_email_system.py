import os
import smtplib
import pandas as pd
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from openai import OpenAI
from dotenv import load_dotenv
import logging
import requests
from io import StringIO
import json

# 환경 변수 로드
load_dotenv()

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('email_sender.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)

class PerfectCreativeMaruSystem:
    def __init__(self):
        """완전 해결된 크리에이티브마루 시스템"""
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        self.gmail_user = os.getenv('GMAIL_USER')
        self.gmail_password = os.getenv('GMAIL_PASSWORD')
        self.recipient_email = os.getenv('RECIPIENT_EMAIL')
        self.google_sheet_url = os.getenv('GOOGLE_SHEET_URL')
        self.company_name = os.getenv('COMPANY_NAME', '크리에이티브마루')
        
        self.openai_client = OpenAI(api_key=self.openai_api_key)
        self._validate_config()
    
    def _validate_config(self):
        """설정 검증"""
        required_vars = ['OPENAI_API_KEY', 'GMAIL_USER', 'GMAIL_PASSWORD', 'RECIPIENT_EMAIL']
        missing_vars = [var for var in required_vars if not os.getenv(var)]
        
        if missing_vars:
            raise ValueError(f"환경 변수 누락: {', '.join(missing_vars)}")
        
        logging.info("✅ 설정 검증 완료")
    
    def load_data_perfectly(self):
        """완벽한 데이터 로딩 (인코딩 문제 완전 해결)"""
        try:
            if not self.google_sheet_url:
                return pd.DataFrame()
            
            # CSV URL 생성
            if '/edit' in self.google_sheet_url:
                csv_url = self.google_sheet_url.replace('/edit#gid=', '/export?format=csv&gid=')
                csv_url = csv_url.replace('/edit', '/export?format=csv')
            else:
                csv_url = self.google_sheet_url
            
            logging.info(f"📡 데이터 로딩 시작: {csv_url}")
            
            # 요청 및 UTF-8 디코딩
            response = requests.get(csv_url)
            response.raise_for_status()
            response.encoding = 'utf-8'
            
            # DataFrame 생성
            df = pd.read_csv(StringIO(response.text), encoding='utf-8')
            df = df.dropna(how='all')  # 빈 행 제거
            
            if not df.empty:
                logging.info(f"✅ 데이터 로딩 성공: {len(df)}개, 컬럼: {list(df.columns)}")
                return df
            else:
                logging.error("❌ 빈 데이터")
                return pd.DataFrame()
                
        except Exception as e:
            logging.error(f"❌ 데이터 로딩 실패: {e}")
            return pd.DataFrame()
    
    def create_safe_data_summary(self, data):
        """인코딩 안전한 데이터 요약 생성"""
        try:
            if data.empty:
                return "데이터 없음"
            
            # 안전한 데이터 요약 생성
            summary_items = []
            
            for idx, row in data.head(5).iterrows():
                item_info = f"\n=== {idx+1}번째 수집 정보 ==="
                
                # 각 컬럼의 데이터를 안전하게 추출
                for col in data.columns:
                    try:
                        value = row[col]
                        if pd.notna(value) and str(value).strip():
                            clean_value = str(value).strip()
                            if len(clean_value) > 0 and clean_value != 'nan':
                                # 너무 긴 내용은 줄이기
                                if len(clean_value) > 200:
                                    clean_value = clean_value[:200] + "..."
                                item_info += f"\n• {col}: {clean_value}"
                    except Exception:
                        continue
                
                summary_items.append(item_info)
            
            return "\n".join(summary_items)
            
        except Exception as e:
            logging.error(f"데이터 요약 생성 실패: {e}")
            return "데이터 요약 생성 중 오류 발생"
    
    def analyze_with_gpt(self, data):
        """GPT-4 분석 (완전한 데이터 전달)"""
        try:
            if data.empty:
                return "분석할 데이터가 없습니다."
            
            # 안전한 데이터 요약 생성
            data_summary = self.create_safe_data_summary(data)
            
            # GPT 프롬프트 - 할 일 목록 + 분석 조합
            prompt = f"""
당신은 창원 크리에이티브마루의 실무진입니다. 오늘이 2025년 6월 16일이고, 긴급한 비즈니스 기회들을 놓치지 않기 위해 구체적인 행동이 필요합니다.

🏢 회사 정보:
- 위치: 경상남도 창원시  
- 주요 사업: 홈페이지 제작, 카탈로그 제작, 브랜드마케팅
- 고객층: 중소기업, 지원사업 참여 기업
- 현재 상황: 신규 매출 기회 발굴 및 즉시 실행 필요

📊 실제 수집된 긴급 기회들:
총 {len(data)}개의 비즈니스 기회가 발견되었습니다.

{data_summary}

🚨 다음 두 가지를 명확히 구분해서 제공해주세요:

## ⚡ 1. 긴급 할 일 목록 (TODAY ACTION)

**오늘 (6월 16일) 당장 해야 할 일:**
- [ ] (구체적인 행동, 예: "혁신바우처 신청서 다운로드")
- [ ] (실제 링크나 연락처 포함)
- [ ] (소요 시간과 우선순위 표시)

**이번 주 (6월 17일~22일) 해야 할 일:**
- [ ] (날짜별 구체적 액션)
- [ ] (마감일 임박 순서대로)

**다음 주 (6월 23일~30일) 해야 할 일:**
- [ ] (중요하지만 덜 긴급한 것들)

## 📊 2. 전략적 비즈니스 분석

**우선순위 분석:**
- 왜 이 순서로 해야 하는지
- 각 기회의 성공 확률과 예상 수익

**매출 증대 전략:**
- 지원금 활용한 사업 확장 방안
- 새로운 고객층 개척 전략

**리스크 관리:**
- 놓치면 안 되는 마감일들
- 경쟁사 대비 우위 요소

**중요**: 실제 데이터의 마감일(D-9, D-15 등)과 지원금액을 정확히 반영해서, 오늘 당장 뭘 해야 하는지 명확하게 알려주세요. 일반적인 조언이 아닌, 크리에이티브마루가 지금 즉시 실행할 수 있는 구체적인 액션을 요구합니다.
"""
            
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "당신은 창원 지역 중소기업 지원사업에 정통한 실무진으로, 구체적이고 실행 가능한 비즈니스 조언을 제공합니다."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=3500,
                temperature=0.7
            )
            
            analysis = response.choices[0].message.content.strip()
            logging.info("✅ GPT-4 분석 완료")
            return analysis
            
        except Exception as e:
            logging.error(f"❌ GPT 분석 실패: {e}")
            return f"""📊 크리에이티브마루 데이터 리포트

🔍 수집 현황:
- 데이터 수: {len(data)}개
- 수집 시간: {datetime.now().strftime('%Y년 %m월 %d일')}

⚠️ AI 분석 일시 불가
- 오류: {str(e)}
- 데이터는 정상 수집됨

💡 수동 확인 권장:
1. 수집된 지원사업 정보 검토
2. 마감일 임박 사업 우선 확인  
3. 홈페이지/카탈로그 관련 기회 식별

📞 시스템 문의: 개발팀"""
    
    def create_beautiful_email(self, analysis, data_count):
        """아름다운 HTML 이메일 생성 (이모지 대신 HTML 아이콘)"""
        current_time = datetime.now().strftime("%Y년 %m월 %d일 %H시")
        
        return f"""
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', Arial, sans-serif; 
                       line-height: 1.6; color: #333; margin: 0; padding: 20px; 
                       background-color: #f5f5f5; }}
                .container {{ max-width: 900px; margin: 0 auto; background: white; 
                            border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; padding: 30px; text-align: center; }}
                .header h1 {{ margin: 0; font-size: 28px; text-shadow: 0 2px 4px rgba(0,0,0,0.3); }}
                .stats {{ background: #f8f9fa; padding: 25px; margin: 25px; border-radius: 10px; 
                         border-left: 5px solid #007bff; }}
                .content {{ padding: 30px; }}
                .analysis {{ background: #e8f4fd; padding: 25px; border-radius: 12px; 
                           border-left: 5px solid #2196f3; margin: 20px 0; }}
                .footer {{ background: #37474f; color: white; padding: 25px; text-align: center; }}
                .badge {{ background: #28a745; color: white; padding: 4px 8px; 
                         border-radius: 4px; font-size: 12px; }}
                .icon {{ display: inline-block; width: 20px; height: 20px; 
                        background-size: contain; margin-right: 5px; vertical-align: middle; }}
                .icon-rocket {{ background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'); }}
                .icon-chart {{ background: #007bff; border-radius: 3px; color: white; text-align: center; 
                             line-height: 20px; font-size: 12px; font-weight: bold; }}
                .icon-target {{ background: #28a745; border-radius: 3px; color: white; text-align: center; 
                              line-height: 20px; font-size: 12px; font-weight: bold; }}
                .icon-mail {{ background: #6c757d; border-radius: 3px; color: white; text-align: center; 
                            line-height: 20px; font-size: 12px; font-weight: bold; }}
                .icon-location {{ background: #17a2b8; border-radius: 3px; color: white; text-align: center; 
                                line-height: 20px; font-size: 12px; font-weight: bold; }}
                pre {{ white-space: pre-wrap; font-family: inherit; margin: 0; font-size: 14px; }}
                .highlight {{ background: #fff3cd; padding: 15px; border-radius: 8px; 
                            border-left: 4px solid #ffc107; margin: 15px 0; }}
                .section-title {{ color: #1976d2; font-size: 18px; font-weight: bold; margin: 20px 0 10px 0; 
                                 border-bottom: 2px solid #e3f2fd; padding-bottom: 8px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="icon icon-chart">BI</div>
                    <h1>{self.company_name} 비즈니스 인텔리전스</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">AI 기반 실시간 사업기회 분석 리포트</p>
                    <p style="margin: 5px 0 0 0; font-size: 14px;">{current_time} 생성</p>
                </div>
                
                <div class="stats">
                    <div class="section-title">
                        <span class="icon icon-chart">통계</span> 오늘의 데이터 수집 현황
                    </div>
                    <p><strong>수집된 사업기회:</strong> <span class="badge">{data_count}개</span></p>
                    <p><strong>분석 범위:</strong> 지원사업, 공모사업, 협업기회</p>
                    <p><strong>AI 분석 엔진:</strong> GPT-4 (OpenAI)</p>
                    <p><strong>시스템 상태:</strong> <span style="color: #28a745; font-weight: bold;">● 정상 운영</span></p>
                </div>
                
                <div class="content">
                    <div class="section-title">
                        <span class="icon icon-target">분석</span> AI 비즈니스 분석 결과
                    </div>
                    
                    <div class="highlight">
                        <strong>분석 포인트:</strong> 실제 수집된 데이터를 바탕으로 즉시 실행 가능한 
                        비즈니스 기회와 구체적인 액션 플랜을 제시합니다.
                    </div>
                    
                    <div class="analysis">
                        <pre>{analysis}</pre>
                    </div>
                </div>
                
                <div class="footer">
                    <p style="margin: 0; font-size: 16px;">
                        <span class="icon icon-mail">CM</span> <strong>{self.company_name}</strong>
                    </p>
                    <p style="margin: 5px 0;">AI 기반 비즈니스 인텔리전스 시스템</p>
                    <p style="margin: 5px 0; font-size: 14px;">
                        <span class="icon icon-location">창원</span> {self.gmail_user} | 창원시 소재 디자인 전문기업
                    </p>
                    <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.8;">
                        이 리포트는 GPT-4가 실시간 수집 데이터를 분석한 결과입니다.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
    
    def send_perfect_email(self, subject, html_content):
        """완벽한 이메일 발송"""
        try:
            msg = MIMEMultipart('alternative')
            msg['From'] = self.gmail_user
            msg['To'] = self.recipient_email
            msg['Subject'] = subject
            
            html_part = MIMEText(html_content, 'html', 'utf-8')
            msg.attach(html_part)
            
            server = smtplib.SMTP('smtp.gmail.com', 587)
            server.starttls()
            server.login(self.gmail_user, self.gmail_password)
            server.sendmail(self.gmail_user, self.recipient_email, msg.as_string())
            server.quit()
            
            logging.info(f"✅ 이메일 발송 성공: {self.recipient_email}")
            return True
            
        except Exception as e:
            logging.error(f"❌ 이메일 발송 실패: {e}")
            return False
    
    def run_perfect_analysis(self):
        """완벽한 분석 실행"""
        try:
            logging.info("🚀 완벽한 분석 시작")
            
            # 1. 완벽한 데이터 로딩
            data = self.load_data_perfectly()
            
            if data.empty:
                logging.error("❌ 데이터 없음")
                return False
            
            # 2. GPT 분석
            analysis = self.analyze_with_gpt(data)
            
            # 3. 이메일 생성 및 발송
            current_date = datetime.now().strftime("%Y.%m.%d")
            subject = f"🎯 [{self.company_name}] 실시간 비즈니스 기회 분석 - {current_date}"
            
            html_content = self.create_beautiful_email(analysis, len(data))
            success = self.send_perfect_email(subject, html_content)
            
            if success:
                logging.info("✅ 완벽한 분석 완료")
                print("🎉 완벽한 분석 및 메일 발송 완료!")
                print(f"📧 {self.recipient_email}로 상세한 분석 리포트가 발송되었습니다.")
                return True
            else:
                print("❌ 메일 발송 실패")
                return False
                
        except Exception as e:
            logging.error(f"❌ 분석 실행 오류: {e}")
            print(f"❌ 오류 발생: {e}")
            return False

def main():
    """메인 실행"""
    print("🎯 크리에이티브마루 완벽 분석 시스템")
    print("=" * 60)
    print("✅ 인코딩 문제 완전 해결")
    print("✅ 실제 데이터 기반 GPT 분석")  
    print("✅ 프로급 HTML 리포트")
    print("=" * 60)
    
    try:
        system = PerfectCreativeMaruSystem()
        
       print("\n🔥 자동 분석 실행 중...")
system.run_perfect_analysis()
            
    except Exception as e:
        print(f"❌ 시스템 오류: {e}")

if __name__ == "__main__":
    main()
