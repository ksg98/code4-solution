// API Types for Wisconsin Legal RAG

export type DocumentType = "statute" | "case_law" | "policy" | "training" | "pdf" | "txt" | "md" | "document"
export type Jurisdiction = "wisconsin" | "federal"
export type ConfidenceLevel = "high" | "medium" | "low"

// Chat Types
export interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export interface ChatRequest {
  query: string
  history: ChatMessage[]
}

export interface CrossReference {
  target: string
  type: string
  context?: string
}

export interface SourceMetadata {
  type: DocumentType
  title: string
  source?: string
  page?: number
  jurisdiction?: Jurisdiction
  // Legal-specific fields
  statute_num?: string
  chapter?: string
  section?: string
  subsection?: string
  case_citation?: string
  effective_date?: string
  status?: "current" | "superseded"
  hierarchy_level?: number
  cross_references?: CrossReference[]
  statutes_cited?: string[]
  cases_cited?: string[]
  is_sensitive?: boolean
  sensitive_topic?: string
  url?: string
}

export interface Source {
  id: string
  text: string
  metadata: SourceMetadata
  score: number
  is_cross_reference?: boolean
}

export interface ChatResponse {
  answer: string
  sources: Source[]
  confidence: ConfidenceLevel
  is_sensitive: boolean
  disclaimer: string
}

// Search Types
export interface SearchRequest {
  query: string
  top_k?: number
  doc_type?: DocumentType
  jurisdiction?: Jurisdiction
}

export interface SearchResult {
  id: string
  text: string
  metadata: SourceMetadata
  score: number
}

export interface SearchResponse {
  results: SearchResult[]
  query: string
  enhanced_query: string
}

// Knowledge Base Types
export interface KnowledgeSource {
  id: string
  type: DocumentType
  title: string
  description: string
  statute_num?: string
  case_citation?: string
  chunk_count: number
  last_updated?: string
}

export interface SourcesResponse {
  sources: KnowledgeSource[]
  total_chunks: number
  last_ingestion?: string
}

// SSE Event Types
export interface SSESourcesEvent {
  type: "sources"
  data: Source[]
}

export interface SSEMetadataEvent {
  type: "metadata"
  data: {
    confidence: ConfidenceLevel
    is_sensitive: boolean
  }
}

export interface SSEContentEvent {
  type: "content"
  data: string
}

export interface SSEDoneEvent {
  type: "done"
}

export interface SSEErrorEvent {
  type: "error"
  data: string
}

export type SSEEvent =
  | SSESourcesEvent
  | SSEMetadataEvent
  | SSEContentEvent
  | SSEDoneEvent
  | SSEErrorEvent

// UI State Types
export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  sources?: Source[]
  confidence?: ConfidenceLevel
  is_sensitive?: boolean
  isStreaming?: boolean
  timestamp: Date
}
