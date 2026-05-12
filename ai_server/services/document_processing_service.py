#
#  @FileName : document_processing_service.py
#  @Description : 문서 본문 추출/청크 분할/벡터 생성 서비스 모듈
#  @Author : 김다솜
#  @Date : 2026. 05. 12
#  @Modification_History
#  @
#  @ 수정일자        수정자          수정내용
#  @ ----------    ---------    -------------------------------
#  @ 2026.05.12    김다솜        문서 자동 처리 파이프라인 구현 및 상단 주석 보강
#

import hashlib
import html
import json
import math
import re
from io import BytesIO
from urllib.parse import parse_qs, urlparse

import pdfplumber
import requests
from pypdf import PdfReader

from services.ollama_client import summarize_document, suggest_section_title
from schemas.document_schema import (
    DocumentChunkResponse,
    DocumentProcessRequest,
    DocumentProcessResponse,
)

MAX_CHUNK_CHARS = 900
EMBED_DIMENSION = 256


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

    preview_text = build_preview_text(cleaned_text)
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


def extract_text(file_path: str) -> tuple[str, str]:
    if file_path.startswith(("http://", "https://")):
        return extract_remote_text(file_path)

    if file_path.lower().endswith(".pdf"):
        return extract_local_pdf_text(file_path), "local-pdf"

    with open(file_path, "r", encoding="utf-8") as file:
        return file.read(), "local-text"


def extract_remote_text(file_path: str) -> tuple[str, str]:
    request_url = normalize_drive_url(file_path)
    response = requests.get(request_url, timeout=30)
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


def build_preview_text(text: str) -> str:
    try:
        summary = summarize_document(text)
        if summary:
            return summary
    except Exception:
        pass

    return text[:300]


def build_section_title(document_title: str, chunk_no: int, text: str) -> str | None:
    try:
        title = suggest_section_title(text)
        if title and is_readable_title(title):
            return title[:120]
    except Exception:
        pass

    extracted_title = extract_section_title(text)
    if extracted_title and is_readable_title(extracted_title):
        return extracted_title[:120]

    return f"{document_title} - Chunk {chunk_no}"


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
