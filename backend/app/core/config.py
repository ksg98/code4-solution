"""
Configuration settings for Wisconsin Legal RAG System.
Updated for December 2025 with Cohere v4.0 and latest models.
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings with environment variable support."""

    # API Keys
    google_api_key: str = ""
    pinecone_api_key: str = ""
    cohere_api_key: str = ""

    # Pinecone Configuration
    pinecone_index_name: str = "wisconsin-legal"
    pinecone_host: str = ""  # Optional: specific index host URL
    pinecone_cloud: str = "aws"  # Cloud provider: aws, gcp, or azure
    pinecone_region: str = "us-east-1"  # Cloud region

    # Model Configuration (December 2025 latest)
    embedding_model: str = "models/text-embedding-004"  # Gemini text-embedding-004
    llm_model: str = "gemini-2.5-flash"  # Latest Gemini Flash model
    rerank_model: str = "rerank-v4.0-pro"  # Cohere Rerank v4.0 Pro (Dec 11, 2025)
    # Alternative: "rerank-v4.0-fast" for lower latency

    # Retrieval Configuration
    top_k: int = 20  # Initial retrieval count (hybrid search)
    top_n: int = 5   # Final count after reranking
    alpha: float = 0.5  # Hybrid search balance (0.0=BM25, 1.0=semantic, 0.5=balanced)

    # Chunking Configuration
    chunk_size: int = 1000
    chunk_overlap: int = 200

    # API Configuration
    cors_origins: list[str] = ["http://localhost:3000"]
    max_file_size: int = 10485760  # 10MB in bytes

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
