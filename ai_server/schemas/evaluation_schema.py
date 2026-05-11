# 
#  @FileName : evaluation_schema.py
#  @Description : AI 평가/퀴즈 생성 요청 및 응답 스키마
#                 - 주관식 답변 AI 채점 요청/응답 DTO
#                 - 콘텐츠 기준 객관식 퀴즈 초안 생성 요청/응답 DTO
#  @Author : 김다솜
#  @Date : 2026. 05. 02
#  @Modification_History
#  @
#  @ 수정일자        수정자        수정내용
#  @ ----------    ---------    -------------------------------
#  @ 2026.05.02    김다솜        최초 생성 및 AI 평가 스키마 정의
#  @ 2026.05.11    김다솜        AI 퀴즈 자동 생성 요청/응답 스키마 추가
# 
from typing import List

from pydantic import BaseModel


class AiEvaluationRequest(BaseModel):
    user_answer: str
    reference_answer: str


class AiEvaluationResponse(BaseModel):
    score: float
    feedback: str
    similarity: float


class AiQuizGenerationRequest(BaseModel):
    content_id: int
    title: str
    category: str | None = None
    sub_category: str | None = None
    content_type: str | None = None
    difficulty: str | None = None
    question_count: int = 3
    tags: str | None = None
    path: str | None = None


class AiQuizDraftItem(BaseModel):
    questionText: str
    option1: str
    option2: str
    option3: str
    option4: str
    answerNo: int
    explanation: str


class AiQuizGenerationResponse(BaseModel):
    questions: List[AiQuizDraftItem]
