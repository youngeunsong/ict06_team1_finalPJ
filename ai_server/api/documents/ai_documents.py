from fastapi import APIRouter, HTTPException

from schemas.document_schema import DocumentProcessRequest, DocumentProcessResponse
from services.document_processing_service import process_document

router = APIRouter()


@router.post("/process", response_model=DocumentProcessResponse)
def process_document_endpoint(req: DocumentProcessRequest):
    try:
        return process_document(req)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
