# 
#  @FileName : ai_evaluation.py
#  @Description : AI 온보딩 평가 API Router
#                 - 주관식/서술형 답변 AI 채점 요청 처리
#                 - 답변 유사도, AI 점수, 피드백 반환
#  @Author : 김다솜
#  @Date : 2026. 05. 02
#  @Modification_History
#  @
#  @ 수정일         수정자        수정내용
#  @ ----------    ---------    -------------------------------
#  @ 2026.05.02    김다솜        최초 생성 및 AI 평가 API 라우터 분리
#  @ 2026.05.06    김다솜        evaluate_answer 실제 호출로 연결 (mock 하드코딩 제거)
# 

from fastapi import APIRouter
from schemas.evaluation_schema import AiEvaluationRequest, AiEvaluationResponse
from services.evaluation_service import evaluate_answer

router = APIRouter()

@router.post("/evaluate")
def evaluate(req: AiEvaluationRequest):
    return evaluate_answer(req)
    # return {
    #     "score": 70,
    #     "feedback": "좋은 답변입니다",
    #     "similarity": 0.8
    # }