"""
RAG service using LangChain with Pinecone Hybrid Search, Cohere v4.0 Rerank.
Updated for December 2025 with latest LangChain, Pinecone, and Cohere integrations.
Enhanced with legal-specific intelligence for Wisconsin statutes.
"""
from pathlib import Path
from typing import List, Dict, Any, AsyncGenerator
import logging
import ssl
import certifi

# Fix SSL certificate issues for NLTK
ssl._create_default_https_context = ssl._create_unverified_context

import google.generativeai as genai

from app.core.config import get_settings
from app.services.legal_parser import extract_legal_metadata, normalize_statute_number

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()

# Data folder in project root (documents are in data/raw/)
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent
DATA_DIR = PROJECT_ROOT / "data" / "raw"
BM25_PATH = PROJECT_ROOT / "data" / "bm25_encoder.json"

# Lazy-loaded components
_pc = None
_index = None
_embeddings = None
_bm25 = None
_retriever = None
_reranker = None

# Configure Gemini at import
genai.configure(api_key=settings.google_api_key)

SYSTEM_PROMPT = """You are a legal assistant for Wisconsin law enforcement.

CRITICAL RULES:
1. Only use information from the provided context below
2. Always cite statute numbers when referencing laws (e.g., § 346.63)
3. If the information is not in the context, clearly state "I don't have information about that in my knowledge base"
4. Be precise and accurate - this information may be used in law enforcement duties
5. Provide clear, actionable guidance based solely on the context

JURISDICTION & CURRENCY WARNINGS:
6. Always specify that information applies to WISCONSIN law specifically
7. If you notice effective dates or years mentioned, include them in your response
8. If asked about federal law or other jurisdictions, clearly note that your knowledge base focuses on Wisconsin
9. Remind users that laws may have changed since the document dates

SENSITIVE TOPICS:
10. For use of force queries: Emphasize the need to follow department policy and consult legal counsel
11. For civil rights matters: Note constitutional protections and Miranda requirements
12. For juvenile matters: Highlight special procedures and protections for minors

DISCLAIMER:
13. End every response with: "⚖️ This is legal information for Wisconsin law enforcement, not legal advice. Always consult your department's legal counsel for specific situations."

Context:
{context}

Query: {query}"""


def _get_pinecone():
    global _pc
    if _pc is None:
        from pinecone import Pinecone
        _pc = Pinecone(api_key=settings.pinecone_api_key)
    return _pc


def _get_index():
    global _index
    if _index is None:
        pc = _get_pinecone()
        try:
            if settings.pinecone_host:
                _index = pc.Index(host=settings.pinecone_host)
            else:
                _index = pc.Index(settings.pinecone_index_name)
        except Exception:
            pass
    return _index


def _get_embeddings():
    global _embeddings
    if _embeddings is None:
        from langchain_google_genai import GoogleGenerativeAIEmbeddings
        _embeddings = GoogleGenerativeAIEmbeddings(
            model=settings.embedding_model,
            google_api_key=settings.google_api_key,
            task_type="retrieval_document"
        )
    return _embeddings


def _get_bm25():
    global _bm25
    if _bm25 is None:
        from pinecone_text.sparse import BM25Encoder
        if BM25_PATH.exists():
            _bm25 = BM25Encoder().load(str(BM25_PATH))
    return _bm25


def _get_retriever():
    global _retriever
    if _retriever is None:
        idx = _get_index()
        bm25 = _get_bm25()
        if idx is not None and bm25 is not None:
            from langchain_community.retrievers import PineconeHybridSearchRetriever
            _retriever = PineconeHybridSearchRetriever(
                embeddings=_get_embeddings(),
                sparse_encoder=bm25,
                index=idx,
                top_k=settings.top_k,
                alpha=0.5
            )
    return _retriever


def _get_reranker():
    global _reranker
    if _reranker is None:
        from langchain_cohere import CohereRerank
        _reranker = CohereRerank(
            model=settings.rerank_model,
            cohere_api_key=settings.cohere_api_key,
            top_n=settings.top_n
        )
    return _reranker


def format_docs(docs) -> str:
    if not docs:
        return "No relevant documents found."
    formatted = []
    for doc in docs:
        source = doc.metadata.get('source', 'Unknown Source')
        formatted.append(f"[Source: {source}]\n{doc.page_content}")
    return "\n\n---\n\n".join(formatted)


def format_source_metadata(metadata: dict) -> dict:
    """Format document metadata for frontend consumption with legal-specific fields."""
    source_path = metadata.get('source', '')

    # Extract filename from path
    filename = Path(source_path).name if source_path else 'Unknown'

    # Determine document type - prioritize legal metadata over file extension
    doc_type = metadata.get('doc_type')
    if not doc_type:
        ext = Path(source_path).suffix.lower() if source_path else ''
        type_map = {'.pdf': 'pdf', '.txt': 'txt', '.md': 'md'}
        doc_type = type_map.get(ext, 'document')

    # Build title with legal context
    title = metadata.get('title', filename)

    # If we have statute info, enhance the title
    if metadata.get('statute_num'):
        statute_title = metadata.get('section_title', '')
        if statute_title:
            title = f"§ {metadata['statute_num']} - {statute_title}"
        else:
            title = f"§ {metadata['statute_num']}"
    elif not title or title == 'Unknown':
        title = filename

    formatted = {
        "type": doc_type,
        "title": title,
        "source": source_path,
        "page": metadata.get('page'),
        "jurisdiction": metadata.get('jurisdiction', 'wisconsin'),
        # Legal-specific metadata
        "statute_num": metadata.get('statute_num'),
        "chapter": metadata.get('chapter'),
        "section": metadata.get('section'),
        "subsection": metadata.get('subsection'),
        "case_citation": metadata.get('case_citation'),
        "effective_date": metadata.get('effective_date'),
        "hierarchy_level": metadata.get('hierarchy_level'),
        "cross_references": metadata.get('cross_references', []),
        "statutes_cited": metadata.get('statutes_cited', []),
        "cases_cited": metadata.get('cases_cited', []),
        "is_sensitive": metadata.get('is_sensitive', False),
        "sensitive_topic": metadata.get('sensitive_topic'),
    }

    # Remove None values to keep response clean
    return {k: v for k, v in formatted.items() if v is not None}


async def chat(query: str, history: list = None) -> Dict[str, Any]:
    """RAG chat pipeline with hybrid search and Cohere v4.0 reranking."""
    retriever = _get_retriever()

    if retriever is None:
        return {
            "answer": "Vector database not initialized. Please run /api/ingest first to process documents.",
            "sources": [],
            "confidence": "low",
            "is_sensitive": False,
            "disclaimer": "This is legal information, not legal advice."
        }

    docs = retriever.invoke(query)

    reranker = _get_reranker()
    reranked = False
    if docs and reranker:
        docs = reranker.compress_documents(documents=docs, query=query)
        reranked = True

    context = format_docs(docs)
    model = genai.GenerativeModel(settings.llm_model)
    response = model.generate_content(SYSTEM_PROMPT.format(context=context, query=query))

    # Get scores - reranker adds relevance_score, otherwise estimate based on position
    def get_score(doc, idx):
        if reranked:
            return doc.metadata.get("relevance_score", 0.5)
        return max(0.9 - (idx * 0.1), 0.1)  # Decreasing score by position

    confidence = "low"
    if docs:
        top_score = get_score(docs[0], 0)
        confidence = "high" if top_score > 0.8 else "medium" if top_score > 0.5 else "low"

    sources = [{
        "id": str(i),
        "text": doc.page_content[:500],
        "metadata": format_source_metadata(doc.metadata),
        "score": get_score(doc, i)
    } for i, doc in enumerate(docs)]

    return {
        "answer": response.text + "\n\n---\nThis is legal information, not legal advice.",
        "sources": sources,
        "confidence": confidence,
        "is_sensitive": False,
        "disclaimer": "This is legal information, not legal advice."
    }


async def chat_stream(query: str, history: list = None) -> AsyncGenerator[Dict[str, Any], None]:
    """Streaming RAG chat with SSE."""
    retriever = _get_retriever()

    if retriever is None:
        yield {"type": "content", "data": "Vector database not initialized. Please run /api/ingest first."}
        yield {"type": "done"}
        return

    docs = retriever.invoke(query)

    reranker = _get_reranker()
    reranked = False
    if docs and reranker:
        docs = reranker.compress_documents(documents=docs, query=query)
        reranked = True

    # Get scores - reranker adds relevance_score, otherwise estimate based on position
    def get_score(doc, idx):
        if reranked:
            return doc.metadata.get("relevance_score", 0.5)
        return max(0.9 - (idx * 0.1), 0.1)

    sources = [{
        "id": str(i),
        "text": doc.page_content[:500],
        "metadata": format_source_metadata(doc.metadata),
        "score": get_score(doc, i)
    } for i, doc in enumerate(docs)]
    yield {"type": "sources", "data": sources}

    confidence = "low"
    if docs:
        top_score = get_score(docs[0], 0)
        confidence = "high" if top_score > 0.8 else "medium" if top_score > 0.5 else "low"
    yield {"type": "metadata", "data": {"confidence": confidence, "is_sensitive": False}}

    context = format_docs(docs)
    model = genai.GenerativeModel(settings.llm_model)
    for chunk in model.generate_content(SYSTEM_PROMPT.format(context=context, query=query), stream=True):
        if chunk.text:
            yield {"type": "content", "data": chunk.text}

    yield {"type": "done"}


async def search(query: str, top_k: int = 10, filters: dict = None) -> Dict[str, Any]:
    """Direct hybrid search without LLM generation."""
    retriever = _get_retriever()
    if retriever is None:
        return {"results": [], "query": query}

    docs = retriever.invoke(query)[:top_k]

    # Estimate scores based on position (no reranker for search)
    results = [{
        "id": str(i),
        "text": doc.page_content,
        "metadata": format_source_metadata(doc.metadata),
        "score": max(0.9 - (i * 0.05), 0.1)
    } for i, doc in enumerate(docs)]

    return {"results": results, "query": query}


async def get_sources() -> Dict[str, Any]:
    """Get index statistics."""
    idx = _get_index()
    if idx is None:
        return {"sources": [], "total_chunks": 0, "last_ingestion": None}

    stats = idx.describe_index_stats()
    return {
        "sources": [],
        "total_chunks": stats.get("total_vector_count", 0),
        "last_ingestion": None
    }


async def ingest_documents() -> Dict[str, Any]:
    """Ingest documents into Pinecone with hybrid search support."""
    global _bm25, _retriever, _index

    logger.info("Starting document ingestion...")

    try:
        from pinecone import Pinecone, ServerlessSpec
        from pinecone_text.sparse import BM25Encoder
        from langchain_community.retrievers import PineconeHybridSearchRetriever
        from langchain_community.document_loaders import PyPDFDirectoryLoader, TextLoader
        from langchain_text_splitters import RecursiveCharacterTextSplitter

        if not DATA_DIR.exists():
            DATA_DIR.mkdir(parents=True)
            logger.error("Data folder created but is empty")
            return {"status": "error", "message": "Data folder created but is empty."}

        logger.info(f"Loading documents from {DATA_DIR}")

        # Load documents recursively
        docs = []
        try:
            pdf_loader = PyPDFDirectoryLoader(str(DATA_DIR), recursive=True)
            pdf_docs = pdf_loader.load()
            docs.extend(pdf_docs)
            logger.info(f"Loaded {len(pdf_docs)} PDF documents")
        except Exception as e:
            logger.error(f"PDF loading error: {e}")

        for txt_file in DATA_DIR.rglob("*.txt"):
            try:
                txt_docs = TextLoader(str(txt_file)).load()
                docs.extend(txt_docs)
                logger.info(f"Loaded {txt_file.name}")
            except Exception as e:
                logger.error(f"Error loading {txt_file}: {e}")

        for md_file in DATA_DIR.rglob("*.md"):
            try:
                md_docs = TextLoader(str(md_file)).load()
                docs.extend(md_docs)
                logger.info(f"Loaded {md_file.name}")
            except Exception as e:
                logger.error(f"Error loading {md_file}: {e}")

        if not docs:
            logger.error("No documents found")
            return {"status": "error", "message": "No documents found in data directory"}

        logger.info(f"Total documents loaded: {len(docs)}")

        # Extract legal metadata from documents before chunking
        logger.info("Extracting legal metadata from documents...")
        for doc in docs:
            legal_meta = extract_legal_metadata(doc.page_content, doc.metadata.get('source', ''))
            # Merge legal metadata with existing metadata
            doc.metadata.update(legal_meta)
        logger.info(f"Legal metadata extracted for {len(docs)} documents")

        # Split documents with legal-aware separators
        logger.info("Splitting documents into chunks...")
        # Enhanced separators that respect legal structure
        legal_separators = [
            "\n\n\n",  # Major section breaks
            "\n\n",    # Paragraph breaks
            "\n",      # Line breaks
            ". ",      # Sentences
            " ",       # Words
            ""         # Characters
        ]
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.chunk_size,
            chunk_overlap=settings.chunk_overlap,
            length_function=len,
            separators=legal_separators
        )
        chunks = text_splitter.split_documents(docs)

        # Extract legal metadata for each chunk (for more granular analysis)
        logger.info("Enriching chunk metadata...")
        for chunk in chunks:
            if chunk.page_content:
                # Re-extract metadata at chunk level for better granularity
                chunk_legal_meta = extract_legal_metadata(chunk.page_content, chunk.metadata.get('source', ''))
                # Preserve parent metadata, only update with chunk-specific info
                for key, value in chunk_legal_meta.items():
                    if value and (key not in chunk.metadata or not chunk.metadata[key]):
                        chunk.metadata[key] = value

        texts = [chunk.page_content for chunk in chunks]
        logger.info(f"Created {len(chunks)} chunks with enriched legal metadata")

        # Fit BM25 encoder
        logger.info("Fitting BM25 encoder...")
        _bm25 = BM25Encoder()
        _bm25.fit(texts)
        BM25_PATH.parent.mkdir(parents=True, exist_ok=True)
        _bm25.dump(str(BM25_PATH))
        logger.info(f"BM25 encoder saved to {BM25_PATH}")

        # Create or get Pinecone index
        logger.info("Connecting to Pinecone...")
        pc = _get_pinecone()
        index_name = settings.pinecone_index_name
        existing_indexes = [idx['name'] for idx in pc.list_indexes()]
        logger.info(f"Existing indexes: {existing_indexes}")

        import time

        # Delete existing index if it exists (to ensure correct config for hybrid search)
        if index_name in existing_indexes:
            logger.info(f"Deleting existing index: {index_name} to recreate with correct hybrid search config")
            pc.delete_index(index_name)
            time.sleep(5)

        # Create new index with dotproduct metric (required for hybrid search)
        logger.info(f"Creating new index: {index_name} with dotproduct metric")
        pc.create_index(
            name=index_name,
            dimension=768,  # Gemini text-embedding-004 dimension
            metric="dotproduct",  # Required for sparse vectors in hybrid search
            spec=ServerlessSpec(cloud="aws", region="us-east-1")
        )

        # Wait for index to be ready
        logger.info("Waiting for index to be ready...")
        time.sleep(15)

        _index = pc.Index(index_name)
        logger.info(f"Connected to index: {index_name}")

        # Create retriever and add documents
        logger.info("Creating hybrid retriever and adding documents...")
        _retriever = PineconeHybridSearchRetriever(
            embeddings=_get_embeddings(),
            sparse_encoder=_bm25,
            index=_index,
            top_k=settings.top_k,
            alpha=0.5
        )
        _retriever.add_texts(texts=texts, metadatas=[chunk.metadata for chunk in chunks])
        logger.info("Documents added to Pinecone successfully")

        return {
            "status": "success",
            "message": "Documents ingested successfully",
            "documents_loaded": len(docs),
            "chunks_created": len(chunks),
            "index_name": index_name
        }

    except Exception as e:
        logger.exception(f"Ingestion failed: {e}")
        return {"status": "error", "message": str(e)}


async def list_documents() -> Dict[str, Any]:
    """List all documents in the data directory (recursively)."""
    if not DATA_DIR.exists():
        DATA_DIR.mkdir(parents=True)
        return {"documents": [], "count": 0}

    files = []
    for file_path in DATA_DIR.rglob("*"):
        if file_path.is_file() and file_path.suffix.lower() in [".pdf", ".txt", ".md"]:
            files.append({
                "filename": file_path.name,
                "path": str(file_path.relative_to(DATA_DIR)),
                "size": file_path.stat().st_size,
                "modified": file_path.stat().st_mtime,
                "type": file_path.suffix[1:]
            })

    return {"documents": files, "count": len(files)}


async def upload_document(file) -> Dict[str, Any]:
    """Upload a new document to the data directory."""
    if not DATA_DIR.exists():
        DATA_DIR.mkdir(parents=True)

    suffix = Path(file.filename).suffix.lower()
    if suffix not in [".pdf", ".txt", ".md"]:
        return {"status": "error", "message": f"File type {suffix} not allowed."}

    content = await file.read()
    file_path = DATA_DIR / file.filename
    file_path.write_bytes(content)

    return {
        "status": "success",
        "filename": file.filename,
        "size": len(content),
        "message": "File uploaded. Run /api/ingest to add to vector database."
    }


async def delete_document(filename: str) -> Dict[str, Any]:
    """Delete a document from the data directory."""
    file_path = DATA_DIR / filename
    if not file_path.exists():
        return {"status": "error", "message": f"File '{filename}' not found"}

    file_path.unlink()
    return {"status": "success", "filename": filename, "message": "File deleted."}
