from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import json

from app.core.config import get_settings

settings = get_settings()

app = FastAPI(title="Wisconsin Legal RAG API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Models
class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    query: str
    history: list[ChatMessage] = []


class SearchRequest(BaseModel):
    query: str
    top_k: int = 10


# Endpoints
@app.get("/")
async def root():
    return {"status": "ok"}


@app.get("/health")
async def health():
    return {"status": "healthy", "model": settings.llm_model}


@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    from app.services.rag import chat
    try:
        return await chat(request.query, request.history)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/chat/stream")
async def chat_stream_endpoint(request: ChatRequest):
    from app.services.rag import chat_stream

    async def generate():
        try:
            async for chunk in chat_stream(request.query, request.history):
                yield f"data: {json.dumps(chunk)}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'data': str(e)})}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")


@app.post("/api/search")
async def search_endpoint(request: SearchRequest):
    from app.services.rag import search
    try:
        return await search(request.query, request.top_k)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/sources")
async def sources_endpoint():
    from app.services.rag import get_sources
    try:
        return await get_sources()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ingest")
async def ingest_endpoint():
    from app.services.rag import ingest_documents
    try:
        return await ingest_documents()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/documents")
async def list_documents():
    from app.services.rag import list_documents
    try:
        return await list_documents()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/documents/upload")
async def upload_document(file: UploadFile = File(...)):
    from app.services.rag import upload_document
    try:
        return await upload_document(file)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/documents/{filename}")
async def delete_document(filename: str):
    from app.services.rag import delete_document
    try:
        return await delete_document(filename)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
