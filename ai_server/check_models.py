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