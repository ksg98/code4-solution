/**
 * Client-side conversation history storage using IndexedDB via localforage.
 * Stores conversation history in the browser for persistence across sessions.
 */
import localforage from "localforage"
import type { Message } from "@/types"

// Configure localforage for conversation storage
const conversationStore = localforage.createInstance({
  name: "wisconsin-legal-assistant",
  storeName: "conversations",
  description: "Stores conversation history for Wisconsin Legal Assistant",
})

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

/**
 * Save a conversation to browser storage
 */
export async function saveConversation(conversation: Conversation): Promise<void> {
  await conversationStore.setItem(conversation.id, {
    ...conversation,
    updatedAt: new Date(),
  })
}

/**
 * Load a conversation by ID
 */
export async function loadConversation(id: string): Promise<Conversation | null> {
  return await conversationStore.getItem<Conversation>(id)
}

/**
 * Get all conversations (sorted by updated date)
 */
export async function getAllConversations(): Promise<Conversation[]> {
  const conversations: Conversation[] = []
  await conversationStore.iterate<Conversation, void>((value) => {
    conversations.push(value)
  })
  return conversations.sort((a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
}

/**
 * Delete a conversation
 */
export async function deleteConversation(id: string): Promise<void> {
  await conversationStore.removeItem(id)
}

/**
 * Clear all conversations
 */
export async function clearAllConversations(): Promise<void> {
  await conversationStore.clear()
}

/**
 * Generate a title for a conversation based on the first user message
 */
export function generateConversationTitle(messages: Message[]): string {
  const firstUserMessage = messages.find(m => m.role === "user")
  if (!firstUserMessage) return "New Conversation"

  const content = firstUserMessage.content.trim()
  if (content.length <= 50) return content

  return content.substring(0, 47) + "..."
}

/**
 * Auto-save current conversation
 */
export async function autoSaveConversation(
  conversationId: string,
  messages: Message[]
): Promise<void> {
  if (messages.length === 0) return

  const existing = await loadConversation(conversationId)
  const conversation: Conversation = {
    id: conversationId,
    title: existing?.title || generateConversationTitle(messages),
    messages,
    createdAt: existing?.createdAt || new Date(),
    updatedAt: new Date(),
  }

  await saveConversation(conversation)
}

/**
 * Export conversation to JSON file
 */
export function exportConversationAsJSON(conversation: Conversation): void {
  const dataStr = JSON.stringify(conversation, null, 2)
  const blob = new Blob([dataStr], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `conversation-${conversation.id}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export conversation as formatted text for reports
 */
export function exportConversationAsReport(conversation: Conversation): void {
  let report = `Wisconsin Legal Assistant - Conversation Report\n`
  report += `Generated: ${new Date().toLocaleString()}\n`
  report += `Title: ${conversation.title}\n`
  report += `Created: ${new Date(conversation.createdAt).toLocaleString()}\n`
  report += `\n${"=".repeat(80)}\n\n`

  conversation.messages.forEach((msg, index) => {
    const role = msg.role === "user" ? "QUERY" : "RESPONSE"
    const timestamp = new Date(msg.timestamp).toLocaleTimeString()

    report += `[${index + 1}] ${role} (${timestamp})\n`
    report += `${"-".repeat(80)}\n`
    report += `${msg.content}\n`

    if (msg.sources && msg.sources.length > 0) {
      report += `\nSources:\n`
      msg.sources.forEach((source, i) => {
        report += `  [${i + 1}] ${source.metadata.title}\n`
        if (source.metadata.statute_num) {
          report += `      Statute: § ${source.metadata.statute_num}\n`
        }
        if (source.metadata.effective_date) {
          report += `      Effective: ${source.metadata.effective_date}\n`
        }
        report += `      Relevance: ${Math.round(source.score * 100)}%\n`
      })
    }

    if (msg.confidence) {
      report += `\nConfidence: ${msg.confidence.toUpperCase()}\n`
    }

    if (msg.is_sensitive) {
      report += `\n⚠️  SENSITIVE TOPIC - Requires special legal consideration\n`
    }

    report += `\n${"=".repeat(80)}\n\n`
  })

  report += `\nDISCLAIMER:\n`
  report += `This is legal information for Wisconsin law enforcement, not legal advice.\n`
  report += `Always consult your department's legal counsel for specific situations.\n`

  const blob = new Blob([report], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `legal-research-${conversation.id}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
