#
#  @FileName : main.py
#  @Description : AI 온보딩 평가 서버
#                 - FastAPI 기반 AI 전용 API 서버
#                 - Spring Boot 서버와 분리하여 AI 채점/피드백 기능 처리
#                 - AI 로드맵 추천 및 퀴즈 채점 라우터 통합 관리
#  @Author : 김다솜
#  @Date : 2026. 04. 27
#  @Modification_History
#  @
#  @ 수정일         수정자        수정내용
#  @ ----------    ---------    -------------------------------
#  @ 2026.04.27    김다솜        최초 생성 및 FastAPI 기본 서버 구성, Gemini 기반 AI 로드맵 추천 API 구현
#  @ 2026.04.28    김다솜        로드맵 응답 구조 변경(교육 그룹별 JSON 형태)/DB 저장 로직 연동
#  @ 2026.05.06    김다솜        로드맵/퀴즈 평가 라우터 분리 및 main.py 경량화,
#                               load_dotenv import 순서 최상단으로 이동(API KEY 로딩 타이밍 문제 해결)
#

import os
from dotenv import load_dotenv
from pathlib import Path

# .env 로딩
load_dotenv(dotenv_path=Path(__file__).parent / ".env")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.evaluation.ai_evaluation import router as evaluation_router
from api.roadmap.ai_roadmap import router as roadmap_router
from services.evaluation_service import evaluate_answer
from schemas.evaluation_schema import AiEvaluationRequest, AiEvaluationResponse

# =========================
# API KEY
# =========================
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
print(f"🔑 DEBUG KEY: {GEMINI_API_KEY[:10] if GEMINI_API_KEY else 'NONE'}")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
print(f"🔑 GROQ KEY: {GROQ_API_KEY[:10] if GROQ_API_KEY else 'NONE'}")

app = FastAPI(
    title="AI Onboarding Evaluation Server",
    description="온보딩 퀴즈 AI 채점 및 피드백 생성 서버",
    version="1.0.0"
)

# SpringBoot / React와 통신 위한 CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8081"
        ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    evaluation_router,
    prefix="/api/ai/evaluation",
    tags=["AI Evaluation"]
)

app.include_router(
    roadmap_router,
    prefix="/api/ai",
    tags=["AI Roadmap"]
)


@app.get("/")
def root():
    return {
        "service": "AI Onboarding Evaluation Server",
        "status": "running"
    }

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "server": "ai",
        "port": 8000
    }
    
@app.post("/evaluate", response_model=AiEvaluationResponse)
async def ai_evaluation_endpoint(req: AiEvaluationRequest):
    return evaluate_answer(req)