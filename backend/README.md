# Wisconsin Legal RAG System - Backend

A production-ready RAG (Retrieval-Augmented Generation) system for Wisconsin law enforcement legal queries, built with FastAPI, Google Gemini, Pinecone, and Cohere.

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                       │
│                    HTTP Requests (REST API)                     │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                      Backend (FastAPI)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   API Layer  │  │   Services   │  │   Parsers    │          │
│  │  (main.py)   │  │   (rag.py)   │  │(legal_parser)│          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└───────────┬──────────────────┬──────────────────┬───────────────┘
            │                  │                  │
┌───────────▼────────┐ ┌──────▼──────┐ ┌─────────▼────────┐
│  Google Gemini     │ │  Pinecone   │ │  Cohere Rerank   │
│  (LLM & Embedding) │ │  (Vector DB)│ │  (Re-ranking)    │
└────────────────────┘ └─────────────┘ └──────────────────┘
```

### Components

#### 1. **API Layer** (`app/main.py`)
- FastAPI application with CORS support
- RESTful endpoints for chat, search, and health checks
- Request/response validation with Pydantic models
- Error handling and logging

#### 2. **RAG Service** (`app/services/rag.py`)
- **Embedding Generation**: Google Gemini text-embedding-004 (768 dimensions)
- **Vector Search**: Pinecone similarity search (top_k=20)
- **Re-ranking**: Cohere rerank-v4.0-pro (top_n=5)
- **LLM Generation**: Google Gemini 2.0 Flash with streaming support
- **Context Management**: Intelligent chunk retrieval and formatting

#### 3. **Legal Parser** (`app/services/legal_parser.py`)
- PDF text extraction using PyPDF2
- Legal citation detection and extraction
- Document metadata parsing (chapter, section, title)
- Chunk creation with overlap (500 chars, 100 char overlap)
- Document type classification (Statutes, Cases, Policies, Training)

#### 4. **Configuration** (`app/core/config.py`)
- Environment variable management
- API key validation
- Model configuration
- Pinecone index settings

### Data Flow

```
User Query → Embedding → Vector Search → Re-rank → LLM → Response
     │           │            │             │         │        │
     │           │            │             │         │        │
   Chat      Gemini      Pinecone       Cohere    Gemini   Stream
  Input    Embedding    (Semantic)    (Precision)  (RAG)   to User
```

## 🚀 Getting Started

### Prerequisites

- Python 3.12+
- pip or uv package manager
- API keys for:
  - [Google Gemini](https://aistudio.google.com/apikey)
  - [Pinecone](https://app.pinecone.io)
  - [Cohere](https://dashboard.cohere.com/api-keys)

### Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On macOS/Linux
   # OR
   venv\Scripts\activate  # On Windows
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your API keys
   ```

   Required variables:
   ```env
   GOOGLE_API_KEY=your_google_api_key_here
   PINECONE_API_KEY=your_pinecone_api_key_here
   PINECONE_HOST=your_pinecone_host_here
   COHERE_API_KEY=your_cohere_api_key_here
   PINECONE_INDEX_NAME=wisconsin-legal
   RERANK_MODEL=rerank-v4.0-pro
   ```

5. **Run the development server**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

   The API will be available at: `http://localhost:8000`

### Alternative: Using UV

```bash
# Install uv if not already installed
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install dependencies
uv pip install -r requirements.txt

# Run server
uv run uvicorn app.main:app --reload
```

## 📚 API Documentation

### Interactive Docs

Once the server is running, access:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Endpoints

#### `POST /api/chat`
Chat with the legal RAG system.

**Request:**
```json
{
  "message": "What are the elements of first-degree intentional homicide?",
  "conversation_id": "optional-uuid",
  "filters": {
    "document_type": ["Statutes"],
    "jurisdiction": "wisconsin"
  }
}
```

**Response (Streaming):**
```
data: {"type": "answer", "content": "According to Wisconsin..."}
data: {"type": "sources", "sources": [...]}
data: {"type": "done"}
```

#### `POST /api/search`
Search legal documents.

**Request:**
```json
{
  "query": "search warrant requirements",
  "filters": {
    "document_type": ["Statutes", "Case Law"]
  },
  "top_k": 10
}
```

**Response:**
```json
{
  "results": [
    {
      "text": "...",
      "metadata": {
        "source": "ch_968_criminal_procedure.pdf",
        "document_type": "Statutes",
        "page": 45
      },
      "score": 0.87
    }
  ]
}
```

#### `GET /health`
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-18T10:30:00Z"
}
```

## 🧪 Testing

### Run Tests

```bash
# Activate virtual environment
source venv/bin/activate

# Run all tests
python test_legal_parser.py

# Test with verbose output
python -v test_legal_parser.py
```

### Test Coverage

The test suite includes:
- ✅ PDF parsing and text extraction
- ✅ Legal citation detection
- ✅ Metadata extraction
- ✅ Chunk creation with overlap
- ✅ Document type classification
- ✅ Edge cases and error handling

### Manual Testing

Test the RAG pipeline:

```bash
# Test embedding generation
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is first-degree murder in Wisconsin?"}'

# Test search
curl -X POST http://localhost:8000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "miranda rights", "top_k": 5}'

# Test health
curl http://localhost:8000/health
```

## 📁 Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application
│   ├── core/
│   │   ├── __init__.py
│   │   └── config.py          # Configuration management
│   └── services/
│       ├── __init__.py
│       ├── legal_parser.py    # PDF parsing & processing
│       └── rag.py             # RAG implementation
├── data/
│   └── raw/                   # Legal documents
│       ├── statutes/          # Wisconsin statutes
│       ├── cases/             # Case law
│       ├── policies/          # Department policies
│       └── federal/           # Federal documents
│           ├── statutes/
│           ├── cases/
│           └── policies/
├── test_legal_parser.py       # Unit tests
├── requirements.txt           # Python dependencies
├── .env.example              # Environment template
└── README.md                 # This file
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GOOGLE_API_KEY` | Google Gemini API key | Required |
| `PINECONE_API_KEY` | Pinecone API key | Required |
| `PINECONE_HOST` | Pinecone index host URL | Required |
| `COHERE_API_KEY` | Cohere API key | Required |
| `PINECONE_INDEX_NAME` | Pinecone index name | `wisconsin-legal` |
| `RERANK_MODEL` | Cohere rerank model | `rerank-v4.0-pro` |

### Model Configuration

- **LLM**: Google Gemini 2.0 Flash (latest)
- **Embeddings**: text-embedding-004 (768 dimensions)
- **Reranker**: Cohere rerank-v4.0-pro
- **Vector DB**: Pinecone (Serverless)

## 📊 Data Processing

### Document Categories

1. **Wisconsin Statutes** (10 PDFs)
   - Criminal law chapters (939-948, 961, 968)
   - Police provisions (175)
   - Department of Justice (165)

2. **Wisconsin Case Law** (6 PDFs)
   - Supreme Court opinions
   - Court of Appeals decisions

3. **Wisconsin Policies** (2 PDFs)
   - Court procedures
   - Operating guidelines

4. **Federal Documents** (15 PDFs)
   - US Code (Title 18, 21, 42)
   - Federal policies

### Processing Pipeline

1. **Extract**: PDF → Text
2. **Parse**: Detect citations, metadata
3. **Chunk**: 500 char chunks, 100 char overlap
4. **Embed**: Generate 768-dim vectors
5. **Index**: Store in Pinecone with metadata
6. **Query**: Semantic search + rerank

## 🐛 Debugging

### Enable Debug Logging

```python
# In app/main.py
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Common Issues

**Issue**: `ModuleNotFoundError: No module named 'google.generativeai'`
- **Fix**: `pip install -r requirements.txt`

**Issue**: `Connection error to Pinecone`
- **Fix**: Check `PINECONE_HOST` and `PINECONE_API_KEY`

**Issue**: `Rate limit exceeded`
- **Fix**: Add delays or upgrade API tier

## 🚢 Deployment

### Production Checklist

- [ ] Set production environment variables
- [ ] Use production-grade ASGI server (Gunicorn + Uvicorn)
- [ ] Enable HTTPS/TLS
- [ ] Set up monitoring and logging
- [ ] Configure CORS for production domain
- [ ] Set up rate limiting
- [ ] Enable API authentication

### Deploy with Docker

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Deploy with Gunicorn

```bash
gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000
```

## 📝 License

This project is part of a take-home assignment for CodeFour.

## 🤝 Contributing

This is an assignment project. For questions, contact the developer.

## 📞 Support

- API Documentation: `/docs`
- Health Check: `/health`
- Sample Prompts: See `../sample_prompts.md`
