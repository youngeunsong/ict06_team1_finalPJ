#
#  @FileName : document_processing_service.py
#  @Description : 문서 본문 추출/청크 분할/벡터 생성 서비스 모듈
#  @Author : 김다솜
#  @Date : 2026. 05. 12
#  @Modification_History
#  @
#  @ 수정일자        수정자          수정내용
#  @ ----------    ---------    -------------------------------
#  @ 2026.05.12    김다솜        문서 자동 처리 파이프라인 구현, 원격 문서 요청 timeout/User-Agent 보강 및 상단 주석 보강
#

import hashlib
import html
import json
import math
import os
import re
from io import BytesIO
from urllib.parse import parse_qs, urlparse

import pdfplumber
import requests
from groq import Groq
from pypdf import PdfReader

from services.ollama_client import summarize_document
from schemas.document_schema import (
    DocumentChunkResponse,
    DocumentProcessRequest,
    DocumentProcessResponse,
    DocumentQuestionRequest,
    DocumentQuestionResponse,
)

MAX_CHUNK_CHARS = 900
EMBED_DIMENSION = 256
REMOTE_CONNECT_TIMEOUT = 10
REMOTE_READ_TIMEOUT = 90
REMOTE_REQUEST_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0 Safari/537.36"
    ),
    "Accept": "text/html,application/pdf,text/plain,application/json,*/*",
}


def process_document(req: DocumentProcessRequest) -> DocumentProcessResponse:
    text, source_type = extract_text(req.filePath)
    cleaned_text = normalize_text(text)

    if not cleaned_text:
        raise ValueError("문서에서 추출한 본문이 비어 있습니다.")

    if source_type.endswith("pdf") and is_low_quality_extraction(cleaned_text):
        raise ValueError("PDF 본문 추출 품질이 너무 낮습니다. 다른 PDF를 사용하거나 OCR 처리가 필요합니다.")

    chunks = split_text(cleaned_text)
    if not chunks:
        raise ValueError("청크를 생성할 수 없습니다.")

    preview_text = build_preview_text(req.title, cleaned_text)
    response_chunks: list[DocumentChunkResponse] = []
    for index, chunk_text in enumerate(chunks, start=1):
        token_count = estimate_token_count(chunk_text)
        embedding = make_hash_embedding(chunk_text, EMBED_DIMENSION)

        response_chunks.append(
            DocumentChunkResponse(
                chunkNo=index,
                content=chunk_text,
                tokenCount=token_count,
                sectionTitle=build_section_title(req.title, index, chunk_text),
                embeddingData=json.dumps(embedding),
                modelName="hash-embedding-v1",
                dimension=EMBED_DIMENSION,
            )
        )

    return DocumentProcessResponse(
        sourceType=source_type,
        extractedTextPreview=preview_text[:300],
        chunkCount=len(response_chunks),
        vectorCount=len(response_chunks),
        chunks=response_chunks,
    )


def answer_document_question(req: DocumentQuestionRequest) -> DocumentQuestionResponse:
    question = (req.question or "").strip()
    if not question:
        raise ValueError("질문 내용을 입력해 주세요.")

    context_chunks = [chunk.strip() for chunk in req.chunks if chunk and chunk.strip()]
    if not context_chunks and not (req.summaryPreview or "").strip():
        raise ValueError("문서 요약 또는 청크가 없어 답변을 생성할 수 없습니다.")

    context_text = "\n\n".join(
        f"[참고 청크 {index}]\n{chunk[:1200]}"
        for index, chunk in enumerate(context_chunks[:5], start=1)
    )
    summary_text = (req.summaryPreview or "").strip()

    answer = generate_document_answer(req.title, question, summary_text, context_text)
    return DocumentQuestionResponse(
        answer=answer,
        usedChunkCount=min(len(context_chunks), 5),
    )


def generate_document_answer(title: str, question: str, summary_text: str, context_text: str) -> str:
    prompt = f"""
당신은 사내 온보딩 문서를 설명하는 도우미입니다.
아래 문서 요약과 참고 청크만 근거로 답변하세요.
문서에 없는 내용은 추측하지 말고, 부족하면 부족하다고 말하세요.
답변은 한국어 3~5문장으로 간결하게 작성하세요.

[문서 제목]
{title}

[문서 요약]
{summary_text or "없음"}

[참고 청크]
{context_text or "없음"}

[질문]
{question}
"""

    try:
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "당신은 온보딩 문서 질의응답 도우미입니다. 반드시 문서 근거 중심으로만 답변하세요.",
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            temperature=0.2,
        )

        answer = (response.choices[0].message.content or "").strip()
        if answer:
            return answer
    except Exception:
        pass

    return build_document_answer_fallback(title, question, summary_text, context_text)


def build_document_answer_fallback(title: str, question: str, summary_text: str, context_text: str) -> str:
    summary = summary_text.strip() if summary_text else ""
    sentences = split_summary_sentences(context_text)
    relevant_sentences = select_relevant_sentences(question, sentences)

    parts: list[str] = []
    if summary:
        parts.append(f"{title} 문서는 {summary}")

    if relevant_sentences:
        parts.append("관련 내용으로는 " + " ".join(relevant_sentences[:2]))

    if not parts:
        return "현재 문서에서 질문과 직접 연결되는 내용을 충분히 찾지 못했습니다. 문서를 다시 재처리하거나 질문을 더 구체적으로 입력해 주세요."

    parts.append("필요하면 질문을 더 구체적으로 입력하면 관련 부분을 다시 찾아드릴 수 있습니다.")
    return " ".join(parts)


def select_relevant_sentences(question: str, sentences: list[str]) -> list[str]:
    question_terms = extract_summary_tokens(question)
    if not question_terms:
        return sentences[:2]

    scored = []
    for sentence in sentences:
        normalized = sentence.lower()
        score = sum(1 for term in question_terms if term in normalized)
        if score > 0:
            scored.append((score, sentence))

    scored.sort(key=lambda item: item[0], reverse=True)
    return [sentence for _, sentence in scored[:3]]


def extract_text(file_path: str) -> tuple[str, str]:
    if file_path.startswith(("http://", "https://")):
        return extract_remote_text(file_path)

    if file_path.lower().endswith(".pdf"):
        return extract_local_pdf_text(file_path), "local-pdf"

    with open(file_path, "r", encoding="utf-8") as file:
        return file.read(), "local-text"


def extract_remote_text(file_path: str) -> tuple[str, str]:
    request_url = normalize_drive_url(file_path)
    try:
        response = requests.get(
            request_url,
            headers=REMOTE_REQUEST_HEADERS,
            timeout=(REMOTE_CONNECT_TIMEOUT, REMOTE_READ_TIMEOUT),
        )
    except requests.Timeout as exc:
        raise TimeoutError(
            f"원격 문서 응답 시간이 {REMOTE_READ_TIMEOUT}초를 초과했습니다. "
            "해당 URL을 브라우저에서 열어 접근 가능한지 확인하거나 파일을 로컬/드라이브 문서로 등록해 주세요."
        ) from exc

    response.raise_for_status()

    content_type = response.headers.get("content-type", "").lower()
    if "text/plain" in content_type or "application/json" in content_type:
        return decode_response_text(response), "remote-text"

    if "text/html" in content_type:
        return html_to_text(decode_response_text(response)), "remote-html"

    if "application/pdf" in content_type or request_url.lower().endswith(".pdf"):
        return extract_pdf_text(response.content), "remote-pdf"

    decoded = decode_response_text(response)
    return decoded, "remote-binary-text"


def extract_local_pdf_text(file_path: str) -> str:
    with open(file_path, "rb") as file:
        return extract_pdf_text(file.read())


def extract_pdf_text(pdf_bytes: bytes) -> str:
    text = extract_pdf_text_with_pypdf(pdf_bytes)
    if is_low_quality_extraction(text):
        fallback_text = extract_pdf_text_with_pdfplumber(pdf_bytes)
        if not is_low_quality_extraction(fallback_text):
            text = fallback_text

    if not text:
        raise ValueError("PDF에서 추출한 본문이 비어 있습니다.")

    return text


def extract_pdf_text_with_pypdf(pdf_bytes: bytes) -> str:
    reader = PdfReader(BytesIO(pdf_bytes))
    pages: list[str] = []

    for page in reader.pages:
        page_text = page.extract_text() or ""
        page_text = page_text.strip()
        if page_text:
            pages.append(page_text)

    return "\n\n".join(pages).strip()


def extract_pdf_text_with_pdfplumber(pdf_bytes: bytes) -> str:
    pages: list[str] = []

    with pdfplumber.open(BytesIO(pdf_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text() or ""
            page_text = page_text.strip()
            if page_text:
                pages.append(page_text)

    return "\n\n".join(pages).strip()


def normalize_drive_url(file_path: str) -> str:
    parsed = urlparse(file_path)
    if "drive.google.com" not in parsed.netloc:
        return file_path

    match = re.search(r"/file/d/([^/]+)/", file_path)
    if match:
        return f"https://drive.google.com/uc?export=download&id={match.group(1)}"

    query = parse_qs(parsed.query)
    if "id" in query and query["id"]:
        return f"https://drive.google.com/uc?export=download&id={query['id'][0]}"

    return file_path


def html_to_text(raw_html: str) -> str:
    without_script = re.sub(r"<script.*?>.*?</script>", " ", raw_html, flags=re.IGNORECASE | re.DOTALL)
    without_style = re.sub(r"<style.*?>.*?</style>", " ", without_script, flags=re.IGNORECASE | re.DOTALL)
    without_tags = re.sub(r"<[^>]+>", " ", without_style)
    return html.unescape(without_tags)


def decode_response_text(response: requests.Response) -> str:
    encoding = response.encoding or response.apparent_encoding or "utf-8"

    try:
        text = response.content.decode(encoding, errors="ignore")
    except LookupError:
        text = response.content.decode("utf-8", errors="ignore")

    return repair_mojibake_text(text)


def normalize_text(text: str) -> str:
    text = repair_mojibake_text(text)
    text = text.replace("\x00", " ")
    text = text.replace("\r", "\n")
    text = re.sub(r"[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"[ \t]{2,}", " ", text)
    return text.strip()


def split_text(text: str) -> list[str]:
    paragraphs = [paragraph.strip() for paragraph in text.split("\n\n") if paragraph.strip()]
    chunks: list[str] = []
    current = ""

    for paragraph in paragraphs:
        candidate = f"{current}\n\n{paragraph}".strip() if current else paragraph
        if len(candidate) <= MAX_CHUNK_CHARS:
            current = candidate
            continue

        if current:
            chunks.append(current)
            current = ""

        if len(paragraph) <= MAX_CHUNK_CHARS:
            current = paragraph
            continue

        chunks.extend(split_long_paragraph(paragraph))

    if current:
        chunks.append(current)

    return chunks


def split_long_paragraph(paragraph: str) -> list[str]:
    sentences = re.split(r"(?<=[.!?。！？])\s+", paragraph)
    chunks: list[str] = []
    current = ""

    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue

        candidate = f"{current} {sentence}".strip() if current else sentence
        if len(candidate) <= MAX_CHUNK_CHARS:
            current = candidate
            continue

        if current:
            chunks.append(current)

        if len(sentence) <= MAX_CHUNK_CHARS:
            current = sentence
        else:
            chunks.extend(
                sentence[index:index + MAX_CHUNK_CHARS].strip()
                for index in range(0, len(sentence), MAX_CHUNK_CHARS)
                if sentence[index:index + MAX_CHUNK_CHARS].strip()
            )
            current = ""

    if current:
        chunks.append(current)

    return chunks


def estimate_token_count(text: str) -> int:
    return max(1, math.ceil(len(text.split()) * 1.3))


def extract_section_title(text: str) -> str | None:
    first_line = text.splitlines()[0].strip()
    return first_line[:120] if first_line else None


def build_preview_text(title: str, text: str) -> str:
    try:
        summary = summarize_document(title, text)
        if summary:
            normalized_summary = normalize_summary_text(summary)
            if normalized_summary and not looks_like_leading_copy(normalized_summary, text):
                return normalized_summary
    except Exception:
        pass

    extracted_summary = build_extractive_summary(title, text)
    if extracted_summary:
        return extracted_summary

    return text[:300]


def build_section_title(document_title: str, chunk_no: int, text: str) -> str | None:
    extracted_title = extract_section_title(text)
    if extracted_title and is_readable_title(extracted_title):
        return extracted_title[:120]

    return f"{document_title} - Chunk {chunk_no}"


def build_extractive_summary(title: str, text: str) -> str | None:
    sentences = split_summary_sentences(text)
    if not sentences:
        return None

    title_tokens = set(extract_summary_tokens(title))
    text_tokens = extract_summary_tokens(text[:4000])
    token_weights: dict[str, int] = {}
    for token in text_tokens:
        token_weights[token] = token_weights.get(token, 0) + 1

    scored_sentences: list[tuple[float, int, str]] = []
    for index, sentence in enumerate(sentences[:20]):
        score = score_summary_sentence(sentence, title_tokens, token_weights)
        if score > 0:
            scored_sentences.append((score, index, sentence))

    if not scored_sentences:
        return None

    selected = sorted(
        sorted(scored_sentences, key=lambda item: item[0], reverse=True)[:2],
        key=lambda item: item[1],
    )
    sentences = [sentence for _, _, sentence in selected]
    if not sentences:
        return None

    if len(sentences) == 1:
        summary = f"{title} 문서는 {trim_summary_clause(sentences[0])}"
        return normalize_summary_text(summary)

    summary = (
        f"{title} 문서는 {trim_summary_clause(sentences[0])} "
        f"{trim_summary_clause(sentences[1])}"
    )
    return normalize_summary_text(summary)


def split_summary_sentences(text: str) -> list[str]:
    normalized = re.sub(r"\s+", " ", text)
    parts = re.split(r"(?<=[.!?。다요])\s+", normalized)
    results: list[str] = []
    for part in parts:
        sentence = part.strip()
        if len(sentence) < 20:
            continue
        if is_navigation_like_sentence(sentence):
            continue
        results.append(sentence[:180])
    return results


def extract_summary_tokens(text: str) -> list[str]:
    tokens = re.findall(r"[A-Za-z가-힣0-9]{2,}", text.lower())
    stopwords = {
        "the", "and", "for", "with", "that", "this", "from", "into", "http", "https",
        "docs", "main", "menu", "skip", "content", "home", "guide", "page",
        "문서", "내용", "관련", "대한", "위한", "에서", "으로", "하는", "하기", "있습니다",
    }
    return [token for token in tokens if token not in stopwords]


def score_summary_sentence(sentence: str, title_tokens: set[str], token_weights: dict[str, int]) -> float:
    sentence_tokens = extract_summary_tokens(sentence)
    if not sentence_tokens:
        return 0.0

    unique_tokens = set(sentence_tokens)
    title_bonus = sum(3 for token in unique_tokens if token in title_tokens)
    frequency_score = sum(min(token_weights.get(token, 0), 4) for token in unique_tokens)
    length_penalty = 0.0 if len(sentence) <= 150 else 1.5
    return float(title_bonus + frequency_score - length_penalty)


def normalize_summary_text(text: str) -> str:
    summary = re.sub(r"\s+", " ", text).strip()
    summary = re.sub(r"^(skip to .*? )", "", summary, flags=re.IGNORECASE)
    summary = re.sub(r"(skip to .*?$)", "", summary, flags=re.IGNORECASE)
    return summary[:240].strip()


def trim_summary_clause(sentence: str) -> str:
    trimmed = sentence.strip()
    trimmed = re.sub(r"^(이 문서는|본 문서는|문서는)\s*", "", trimmed)
    trimmed = re.sub(r"\s+", " ", trimmed)
    return trimmed[:120].rstrip(" ,")


def looks_like_leading_copy(summary: str, text: str) -> bool:
    original = re.sub(r"\s+", " ", text).strip()
    if not original:
        return False

    leading = original[:400]
    if summary in leading:
        return True

    summary_tokens = extract_summary_tokens(summary)
    leading_tokens = extract_summary_tokens(leading)
    if not summary_tokens or not leading_tokens:
        return False

    overlap = sum(1 for token in summary_tokens if token in leading_tokens)
    return overlap / max(1, len(summary_tokens)) > 0.85


def is_navigation_like_sentence(sentence: str) -> bool:
    lowered = sentence.lower()
    markers = [
        "skip to main", "skip to search", "main content", "breadcrumb",
        "navigation", "menu", "sign in", "log in", "home /", "search",
    ]
    return any(marker in lowered for marker in markers)


def is_readable_title(text: str) -> bool:
    candidate = text.strip()
    if not candidate:
        return False

    if len(candidate) < 2:
        return False

    allowed = sum(
        1 for ch in candidate
        if ch.isalnum() or ch.isspace() or ch in "-_:/()[]{}.,"
    )
    ratio = allowed / len(candidate)

    if ratio < 0.6:
        return False

    weird_markers = ["�", "\u0000", "硫", "??", "Ã", "ð", "ì", "ë", "ê", "í", "ã", "â"]
    if any(marker in candidate for marker in weird_markers):
        return False

    return True


def repair_mojibake_text(text: str) -> str:
    candidate = text.strip()
    if not candidate:
        return text

    suspicious_chars = sum(1 for ch in candidate if 0x00C0 <= ord(ch) <= 0x00FF)
    ratio = suspicious_chars / max(1, len(candidate))

    if ratio < 0.05:
        return text

    try:
        repaired = candidate.encode("latin1", errors="ignore").decode("utf-8", errors="ignore")
    except Exception:
        return text

    if not repaired.strip():
        return text

    repaired_suspicious = sum(1 for ch in repaired if 0x00C0 <= ord(ch) <= 0x00FF)
    if repaired_suspicious < suspicious_chars:
        return repaired

    return text


def is_low_quality_extraction(text: str) -> bool:
    candidate = (text or "").strip()
    if not candidate:
        return True

    sample = candidate[:1000]
    weird_chars = sum(
        1 for ch in sample
        if not (ch.isalnum() or ch.isspace() or ch in ".,!?;:'\"-_/()[]{}<>@#%&*+=~|")
    )
    weird_ratio = weird_chars / max(1, len(sample))

    gibberish_markers = ["�", "硫", "Ã", "ð", "¿", "½", "¼", " IZ5 ", " d'N^ "]
    if any(marker in sample for marker in gibberish_markers):
        return True

    return weird_ratio > 0.35


def make_hash_embedding(text: str, dimension: int) -> list[float]:
    vector = [0.0] * dimension
    tokens = re.findall(r"[\w가-힣]+", text.lower())

    if not tokens:
        return vector

    for token in tokens:
        digest = hashlib.sha256(token.encode("utf-8")).digest()
        index = int.from_bytes(digest[:4], "big") % dimension
        sign = 1.0 if digest[4] % 2 == 0 else -1.0
        weight = 1.0 + (digest[5] / 255.0)
        vector[index] += sign * weight

    norm = math.sqrt(sum(value * value for value in vector))
    if norm == 0:
        return vector

    return [round(value / norm, 6) for value in vector]
