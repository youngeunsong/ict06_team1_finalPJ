#
#  @FileName : main.py
#  @Description : AI 서버 메인 엔트리포인트
#                 - FastAPI 기반 AI 전용 API 서버
#                 - 관리자 대시보드 통계 API 제공
#                 - 문서/RAG 처리 및 AI 평가/퀴즈 생성 API 제공
#  @Author : 김다솜
#  @Date : 2026. 04. 27
#  @Modification_History
#  @
#  @ 수정일자        수정자       수정내용
#  @ ----------    ---------    -------------------------------
#  @ 2026.04.27    김다솜        최초 생성 및 FastAPI 기본 서버 구성
#  @ 2026.05.11    김다솜        관리자 대시보드 통계 API 및 문서 처리 트리거 구성
#  @ 2026.05.12    김다솜        Spring 연동 경로에 맞춰 AI 평가/퀴즈/문서 처리 라우터 등록
#

from pathlib import Path

from dotenv import load_dotenv
from fastapi import BackgroundTasks, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from repositories import dashboard_repository
from api.documents.ai_documents import router as document_router
from api.evaluation.ai_evaluation import router as evaluation_router
from api.roadmap.ai_roadmap import router as roadmap_router
from schemas.evaluation_schema import AiEvaluationRequest, AiEvaluationResponse, AiQuizGenerationRequest
from services import evaluation_service

load_dotenv(dotenv_path=Path(__file__).parent / ".env")

app = FastAPI(
    title="COREWORK AI Server",
    description="온보딩 로드맵, 평가, 퀴즈, 문서/RAG 처리를 담당하는 AI 서버",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8081",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Spring 서버가 호출하는 실제 AI API 경로를 Swagger UI에 등록한다.
app.include_router(evaluation_router, prefix="/api/ai/evaluation", tags=["AI Evaluation"])
app.include_router(document_router, prefix="/api/ai/documents", tags=["AI Documents"])
app.include_router(roadmap_router, prefix="/api/ai", tags=["AI Roadmap"])


class RagProcessRequest(BaseModel):
    doc_id: int
    file_path: str


@app.get("/")
def read_root():
    """
    AI 서버 기동 여부를 확인하는 기본 헬스 체크 엔드포인트
    """
    return {
        "service": "COREWORK AI Server",
        "status": "running",
    }


@app.get("/health")
def health_check():
    """
    AI 서버 상태 확인용 헬스 체크 엔드포인트
    """
    return {
        "status": "ok",
        "server": "ai",
        "port": 8000,
    }


@app.get("/api/stats/dashboard", tags=["Dashboard"])
def get_dashboard_stats():
    """
    관리자 대시보드용 통계 데이터를 일괄 반환
    """
    return {
        "kpis": dashboard_repository.analyze_dashboard_kpis(),
        "onboarding": dashboard_repository.analyze_onboarding_stats(),
        "rag": dashboard_repository.analyze_rag_status(),
        "ai_usage": dashboard_repository.analyze_ai_usage_trend(),
        "quiz": dashboard_repository.analyze_quiz_performance(),
        "recentActivities": dashboard_repository.analyze_recent_activities(),
    }


@app.post("/api/rag/process", tags=["RAG"])
def trigger_rag_processing(req: RagProcessRequest, background_tasks: BackgroundTasks):
    """
    문서/RAG 처리 요청을 비동기 트리거하는 레거시 엔드포인트
    """
    # 실제 청크/벡터 처리 로직 연결 예정
    # background_tasks.add_task(database.process_document_rag, req.doc_id, req.file_path)
    return {
        "status": "processing",
        "message": f"Document {req.doc_id} is being processed in background.",
    }


@app.post("/api/ai/evaluate", tags=["Legacy AI"])
def evaluate_answer(req: AiEvaluationRequest):
    """
    기존 테스트 경로: AI가 주관식 답변을 채점하고 피드백을 생성한다.
    """
    return evaluation_service.evaluate_answer(req)


@app.post("/evaluate", response_model=AiEvaluationResponse, tags=["Legacy AI"])
async def ai_evaluation_endpoint(req: AiEvaluationRequest):
    """
    기존 Swagger 단독 테스트용 평가 엔드포인트
    """
    return evaluation_service.evaluate_answer(req)


@app.post("/api/ai/generate-quiz", tags=["Legacy AI"])
def generate_quiz(req: AiQuizGenerationRequest):
    """
    기존 테스트 경로: 콘텐츠 정보를 바탕으로 AI가 객관식 퀴즈를 생성한다.
    """
    return evaluation_service.generate_quiz_drafts(req)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
