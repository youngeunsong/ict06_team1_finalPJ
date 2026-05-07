# 
#  @FileName : evaluation_service.py
#  @Description : AI 평가 서비스 로직
#                 - 서술형 답변과 기준 답안 비교하여 점수, 피드백, 유사도 반환
#                 - 현재는 Gemini 연동 전 mock 채점 로직으로 동작
#  @Author : 김다솜
#  @Date : 2026. 05. 02
#  @Modification_History
#  @
#  @ 수정일         수정자        수정내용
#  @ ----------    ---------    -------------------------------
#  @ 2026.05.02    김다솜        최초 생성 및 AI 평가 mock 서비스 구현
# 

from schemas.evaluation_schema import AiEvaluationRequest, AiEvaluationResponse

def evaluate_answer(req: AiEvaluationRequest) -> AiEvaluationResponse:
    """
    주관식(단답형/서술형) 답변 AI 채점 함수

    현재는 테스트용 mock 로직으로 점수와 피드백을 반환하고,
    추후 Gemini API를 연동하여 실제 의미 기반 채점으로 확장한다.
    """

    user_answer = req.user_answer.strip()
    reference_answer = req.reference_answer.strip()

    if not user_answer:
        return AiEvaluationResponse(
            score=0,
            feedback="답변이 입력되지 않았습니다.",
            similarity=0
        )

    # 임시 유사도 계산: 기준 답안 포함 여부 기준
    if reference_answer and reference_answer in user_answer:
        score = 90
        similarity = 0.9
        feedback = "기준 답안의 핵심 내용을 잘 포함하고 있습니다."
    else:
        score = 60
        similarity = 0.6
        feedback = "일부 개념은 포함되어 있으나, 기준 답안의 핵심 표현이 부족합니다."
    
    return AiEvaluationResponse(
        score=score,
        feedback=feedback,
        similarity=similarity
    )