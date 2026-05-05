#
#  @FileName : check_models.py
#  @Description : 인사평가 > AI 추천(Gemini API 사용 가능 모델 조회용 스크립트)
#  @Author : 김다솜
#  @Date : 2026. 04. 28
#  @Modification_History
#  @
#  @ 수정일         수정자        수정내용
#  @ ----------    ---------    -------------------------------
#  @ 2026.04.28    김다솜        최초 생성/Gemini generateContent 지원 모델 조회 스크립트 작성
#
import requests, os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(dotenv_path=Path(__file__).parent / ".env")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

res = requests.get(f"https://generativelanguage.googleapis.com/v1beta/models?key={GEMINI_API_KEY}")
models = res.json().get("models", [])
for m in models:
    methods = m.get("supportedGenerationMethods", [])
    if "generateContent" in methods:
        print("✅", m["name"])