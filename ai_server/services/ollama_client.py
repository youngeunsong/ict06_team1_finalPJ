import os

import requests

DEFAULT_BASE_URL = "http://localhost:11434"
DEFAULT_MODEL = "llama3.1:8b"


def is_ollama_enabled() -> bool:
    return os.getenv("OLLAMA_DOC_POSTPROCESS", "false").lower() == "true"


def summarize_document(text: str) -> str | None:
    prompt = (
        "You are helping process onboarding documents.\n"
        "Summarize the document in 2 short Korean sentences.\n"
        "Do not use bullets.\n"
        "Return only the summary.\n\n"
        f"Document:\n{text[:4000]}"
    )
    return _generate_text(prompt)


def suggest_section_title(text: str) -> str | None:
    prompt = (
        "You are helping process onboarding documents.\n"
        "Create one short Korean section title for the following chunk.\n"
        "Limit it to 12 words or fewer.\n"
        "Return only the title.\n\n"
        f"Chunk:\n{text[:1500]}"
    )
    return _generate_text(prompt)


def _generate_text(prompt: str) -> str | None:
    if not is_ollama_enabled():
        return None

    base_url = os.getenv("OLLAMA_BASE_URL", DEFAULT_BASE_URL).rstrip("/")
    model = os.getenv("OLLAMA_MODEL", DEFAULT_MODEL)

    response = requests.post(
        f"{base_url}/api/generate",
        json={
            "model": model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.2,
            },
        },
        timeout=60,
    )
    response.raise_for_status()

    payload = response.json()
    text = (payload.get("response") or "").strip()
    return text or None
