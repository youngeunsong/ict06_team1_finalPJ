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
#  @ 2026.05.12    김다솜        퀴즈 생성 및 주관식 채점 난이도별 가이드라인(EASY/NORMAL/HARD) 추가
# 

import os
import json
# from google.genai import Client
from groq import Groq
from utils.nlp_helper import get_semantic_similarity

from schemas.evaluation_schema import (
    AiEvaluationRequest,
    AiEvaluationResponse,
    AiQuizGenerationRequest,
    AiQuizDraftItem,
    AiQuizGenerationResponse
)

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
    
    # [시나리오별 채점 가이드라인 정의]
    # 1. 완전 일치(Excellent): 핵심 키워드와 행동 원칙이 모두 포함된 경우 (90~100점)
    # 2. 의미 상통(Good): 단어는 다르나 동의어를 사용하여 맥락상 정답인 경우 (80~89점)
    # 3. 부분 정답(Partial): 일부 개념은 맞으나 핵심 지침이 하나 이상 누락된 경우 (40~79점)
    # 4. 오답/무관(Poor): 주제와 동떨어지거나 잘못된 정보를 제공하는 경우 (0~39점)
    scoring_guideline = (
        "- 핵심 키워드가 포함되었는가?\n"
        "- 실무 지침으로서의 논리적 타당성이 있는가?\n"
        "- 단순히 단어만 나열한 것이 아니라 문장으로서 의미가 전달되는가?"
    )

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

[세부 채점 기준]
{scoring_guideline}

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


def generate_quiz_drafts(req: AiQuizGenerationRequest) -> AiQuizGenerationResponse:
    difficulty = (req.difficulty or "EASY").upper()

    # [수정] 난이도별 세부 출제 가이드라인 정의하여 문제 변별력 강화
    difficulty_instructions = {
        "EASY": "가장 기초적인 개념과 용어 정의 위주로 출제하세요. 보기 간의 차이를 명확하게 구성하여 정답을 찾기 쉽게 만드세요.",
        "NORMAL": "실무 적용 사례나 일반적인 업무 절차를 바탕으로 출제하세요. 정답과 혼동될 수 있는 매력적인 오답을 한두 개 포함하세요.",
        "HARD": "복합적인 상황 시나리오, 예외 케이스, 또는 지엽적인 규정을 다루어 출제하세요. 전문 용어를 적극 활용하고 고도의 사고력을 요구하는 보기들로 구성하세요."
    }
    selected_instruction = difficulty_instructions.get(difficulty, difficulty_instructions["EASY"])

    prompt = f"""
당신은 기업 온보딩 교육용 객관식 문제 출제 도우미입니다.
아래 콘텐츠 정보를 기준으로 한국어 4지선다 객관식 문제 {req.question_count}개를 만들어 주세요.

[콘텐츠 정보]
- 제목: {req.title}
- 카테고리: {req.category or "공통"}
- 세부 카테고리: {req.sub_category or "없음"}
- 콘텐츠 유형: {req.content_type or "LINK"}
- 난이도: {difficulty}
- 태그: {req.tags or "없음"}
- 경로: {req.path or "없음"}

[난이도별 출제 가이드라인]
현재 설정된 난이도는 **{difficulty}**입니다.
{selected_instruction}

[출제 규칙]
1. 각 문제는 보기 4개를 제공하세요.
2. 정답은 하나만 고르세요.
3. 실무 온보딩/학습 확인용으로 자연스럽고 이해 가능한 문제로 만드세요.
4. 콘텐츠 제목만 반복하지 말고, 학습 후 이해했는지 확인할 수 있게 출제하세요.
5. JSON만 반환하세요.

반환 형식:
{{
  "questions": [
    {{
      "questionText": "문제 내용",
      "option1": "보기 1",
      "option2": "보기 2",
      "option3": "보기 3",
      "option4": "보기 4",
      "answerNo": 1,
      "explanation": "정답 해설"
    }}
  ]
}}
"""

    try:
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "당신은 온보딩 퀴즈 출제 도우미입니다. 반드시 JSON 형식으로만 답변하세요."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.4,
            response_format={"type": "json_object"}
        )

        raw = response.choices[0].message.content.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()

        parsed = json.loads(raw)
        questions = [
            AiQuizDraftItem(**question)
            for question in parsed.get("questions", [])
        ]

        if not questions:
            raise ValueError("생성된 문제가 없습니다.")

        return AiQuizGenerationResponse(questions=questions)

    except Exception as e:
        print(f"[Quiz generation fallback] {e}")
        return AiQuizGenerationResponse(
            questions=_build_fallback_quiz_drafts(req)
        )


def _build_fallback_quiz_drafts(req: AiQuizGenerationRequest) -> list[AiQuizDraftItem]:
    category = req.category or "공통"
    sub_category = req.sub_category or "기본"
    title = req.title
    count = max(1, min(req.question_count, 5))

    drafts: list[AiQuizDraftItem] = []
    for index in range(count):
        drafts.append(
            AiQuizDraftItem(
                questionText=f"[{category}] {title} 학습과 가장 관련된 설명은 무엇인가요?",
                option1=f"{sub_category}와 무관한 임의의 정보만 확인하면 된다",
                option2=f"{title}를 통해 {category} 학습 목적과 핵심 개념을 이해하는 것이 중요하다",
                option3="문서를 읽지 않고도 바로 평가만 통과하면 된다",
                option4="콘텐츠 제목만 외우면 학습이 완료된다",
                answerNo=2,
                explanation=f"{title}는 {category} 학습 이해도를 높이기 위한 콘텐츠이므로 목적과 핵심 개념을 이해하는 것이 중요합니다."
            )
        )

    return drafts
