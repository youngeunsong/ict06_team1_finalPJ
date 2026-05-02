#
#  @FileName : main.py
#  @Description : 인사평가 > AI 온보딩 로드맵 추천 API 서버
#                 (Gemini 기반 맞춤형 교육 로드맵 생성 및 DB 저장)
#  @Author : 김다솜
#  @Date : 2026. 04. 27
#  @Modification_History
#  @
#  @ 수정일         수정자        수정내용
#  @ ----------    ---------    -------------------------------
#  @ 2026.04.27    김다솜        최초 생성/Gemini 기반 AI 로드맵 추천 API 구현
#  @ 2026.04.28    김다솜        로드맵 응답 구조 변경(교육 그룹별 JSON 형태)/DB 저장 로직 연동
#

import os
import requests
import json
import re
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pathlib import Path
from database import (
    fetch_employee_info,
    fetch_existing_roadmap,
    save_ai_roadmap,
    get_on_content_list,
    fetch_content_detail
)

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

# MOCK: 개발용 플래그
# True: AI 호출 없이 mock 데이터 반환
# False: Gemini API 호출하여 실제 추천 생성
USE_MOCK = True
# API KEY 정상 로딩 여부 확인용(앞 10자리만 출력)
print(f"🔑 DEBUG KEY: {GEMINI_API_KEY[:10] if GEMINI_API_KEY else 'NONE'}")

# =========================
# AI 로드맵 API
# =========================
@app.get("/api/ai/roadmap/{emp_no}")
def get_roadmap(emp_no: str):
    # 플랜B: AI API 호출 실패 또는 개발 테스트용 임시 로드맵 데이터
    # 0. 임시 데이터 정의
    mock_roadmap = [
        {
            "category_name": "필수이수교육",
            "items": [
                {"item_id": 1, "item_title": "2026 신입사원 필독: 조직문화 및 비전 교육", "content_id": 1, "status": "COMPLETED", "rate": 100},
                {"item_id": 2, "item_title": "근태 관리 및 전자결재 시스템 사용 가이드", "content_id": 2, "status": "IN_PROGRESS", "rate": 40},
                {"item_id": 3, "item_title": "개인정보 보호 및 정보보안 기본 교육", "content_id": 3, "status": "NOT_STARTED", "rate": 0},
                {"item_id": 4, "item_title": "직장 내 성희롱 예방 교육", "content_id": 4, "status": "NOT_STARTED", "rate": 0},
            ],
        },
        {
            "category_name": "직무교육 (백엔드)",
            "items": [
                {"item_id": 5, "item_title": "Java Spring Boot 프로젝트 구조 이해", "content_id": 12, "status": "IN_PROGRESS", "rate": 80},
                {"item_id": 6, "item_title": "Spring Security와 JWT 인증 흐름", "content_id": 13, "status": "NOT_STARTED", "rate": 0},
                {"item_id": 7, "item_title": "JPA 연관관계 매핑 실무", "content_id": 14, "status": "NOT_STARTED", "rate": 0},
                {"item_id": 8, "item_title": "트랜잭션과 동시성 처리 기초", "content_id": 15, "status": "NOT_STARTED", "rate": 0},
            ],
        },
        {
            "category_name": "직무교육 (프론트엔드)",
            "items": [
                {"item_id": 9, "item_title": "React 컴포넌트 구조와 Props 관리", "content_id": 19, "status": "IN_PROGRESS", "rate": 50},
                {"item_id": 10, "item_title": "React Router 기반 페이지 라우팅", "content_id": 20, "status": "IN_PROGRESS", "rate": 20},
                {"item_id": 11, "item_title": "Axios와 API 통신 패턴", "content_id": 21, "status": "NOT_STARTED", "rate": 0},
                {"item_id": 12, "item_title": "상태 관리와 Context API 활용", "content_id": 22, "status": "NOT_STARTED", "rate": 0},
            ],
        },
        {
            "category_name": "심화교육",
            "items": [
                {"item_id": 13, "item_title": "마이크로서비스 아키텍처 입문", "content_id": 18, "status": "NOT_STARTED", "rate": 0},
                {"item_id": 14, "item_title": "PostgreSQL 인덱스와 쿼리 튜닝", "content_id": 16, "status": "NOT_STARTED", "rate": 0},
            ],
        },
        {
            "category_name": "AI 활용 교육",
            "items": [
                {"item_id": 15, "item_title": "AI 업무 자동화 기초", "content_id": 46, "status": "NOT_STARTED", "rate": 0},
                {"item_id": 16, "item_title": "프롬프트 작성법과 AI 활용 가이드", "content_id": 47, "status": "NOT_STARTED", "rate": 0},
                {"item_id": 17, "item_title": "RAG 기반 사내 지식 검색 이해", "content_id": 49, "status": "NOT_STARTED", "rate": 0},
            ],
        },
    ]
    
    try:
        # 1. 사원 정보 조회
        emp_info = fetch_employee_info(emp_no)
        if not emp_info:
            return {"error": "사원 정보를 찾을 수 없습니다."}

        # 2. [최적화] 이미 생성된 로드맵이 DB에 있는지 확인
        existing_data = fetch_existing_roadmap(emp_no)

        if existing_data:
            print(f"기존 로드맵을 반환합니다. (사번: {emp_no})")
            return {
                "name": emp_info.get("name"),
                "recommended_roadmap": existing_data,
                "is_mock": False
            }

        # 3. mock 데이터 불러오기(조건 분기-개발용 임시 코드)
        if USE_MOCK:
            print("⚠️ 개발 모드: AI 호출 생략, mock 로드맵 사용")
            return {
                "name": emp_info.get("name"),
                "recommended_roadmap": mock_roadmap,
                "is_mock": True
            }

        # 3. AI에게 전달할 사내 강의 목록 문자열 생성
        content_list_str = get_on_content_list()

        # 4. 프롬프트 구성(형식/강의 목록)
        prompt_text = (
            f"사원 {emp_info.get('name')} "
            f"(부서: {emp_info.get('dept_name')}, 직급: {emp_info.get('position_name')})을 위한 "
            f"맞춤형 온보딩 로드맵을 만들어줘.\n\n"

            f"아래 콘텐츠 목록에는 ID, 제목, 유형, 분류, 세부분류, 대상직급, 난이도, 예상시간, 태그, 필수여부가 정보가 포함되어 있어.\n"
            f"콘텐츠를 다음 교육 그룹으로 나누어 추천해줘.\n"
            f"1. 필수이수교육\n"
            f"2. 직무교육\n"
            f"3. 심화교육\n\n"

            f"추천 기준:\n"
            f"- 필수여부가 true인 콘텐츠는 필수이수교육에 우선 포함\n"
            f"- 사원의 부서와 직급에 맞는 콘텐츠를 직무교육에 포함\n"
            f"- 난이도가 높은 콘텐츠나 확장 학습은 심화교육에 포함\n"
            f"- 전체 추천 콘텐츠는 5개에서 8개 사이로 구성\n"
            f"- content_id는 반드시 제공된 목록의 ID만 사용\n\n"

            f"콘텐츠 목록:\n{content_list_str}\n\n"

            f"응답은 반드시 JSON만 반환해. 다른 설명은 절대 하지 마.\n"
            f"""
        [
            {{
                "category_name": "필수이수교육",
                "items": [
                {{"item_title": "콘텐츠 제목", "content_id": 1}}
                ]
            }},
            {{
                "category_name": "직무교육",
                "items": [
                {{"item_title": "콘텐츠 제목", "content_id": 2}}
                ]
            }},
            {{
                "category_name": "심화교육",
                "items": [
                {{"item_title": "콘텐츠 제목", "content_id": 3}}
                ]
            }}
        ]
        """
        )

        # 5. Gemini API 호출 설정
        target_model = "gemini-2.0-flash"
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{target_model}:generateContent?key={GEMINI_API_KEY}"
        # 요청 데이터
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

        # API 호출
        print(f"\n AI 요청 시작(사번: {emp_no})")
        response = requests.post(url, headers=headers, json=payload, timeout=5)
        result = response.json()

        # =========================
        # 응답 로그
        # =========================
        print("\n ===== AI RESPONSE =====")
        print("STATUS:", response.status_code)
        print("TEXT:", response.text)

        # 6. AI 응답 파싱 및 DB 저장
        if "candidates" in result:
            ai_text = result["candidates"][0]["content"]["parts"][0]["text"].strip()
            print(f"AI 응답 원문: {ai_text}")

            # JSON 형태 로드맵 파싱
            try:
                ai_text = re.sub(r"```.*?\n", "", ai_text)
                ai_text = ai_text.replace("```", "").strip()
                roadmap_items = json.loads(ai_text)
            except Exception as parse_err:
                print(f"JSON 파싱 실패: {parse_err}")
                raise Exception("PARSING_ERROR")

            # DB에 최종 저장(사번 포함)
            save_success = save_ai_roadmap(
                dept_id=emp_info.get("dept_id"),
                position_id=emp_info.get("position_id"),
                title=f"{emp_info.get('name')} 님 맞춤 로드맵",
                roadmap_list=roadmap_items,
                emp_no=emp_no
            )

            if save_success:
                # 성공 시 결과
                print("DB 저장 성공")                
                return {
                    "name": emp_info.get("name"),
                    "recommended_roadmap": roadmap_items,
                    "saved": save_success
                }
            else:
                # DB 저장 실패, AI가 준 데이터만 리액트에 보내기
                print("DB 저장 실패, 임시 데이터 반환")
                return {
                    "name": emp_info.get("name"),
                    "recommended_roadmap": roadmap_items,
                    "warning": "DB STORAGE FAILED"
                }

            # candidates 없을 경우
            raise Exception("API LIMIT REACHED")

    except Exception as e:
        # 에러가 나도 리액트 화면은 정상적으로 나오게 임시 데이터 반환
        print(f"플랜B 작동(사유: {e})")
        return {
            "name": emp_info.get("name") if 'emp_info' in locals() else "사용자",
            "recommended_roadmap": mock_roadmap,
            "is_mock": True
        }

# =========================
# 콘텐츠 상세 조회 API
# 
# 로드맵 화면에서 선택한 콘텐츠(content_id) 기반, ON_CONTENT 테이블에서 상세 정보 조회-반환
# LearningDetail.js에서 콘텐츠 타입(VIDEO/PDF/LINK..)에 따라 렌더링할 데이터 제공하는 역할
# :param content_id: 콘텐츠 식별자
# :return: 콘텐츠 상세 정보 JSON
# =========================
@app.get("/api/content/{content_id}")
def get_content_detail(content_id: int):
    # DB에서 콘텐츠 조회
    content = fetch_content_detail(content_id)

    if not content:
        return {"error": "콘텐츠를 찾을 수 없습니다."}

    return content