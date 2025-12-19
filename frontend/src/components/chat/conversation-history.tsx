"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { History, MessageSquare, Trash2, Clock } from "lucide-react"
import { getAllConversations, deleteConversation, type Conversation } from "@/lib/conversation-storage"

interface ConversationHistoryProps {
  currentConversationId: string
  onLoadConversation?: (conversation: Conversation) => void
}

export function ConversationHistory({ currentConversationId, onLoadConversation }: ConversationHistoryProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  const loadConversations = async () => {
    setLoading(true)
    try {
      const allConversations = await getAllConversations()
      setConversations(allConversations)
    } catch (error) {
      console.error("Failed to load conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConversations()
  }, [currentConversationId])

  const handleDelete = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm("Delete this conversation?")) {
      await deleteConversation(conversationId)
      loadConversations()
    }
  }

  const formatDate = (date: Date) => {
    const d = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return d.toLocaleDateString()
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <History className="h-4 w-4" />
          <span className="hidden sm:inline">History</span>
          {conversations.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
              {conversations.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Conversation History
          </SheetTitle>
          <SheetDescription>
            View and manage your past legal research conversations
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-6 pr-4">
          {loading ? (
            <div className="text-center text-muted-foreground py-8">
              Loading conversations...
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs mt-1">Start a conversation to see it here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conversation) => {
                const isCurrent = conversation.id === currentConversationId
                const messageCount = conversation.messages.length
                const lastMessage = conversation.messages[conversation.messages.length - 1]

                return (
                  <Card
                    key={conversation.id}
                    className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                      isCurrent ? "border-primary bg-primary/5" : "border-muted"
                    }`}
                    onClick={() => onLoadConversation?.(conversation)}
                  >
                    <div className="space-y-2">
                      {/* Title and Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-sm line-clamp-2 flex-1">
                          {conversation.title}
                        </h3>
                        {isCurrent && (
                          <Badge variant="default" className="text-[10px] px-1.5 py-0 shrink-0">
                            Active
                          </Badge>
                        )}
                      </div>

                      {/* Timestamps */}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(conversation.updatedAt)}</span>
                        </div>
                        <span>•</span>
                        <span>{formatTime(conversation.updatedAt)}</span>
                        <span>•</span>
                        <span>{messageCount} {messageCount === 1 ? 'message' : 'messages'}</span>
                      </div>

                      {/* Last message preview */}
                      {lastMessage && (
                        <p className="text-xs text-muted-foreground line-clamp-2 bg-muted/30 p-2 rounded">
                          {lastMessage.content.substring(0, 100)}
                          {lastMessage.content.length > 100 ? '...' : ''}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-muted">
                        <div className="text-[10px] text-muted-foreground">
                          Created {formatDate(conversation.createdAt)}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => handleDelete(conversation.id, e)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
