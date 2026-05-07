# 
#  @FileName : evaluation_service.py
#  @Description : AI 평가 서비스 로직
#                 - 서술형 답변과 기준 답안 비교하여 점수, 피드백, 유사도 반환
#                 - Gemini API (google-genai) 연동 실제 채점 구현
#  @Author : 김다솜
#  @Date : 2026. 05. 02
#  @Modification_History
#  @
#  @ 수정일         수정자        수정내용
#  @ ----------    ---------    -------------------------------
#  @ 2026.05.02    김다솜        최초 생성 및 AI 평가 mock 서비스 구현
#  @ 2026.05.06    김다솜        Gemini API 실제 연동 (google-genai 패키지 적용)
#  @ 2026.05.06    김다솜        Gemini 미사용 -> groq AI API로 변경 / client 초기화를 함수 내부로 이동 (load_dotenv 타이밍 문제 해결)
# 

import os
import json
# from google.genai import Client
from groq import Groq
from utils.nlp_helper import get_semantic_similarity

from schemas.evaluation_schema import AiEvaluationRequest, AiEvaluationResponse

# 주관식(단답형/서술형) 답변 AI 채점 함수
# Groq API 호출하여 기준 답안과 사용자 답변 비교 -> 점수, 유사도, 피드백을 JSON 형식으로 반환
def evaluate_answer(req: AiEvaluationRequest) -> AiEvaluationResponse:
    # client = Client(api_key=os.getenv("GEMINI_API_KEY"))
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    user_answer = req.user_answer.strip()
    reference_answer = req.reference_answer.strip()

    if not user_answer:
        return AiEvaluationResponse(
            score=0,
            feedback="답변이 입력되지 않았습니다.",
            similarity=0
        )
    
    # 1. PyTorch 라이브러리로 의미적 유사도 먼저 계산
    nlp_similarity = get_semantic_similarity(user_answer, reference_answer)
    
    # 2. Groq API 호출하여 AI 채점 수행
    prompt = f"""
당신은 온보딩 교육 평가 전문가입니다.
파이썬 NLP 모델이 계산한 두 문장의 의미 유사도는 {nlp_similarity}점(1.0 만점)입니다.

이 점수를 바탕으로 사용자 답변을 채점하세요.
유사도가 0.7 이상이면 핵심 맥락이 일치하는 것으로 간주하고,
사용자가 쓴 표현이 기준 답안과 단어가 다르더라도 의미가 통한다면 정답으로 인정하세요.

[채점 가이드라인]
1. 표현이 달라도 핵심 원칙(최소 활용, 즉시 보고 등)이 포함되었는지 확인.
2. 이미 답변에 포함된 내용을 "누락되었다"고 오판하지 않도록 주의.
3. 유사도는 단순 단어 일치도가 아닌 의미적 유사성을 기반으로 산출.

[기준 답안]
{reference_answer}

[사용자 답변]
{user_answer}

다음 JSON 형식으로만 응답하세요. 다른 텍스트는 절대 포함하지 마세요.
{{
    "score": 0~100 사이 점수,
    "similarity": {nlp_similarity},
    "feedback": "구체적인 한국어 피드백 2~3문장(이미 답변에 포함된 내용을 누락되었다고 오판하지 말고, 표현이 달라도 핵심 원칙이 포함되었는지 중심으로 평가하세요)"
}}
"""

    try:
        # Groq API 호출 방식
        response = client.chat.completions.create(
            model = "llama-3.3-70b-versatile",
            messages = [
                {
                "role": "system",
                "content": "당신은 교육 평가 전문가입니다. 반드시 JSON 형식으로만 응답해야 합니다."
                },
                {
                "role": "user",
                "content": prompt
                }
            ],
            temperature = 0.2,
            response_format={"type": "json_object"}
        )
        
        raw = response.choices[0].message.content.strip()
        
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()
        
        result = json.loads(raw)
        
        # # Gemini APi 호출 방식
        # response = client.models.generate_content(
        #     model="gemini-2.0-flash",
        #     contents=prompt
        # )
        # raw = response.text.strip()

        # # ```json...``` 펜스 제거
        # if raw.startswith("```"):
        #     raw = raw.split("```")[1]
        #     if raw.startswith("json"):
        #         raw = raw[4:]
        # raw = raw.strip()

        return AiEvaluationResponse(
            score=int(result["score"]),
            feedback=str(result["feedback"]),
            similarity=nlp_similarity
        )

    except Exception as e:
        print(f"[Groq 호출 오류] {e}")
        
        # 시연/테스트 안정성을 위한 fallback
        return AiEvaluationResponse(
            score=70 if user_answer else 0,
            feedback=f"AI 채점 중 오류가 발생하여 테스트용 AI 평가 결과를 반환합니다.: {str(e)}",
            similarity=0.65 if user_answer else 0.0
        )

    # # 임시 유사도 계산: 기준 답안 포함 여부 기준
    # if reference_answer and reference_answer in user_answer:
    #     score = 90
    #     similarity = 0.9
    #     feedback = "기준 답안의 핵심 내용을 잘 포함하고 있습니다."
    # else:
    #     score = 60
    #     similarity = 0.6
    #     feedback = "일부 개념은 포함되어 있으나, 기준 답안의 핵심 표현이 부족합니다."
    
    # return AiEvaluationResponse(
    #     score=score,
    #     feedback=feedback,
    #     similarity=similarity
    # )