from pydantic import BaseModel, Field


class DocumentProcessRequest(BaseModel):
    docId: int | None = None
    title: str
    filePath: str


class DocumentChunkResponse(BaseModel):
    chunkNo: int
    content: str
    tokenCount: int
    sectionTitle: str | None = None
    embeddingData: str
    modelName: str = "hash-embedding-v1"
    dimension: int = 256


class DocumentProcessResponse(BaseModel):
    status: str = "SUCCESS"
    sourceType: str
    extractedTextPreview: str
    chunkCount: int
    vectorCount: int
    embeddingModel: str = "hash-embedding-v1"
    chunks: list[DocumentChunkResponse] = Field(default_factory=list)
