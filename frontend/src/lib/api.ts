import type {
  ChatRequest,
  ChatResponse,
  SearchRequest,
  SearchResponse,
  SourcesResponse,
  SSEEvent,
  DocumentType,
} from "@/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// Chat API - Non-streaming
export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const response = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(`Chat request failed: ${response.statusText}`)
  }

  return response.json()
}

// Chat API - Streaming with SSE
export async function* streamChatMessage(
  request: ChatRequest
): AsyncGenerator<SSEEvent, void, unknown> {
  const response = await fetch(`${API_URL}/api/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "text/event-stream",
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(`Stream request failed: ${response.statusText}`)
  }

  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error("No response body")
  }

  const decoder = new TextDecoder()
  let buffer = ""

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      // Split by double newline (SSE event separator) or single newline
      const lines = buffer.split("\n")
      buffer = lines.pop() || ""

      for (const line of lines) {
        const trimmedLine = line.trim()
        if (trimmedLine.startsWith("data: ")) {
          try {
            const jsonStr = trimmedLine.slice(6).trim()
            if (jsonStr) {
              const data = JSON.parse(jsonStr)
              yield data as SSEEvent
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }

    // Process any remaining buffer
    if (buffer.trim().startsWith("data: ")) {
      try {
        const jsonStr = buffer.trim().slice(6).trim()
        if (jsonStr) {
          const data = JSON.parse(jsonStr)
          yield data as SSEEvent
        }
      } catch {
        // Skip invalid JSON
      }
    }
  } finally {
    reader.releaseLock()
  }
}

// Search API
export async function search(request: SearchRequest): Promise<SearchResponse> {
  const response = await fetch(`${API_URL}/api/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(`Search request failed: ${response.statusText}`)
  }

  return response.json()
}

// Sources API
export async function getSources(): Promise<SourcesResponse> {
  const response = await fetch(`${API_URL}/api/sources`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Sources request failed: ${response.statusText}`)
  }

  return response.json()
}

export async function getSourceDetails(sourceType: DocumentType): Promise<{
  type: string
  documents: Array<{
    id: string
    title: string
    chunks: Array<{ id: string; metadata: Record<string, unknown> }>
  }>
  total_documents: number
}> {
  const response = await fetch(`${API_URL}/api/sources/${sourceType}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Source details request failed: ${response.statusText}`)
  }

  return response.json()
}

// Health check
export async function healthCheck(): Promise<{ status: string; service: string }> {
  const response = await fetch(`${API_URL}/`, {
    method: "GET",
  })

  if (!response.ok) {
    throw new Error(`Health check failed: ${response.statusText}`)
  }

  return response.json()
}

// Documents API
export interface DocumentFile {
  filename: string
  size: number
  modified: number
  type: string
}

export async function listDocuments(): Promise<{ documents: DocumentFile[]; count: number }> {
  const response = await fetch(`${API_URL}/api/documents`)
  if (!response.ok) throw new Error(`Failed to list documents: ${response.statusText}`)
  return response.json()
}

export async function uploadDocument(file: File): Promise<{ status: string; filename: string; size: number }> {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch(`${API_URL}/api/documents/upload`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) throw new Error(`Failed to upload: ${response.statusText}`)
  return response.json()
}

export async function deleteDocument(filename: string): Promise<{ status: string; filename: string }> {
  const response = await fetch(`${API_URL}/api/documents/${encodeURIComponent(filename)}`, {
    method: "DELETE",
  })

  if (!response.ok) throw new Error(`Failed to delete: ${response.statusText}`)
  return response.json()
}

export async function ingestDocuments(): Promise<{ status: string; documents_loaded: number; chunks_created: number }> {
  const response = await fetch(`${API_URL}/api/ingest`, {
    method: "POST",
  })

  if (!response.ok) throw new Error(`Failed to ingest: ${response.statusText}`)
  return response.json()
}
