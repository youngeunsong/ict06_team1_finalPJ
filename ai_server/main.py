import os
import requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pathlib import Path
from database import fetch_employee_info, save_ai_roadmap, fetch_existing_roadmap

# =========================
# .env 로딩
# =========================
load_dotenv(dotenv_path=Path(__file__).parent / ".env")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# API KEY
# =========================
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
print(f"🔑 DEBUG KEY: {GEMINI_API_KEY[:10] if GEMINI_API_KEY else 'NONE'}")


# =========================
# AI 로드맵 API
# =========================
@app.get("/api/ai/roadmap/{emp_no}")
def get_roadmap(emp_no: str):

    try:
        # 1. 사원 정보 조회
        emp_info = fetch_employee_info(emp_no)
        if not emp_info:
            return {"error": "사원 정보를 찾을 수 없습니다."}

        # ⚠️ 할당량 초과로 임시 데이터 사용 중
        return {
            "name": emp_info.get("name"),
            "recommended_roadmap": [
                "회사 문화 및 조직 이해",
                "직무 관련 시스템 교육",
                "실전 업무 적응 및 피드백"
            ]
        }

        # 2-1. 이미 생성된 로드맵이 있는지 DB에서 먼저 확인
        existing_roadmap = fetch_existing_roadmap(emp_no)
        if existing_roadmap:
            print(f"기존 로드맵을 반환합니다. (사번: {emp_no})")
            # return {
            #     "name": emp_info.get("name"),
            #     "recommended_roadmap": existing_roadmap  # 리스트 형태로 반환
            # }
        # 2-2. 프롬프트 생성
        prompt_text = (
            f"사원 {emp_info.get('name')}을 위한 "
            f"3단계 온보딩 로드맵 제목만 콤마로 구분해서 알려줘."
        )

        # 3. 모델 선택
        target_model = "gemini-2.0-flash"
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{target_model}:generateContent?key={GEMINI_API_KEY}"
        
        # 4. 요청 데이터
        payload = {
            "contents": [
                {
                    "parts": [{"text": prompt_text}]
                }
            ]
        }

        headers = {"Content-Type": "application/json"}

        # =========================
        # 요청 로그
        # =========================
        print("\n ===== GEMINI REQUEST =====")
        print("MODEL:", target_model)
        print("PROMPT:", prompt_text)

        # 5. API 호출
        response = requests.post(url, headers=headers, json=payload)

        # =========================
        # 응답 로그
        # =========================
        print("\n ===== GEMINI RESPONSE =====")
        print("STATUS:", response.status_code)
        print("TEXT:", response.text)

        # 6. JSON 파싱 안전 처리
        try:
            result = response.json()
        except Exception:
            return {"error": "JSON 파싱 실패 (응답 형식 오류)"}

        # 7. 실패 처리
        if response.status_code != 200:
            return {
                "error": result.get("error", {}).get("message", "unknown error")
            }

        # 8. 성공 처리
        if "candidates" in result:
            ai_text = result["candidates"][0]["content"]["parts"][0]["text"].strip()
            roadmap_list = [x.strip() for x in ai_text.split(",")]

            print("\n✅ FINAL RESULT:", roadmap_list)

            # DB 저장 함수 호출
            save_success = save_ai_roadmap(
                dept_id=emp_info.get("dept_id"),
                position_id=emp_info.get("position_id"),
                title=f"{emp_info.get('name')} 님 맞춤 로드맵",
                roadmap_list=roadmap_list
            )

            if save_success:
                print("AI 로드맵이 DB에 성공적으로 저장되었습니다.")

            return {
                # Gemini AI 호출 시 아래 2줄 주석 해제
                # (무료 토큰 제한으로 연동 성공만 확인 후 임시 데이터로 막아둠)
                # "name": emp_info.get("name"),
                # "recommended_roadmap": roadmap_list

                # 임시 데이터
                "name": emp_info.get("name"),
                "recommended_roadmap": [
                    "회사 문화 및 조직 이해",
                    "직무 관련 시스템 교육",
                    "실전 업무 적응 및 피드백"
                ]
            }

        return {"error": "candidates 없음"}

    except Exception as e:
        print("❌ SYSTEM ERROR:", str(e))
        return {"error": str(e)}