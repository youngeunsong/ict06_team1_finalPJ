from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import fetch_employee_info  # database.py에서 함수 가져오기

# 1. 앱 객체 생성 (이게 반드시 @app.get 보다 위에 있어야 함!)
app = FastAPI()

# 2. CORS 설정 (리액트 연결용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. 기본 경로
@app.get("/")
def read_root():
    return {"message": "AI 서버가 정상적으로 작동 중입니다."}

# 4. 로드맵 추천 API (이게 다솜님이 만든 핵심 기능!)
@app.get("/api/ai/roadmap/{emp_no}")
def get_roadmap(emp_no: str):
    try:
        print(f"로그: {emp_no}번 사원 정보 조회 시작")
        emp_info = fetch_employee_info(emp_no)

        if not emp_info:
            return {"error": "사원 정보를 찾을 수 없습니다."}

        # database.py의 JOIN 쿼리 결과 컬럼명과 맞춰야 합니다.
        name = emp_info.get('name', '이름없음')
        dept_name = emp_info.get('dept_name', '부서없음') 
        position_name = emp_info.get('position_name', '직급없음')

        # 추천 로직 (부서명에 따라 분기)
        if '개발' in dept_name:
            roadmap = ["Clean Code 작성법", "MSA 아키텍처 이해", "DevOps 실무"]
        elif '경영' in dept_name:
            roadmap = ["성과 지표(KPI) 설계", "심리 상담사 자격", "고급 엑셀 데이터 분석"]
        else:
            roadmap = ["직무 공통 역량 강화", "리더십 트레이닝", "외국어 회화"]

        return {
            "name": name,
            "department": dept_name,
            "position": position_name,
            "recommended_roadmap": roadmap
        }
        
    except Exception as e:
        print(f"❌ 서버 내부 에러 발생: {e}")
        return {"error": str(e)}