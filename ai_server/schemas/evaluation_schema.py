# 
#  @FileName : evaluation_schema.py
#  @Description : AI 평가 요청/응답 스키마
#                 - 서술형 답변 AI 채점 요청 DTO
#                - AI 점수, 피드백, 유사도 응답 DTO
#  @Author : 김다솜
#  @Date : 2026. 05. 02
#  @Modification_History
#  @
#  @ 수정일         수정자        수정내용
#  @ ----------    ---------    -------------------------------
#  @ 2026.05.02    김다솜        최초 생성 및 AI 평가 스키마 정의
# 

from pydantic import BaseModel


class AiEvaluationRequest(BaseModel):
    user_answer: str
    reference_answer: str


class AiEvaluationResponse(BaseModel):
    score: float
    feedback: str
    similarity: float