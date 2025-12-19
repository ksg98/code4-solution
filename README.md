# Wisconsin Law Enforcement Legal Assistant

A production-ready Retrieval-Augmented Generation (RAG) system that enables Wisconsin law enforcement officers to quickly query state statutes, federal laws, case law, and department policies through a conversational AI interface.

## Tech Stack Overview

### Backend (Python)

| Category | Technology | Purpose |
|----------|------------|---------|
| **Framework** | FastAPI | High-performance async REST API |
| **Server** | Uvicorn + Uvloop | ASGI server with optimized async runtime |
| **Validation** | Pydantic | Data validation and settings management |
| **LLM Framework** | LangChain | RAG orchestration and document processing |
| **Vector DB** | Pinecone | Serverless vector database with hybrid search |
| **Embeddings** | Google Gemini `text-embedding-004` | 768-dimensional text embeddings |
| **LLM** | Google Gemini 2.5 Flash | Fast, accurate legal response generation |
| **Reranker** | Cohere `rerank-v4.0-pro` | Document relevance re-ranking |
| **Sparse Encoder** | Pinecone BM25 | Keyword-based sparse vector encoding |
| **PDF Processing** | PyPDF, PyMuPDF, Unstructured | Document extraction and parsing |
| **Testing** | pytest + pytest-asyncio | Async-compatible test framework |

### Frontend (TypeScript/React)

| Category | Technology | Purpose |
|----------|------------|---------|
| **Framework** | Next.js 16 | Full-stack React framework with App Router |
| **Language** | TypeScript 5 | Type-safe development |
| **UI Components** | Radix UI (20+ primitives) | Accessible, unstyled component primitives |
| **Styling** | Tailwind CSS 4 | Utility-first CSS framework |
| **Forms** | React Hook Form + Zod | Form state management with schema validation |
| **Charts** | Recharts | Data visualization for legal statistics |
| **Markdown** | React Markdown + Marked | Legal content rendering |
| **PDF Export** | jsPDF + jspdf-autotable | Report generation and export |
| **Word Export** | docx | DOCX document generation |
| **Animation** | Motion (Framer Motion) | UI animations and transitions |
| **Theming** | next-themes | Dark/light mode support |
| **Notifications** | Sonner | Toast notification system |
| **Storage** | Localforage | IndexedDB for conversation persistence |
| **Icons** | Lucide React | 300+ customizable icons |
| **Date Utils** | date-fns | Date formatting and manipulation |

### Infrastructure & APIs

| Service | Purpose |
|---------|---------|
| **Google AI Studio** | Gemini API for LLM and embeddings |
| **Pinecone** | Managed vector database (serverless) |
| **Cohere** | Document re-ranking API |

## Features

### RAG Pipeline
- **Hybrid Search**: Dense (semantic) + Sparse (BM25) vector search
- **Re-ranking**: Cohere-powered relevance scoring
- **Citation Extraction**: Automatic legal citation parsing
- **Confidence Scoring**: Based on reranker relevance scores
- **Streaming Responses**: Server-Sent Events (SSE) for real-time output

### Legal Intelligence
- **Sensitive Topic Detection**: Extra warnings for use of force queries
- **Jurisdiction Awareness**: Flags mixed or non-Wisconsin sources
- **Legal Metadata Parsing**: Statute numbers, case citations, document types
- **Cross-Reference Following**: Automatically fetches related statutes

### User Experience
- **Dark/Light Mode**: System-aware theme switching
- **Conversation History**: Persistent chat sessions via IndexedDB
- **Export Options**: PDF, DOCX, and JSON report generation
- **Responsive Design**: Mobile-friendly interface
- **Accessible UI**: WCAG-compliant Radix components

## Project Structure

```
wisconsin-legal-rag/
├── backend/                    # Python FastAPI
│   ├── app/
│   │   ├── main.py            # API endpoints & SSE streaming
│   │   ├── core/
│   │   │   └── config.py      # Pydantic settings
│   │   └── services/
│   │       ├── rag.py         # RAG pipeline & hybrid search
│   │       └── legal_parser.py # Legal metadata extraction
│   ├── scripts/               # Ingestion & processing
│   └── tests/                 # pytest test suite
├── frontend/                   # Next.js 16 App Router
│   └── src/
│       ├── app/               # Pages and layouts
│       ├── components/        # React components
│       │   └── ui/            # Radix/shadcn primitives
│       ├── contexts/          # React Context (auth)
│       ├── hooks/             # Custom hooks (useChat, etc.)
│       ├── lib/               # Utilities (API, storage, export)
│       └── types/             # TypeScript definitions
├── data/                       # Legal documents
│   └── raw/
│       ├── wisconsin_statute_* # State statutes (PDFs)
│       ├── wisconsin_case_*    # Court opinions
│       ├── wisconsin_policy_*  # State policies
│       ├── federal_statute_*   # Federal laws
│       └── federal_policy_*    # Federal policies
└── README.md
```

## Quick Start

### Prerequisites

- Python 3.12+
- Node.js 18+
- API Keys:
  - [Google AI Studio](https://aistudio.google.com/apikey) (Gemini LLM & Embeddings)
  - [Pinecone](https://app.pinecone.io) (Vector Database)
  - [Cohere](https://dashboard.cohere.com/api-keys) (Reranker)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Ingest documents to Pinecone
python scripts/ingest_all.py

# Run API server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/api/chat` | POST | Chat with RAG (non-streaming) |
| `/api/chat/stream` | POST | Chat with RAG (SSE streaming) |
| `/api/search` | POST | Direct search without LLM |
| `/api/sources` | GET | List knowledge base sources |

### Example Chat Request

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "What are the elements of OWI 3rd offense?"}'
```

## Data Sources

### Legal Document Collection

| Category | Source | Documents |
|----------|--------|-----------|
| **Wisconsin Statutes** | docs.legis.wisconsin.gov | Chapters 165, 175, 939-948, 961, 968 |
| **Federal Statutes** | Title 18 & 21 U.S.C. | Crimes, drugs, search & seizure |
| **Wisconsin Case Law** | wicourts.gov | State v. Grady, McAdory, Molde, Ramirez, Stetzer |
| **Federal Policy** | DOJ | Use of force, prosecution principles |
| **Wisconsin Policy** | Court of Appeals | Operating procedures, fax rules |

### Key Statutes Included

**Wisconsin:**
- Ch. 165 - Department of Justice
- Ch. 175 - Police Provisions
- Ch. 939 - Crimes: General Provisions
- Ch. 940 - Crimes Against Life & Health
- Ch. 941 - Crimes Against Public Safety
- Ch. 943 - Crimes Against Property
- Ch. 946 - Crimes Against Government
- Ch. 948 - Crimes Against Children
- Ch. 961 - Controlled Substances
- Ch. 968 - Criminal Procedure

**Federal:**
- Title 18 - Crimes and Criminal Procedure
- Title 21 - Food and Drugs (Controlled Substances)

## Sample Queries

```
"What are the elements required for OWI 3rd offense in Wisconsin?"
"Can I search a vehicle during a traffic stop without consent?"
"What's the statute of limitations for misdemeanor theft?"
"What Miranda warnings are required for juveniles?"
"What federal laws apply to drug trafficking?"
"Show me recent cases about Terry stops"
```

## Environment Variables

### Backend (.env)

```env
# Required
GOOGLE_API_KEY=your_google_api_key
PINECONE_API_KEY=your_pinecone_api_key
COHERE_API_KEY=your_cohere_api_key

# Optional (defaults shown)
PINECONE_INDEX_NAME=wisconsin-legal
LLM_MODEL=gemini-2.5-flash-preview-05-20
EMBEDDING_MODEL=models/text-embedding-004
RERANK_MODEL=rerank-v3.5
```

## Testing

```bash
cd backend
source venv/bin/activate

# Run all tests
pytest tests/ -v

# Run with async support
pytest tests/ -v --asyncio-mode=auto
```

## Architecture

```
User Query
    │
    ▼
┌─────────────────┐
│   Next.js UI    │  ◄── React + Radix UI + Tailwind
└────────┬────────┘
         │ SSE Stream
         ▼
┌─────────────────┐
│  FastAPI Server │  ◄── Pydantic validation
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Query Embedding│  ◄── Gemini text-embedding-004
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Hybrid Search  │  ◄── Pinecone (Dense + BM25 Sparse)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Re-ranking   │  ◄── Cohere rerank-v4.0-pro
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  LLM Generation │  ◄── Gemini 2.5 Flash
└────────┬────────┘
         │
         ▼
    Streamed Response
```

## License

This project is for demonstration purposes only.

## Disclaimer

This system provides legal information, not legal advice. Always consult your department's legal counsel for specific situations.
