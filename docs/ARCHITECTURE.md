# System Architecture

## Overview

This RAG (Retrieval-Augmented Generation) system provides Wisconsin law enforcement officers with accurate legal information through a conversational interface. The system combines hybrid search, reranking, and LLM generation to deliver contextually relevant responses.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER INTERFACE                                   │
│                     Next.js 15 + shadcn + Magic UI                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  Landing    │  │   Login/    │  │    Chat     │  │      Sidebar        │ │
│  │ (Magic UI)  │  │   Signup    │  │  Interface  │  │  - Knowledge Base   │ │
│  │             │  │  (shadcn)   │  │  (shadcn)   │  │  - History          │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  │  - Sources          │ │
│                                                      └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FASTAPI BACKEND                                    │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                         API ENDPOINTS                                   │ │
│  │  POST /api/chat        - RAG chat (non-streaming)                      │ │
│  │  POST /api/chat/stream - RAG chat (SSE streaming)                      │ │
│  │  POST /api/search      - Direct search                                 │ │
│  │  GET  /api/sources     - Knowledge base info                           │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                       │
│  ┌───────────────────────────────────┴────────────────────────────────────┐ │
│  │                        RAG PIPELINE                                     │ │
│  │                                                                         │ │
│  │  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌──────────┐ │ │
│  │  │  Query  │──▶│ Enhance │──▶│ Hybrid  │──▶│ Rerank  │──▶│ Generate │ │ │
│  │  │  Input  │   │ + Spell │   │ Search  │   │ (Cohere)│   │ (Gemini) │ │ │
│  │  └─────────┘   │ Correct │   │         │   └─────────┘   └──────────┘ │ │
│  │                └─────────┘   │         │         │             │       │ │
│  │                     │        │ Dense + │         │             │       │ │
│  │              Synonyms,       │ Sparse  │    Top 5 with    Stream +    │ │
│  │              Abbreviations   │ (BM25)  │    Cross-refs    Citations   │ │
│  │                              └─────────┘                               │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                     SAFETY & QUALITY FEATURES                           │ │
│  │  - Sensitive topic detection (use of force)                            │ │
│  │  - Confidence scoring (high/medium/low)                                │ │
│  │  - Outdated info flagging                                              │ │
│  │  - Jurisdiction awareness                                              │ │
│  │  - Legal disclaimers                                                   │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PINECONE VECTOR DB                                 │
│                                                                              │
│  Index: wisconsin-legal                                                      │
│  Metric: dotproduct (required for hybrid search)                            │
│  Dimension: 768 (Gemini embedding size)                                     │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  Vector Format (Sparse-Dense):                                          │ │
│  │  {                                                                      │ │
│  │    "id": "346_63_chunk_0",                                              │ │
│  │    "values": [0.1, 0.2, ...],           // Dense (768d Gemini)         │ │
│  │    "sparse_values": {                                                   │ │
│  │      "indices": [102, 1987, ...],       // BM25 token indices          │ │
│  │      "values": [0.8, 0.6, ...]          // BM25 weights                │ │
│  │    },                                                                   │ │
│  │    "metadata": {                                                        │ │
│  │      "type": "statute",                                                 │ │
│  │      "statute_num": "346.63",                                           │ │
│  │      "title": "Operating under influence...",                           │ │
│  │      "jurisdiction": "wisconsin",                                       │ │
│  │      "status": "current",                                               │ │
│  │      "effective_date": "2024-01-01",                                    │ │
│  │      "text": "Full chunk text..."                                       │ │
│  │    }                                                                    │ │
│  │  }                                                                      │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  Namespaces: statute | case_law | policy | training                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Ingestion Pipeline

```
Raw Documents → Parse → Chunk → Embed → Upsert
     │            │        │       │        │
  HTML/PDF    Extract   ~400    Gemini   Pinecone
              text     tokens   + BM25   (hybrid)
```

### 2. Query Pipeline

```
User Query → Spell Correct → Expand → Embed → Hybrid Search → Rerank → Generate
     │            │            │         │          │            │          │
  "OWI"     Fix typos      Add       Gemini     Dense+       Cohere     Gemini
            "mirdana"    synonyms    768d       Sparse      Top 5       2.5 Flash
            →"miranda"   "DUI"                  Top 20
```

## Component Details

### Query Enhancement (`query_enhancer.py`)

1. **Spell Correction**: Fixes common misspellings using:
   - Direct mapping (e.g., "mirdana" → "miranda")
   - Fuzzy matching against legal terms dictionary

2. **Abbreviation Expansion**: Expands LEO terms:
   - OWI → "operating while intoxicated"
   - PC → "probable cause"
   - RS → "reasonable suspicion"

3. **Synonym Addition**: Adds related terms:
   - "drunk driving" → adds "OWI", "DUI", "DWI"
   - "search" → adds "search and seizure", "4th amendment"

### Hybrid Search (`retrieval.py`)

Combines two search methods:

1. **Dense (Semantic)**: Gemini `text-embedding-004` (768 dimensions)
   - Captures meaning and context
   - Good for paraphrased queries

2. **Sparse (Keyword)**: BM25 via `pinecone-text`
   - Exact term matching
   - Critical for statute numbers like "346.63"

### Citation Chain Following

When results contain cross-references like "see also § 940.01":

1. Extract citations using regex patterns
2. Filter out already-retrieved statutes
3. Fetch up to 2 additional cross-referenced statutes
4. Append to results with `is_cross_reference: true`

### Reranking (`retrieval.py`)

Uses Cohere `rerank-v3.5`:
- Input: Top 20 results from hybrid search
- Output: Top 5 most relevant results
- Provides relevance scores (0-1) for confidence calculation

### Response Generation (`generator.py`)

1. **System Prompt**: Legal-specific guidelines
2. **Context Formatting**: Includes statute numbers, effective dates
3. **Safety Features**:
   - Sensitive topic detection
   - Outdated info warnings
   - Jurisdiction flags
   - Legal disclaimers

## Metadata Schema

| Field | Type | Description |
|-------|------|-------------|
| `type` | enum | statute, case_law, policy, training |
| `statute_num` | string | e.g., "346.63" |
| `case_citation` | string | e.g., "State v. Post" |
| `title` | string | Document title |
| `jurisdiction` | enum | wisconsin, federal |
| `status` | enum | current, superseded |
| `effective_date` | string | ISO date |
| `chapter` | string | e.g., "Criminal Code" |
| `section` | string | e.g., "OWI" |
| `url` | string | Source URL |
| `text` | string | Full chunk text |

## Design Decisions

### 1. Why Hybrid Search?

Legal queries require both:
- **Semantic**: "drunk driving penalties" should match OWI statutes
- **Keyword**: "§ 346.63" must match exactly

Hybrid search with Pinecone's sparse-dense vectors provides both.

### 2. Why Cohere Reranker?

Initial retrieval (top 20) optimizes for recall. Reranking optimizes for precision by using a cross-encoder model that considers query-document pairs together.

### 3. Why Gemini 2.5 Flash?

- Free tier: 250 requests/day
- Fast response times
- Good instruction following for legal prompts
- Supports streaming

### 4. Why BM25 over TF-IDF?

BM25 normalizes for document length and has better handling of term frequency saturation, important for legal documents that vary greatly in length.

## Scalability Considerations

### Current Limitations (Free Tier)

| Service | Limit | Notes |
|---------|-------|-------|
| Pinecone | 2GB storage | ~2M vectors |
| Gemini | 250 req/day | LLM calls |
| Cohere | 1000 req/month | Reranking |

### Scaling Path

1. **Storage**: Upgrade to Pinecone paid tier
2. **Throughput**: Add request queuing, caching
3. **Multi-tenancy**: Namespace per department
4. **Updates**: Implement incremental ingestion

## Security Measures

1. **API Keys**: Stored in environment variables, never in code
2. **CORS**: Restricted to frontend origin
3. **Input Validation**: Pydantic models validate all requests
4. **No PII Storage**: System doesn't store user data
5. **Audit Logging**: All queries can be logged (not implemented)

## Error Handling

1. **Retrieval Failures**: Return empty results with explanation
2. **LLM Failures**: Fallback to search-only response
3. **Rate Limits**: Exponential backoff with tenacity
4. **Invalid Queries**: Validate and sanitize input
