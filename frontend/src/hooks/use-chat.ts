"use client"

import { useState, useCallback, useEffect } from "react"
import { flushSync } from "react-dom"
import { streamChatMessage } from "@/lib/api"
import { autoSaveConversation } from "@/lib/conversation-storage"
import type { Message, Source, ConfidenceLevel, ChatMessage } from "@/types"

// Generate a unique conversation ID for this session
const getOrCreateConversationId = () => {
  if (typeof window === "undefined") return ""

  let conversationId = sessionStorage.getItem("currentConversationId")
  if (!conversationId) {
    conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem("currentConversationId", conversationId)
  }
  return conversationId
}

export function useChat() {
  const [conversationId] = useState(getOrCreateConversationId)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auto-save conversation whenever messages change
  useEffect(() => {
    if (messages.length > 0 && conversationId) {
      autoSaveConversation(conversationId, messages).catch(err => {
        console.error("Failed to auto-save conversation:", err)
      })
    }
  }, [messages, conversationId])

  const sendMessage = useCallback(async (query: string) => {
    setError(null)
    setIsLoading(true)

    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: query,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])

    // Create assistant message placeholder
    const assistantId = crypto.randomUUID()
    const assistantMessage: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      isStreaming: true,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, assistantMessage])

    try {
      // Build history from previous messages
      const history: ChatMessage[] = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }))

      // Stream response
      let content = ""
      let sources: Source[] = []
      let confidence: ConfidenceLevel = "medium"
      let isSensitive = false

      for await (const event of streamChatMessage({ query, history })) {
        switch (event.type) {
          case "sources":
            sources = event.data
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, sources } : m
              )
            )
            break

          case "metadata":
            confidence = event.data.confidence
            isSensitive = event.data.is_sensitive
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, confidence, is_sensitive: isSensitive }
                  : m
              )
            )
            break

          case "content":
            content += event.data
            // Use flushSync to force immediate re-render for streaming effect
            flushSync(() => {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content } : m
                )
              )
            })
            break

          case "done":
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, isStreaming: false } : m
              )
            )
            break

          case "error":
            setError(event.data)
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, content: `Error: ${event.data}`, isStreaming: false }
                  : m
              )
            )
            break
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setError(errorMessage)
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: `Error: ${errorMessage}`, isStreaming: false }
            : m
        )
      )
    } finally {
      setIsLoading(false)
    }
  }, [messages])

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
    // Create new conversation ID for next conversation
    if (typeof window !== "undefined") {
      const newId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem("currentConversationId", newId)
    }
  }, [])

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    conversationId,
  }
}
