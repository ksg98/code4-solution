"use client"

import { useEffect, useRef } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChatMessage } from "./chat-message"
import { ChatInput } from "./chat-input"
import { QuickActions } from "./quick-actions"
import { ConversationHistory } from "./conversation-history"
import { ReportGeneratorButton } from "./report-generator-button"
import { useChat } from "@/hooks/use-chat"
import { Info, Scale } from "lucide-react"

const SAMPLE_QUERIES = [
  "What are the legal requirements for a traffic stop in Wisconsin?",
  "Explain Wisconsin's use of force continuum",
  "What constitutes probable cause for an OWI arrest?",
  "What are the Miranda warning requirements?",
]

export function ChatContainer() {
  const { messages, isLoading, error, sendMessage, clearMessages, conversationId } = useChat()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleLoadConversation = async (conversation: any) => {
    // This will be implemented to load a previous conversation
    // For now, we'll just reload the page with the conversation ID
    console.log("Loading conversation:", conversation.id)
  }

  return (
    <>
      {/* Scrollable Content Area */}
      <div
        ref={scrollContainerRef}
        className="absolute inset-0 bottom-[72px] overflow-y-auto px-4 pt-6 pb-4"
      >
        {/* Floating History Button - Top Right */}
        <div className="fixed top-16 right-4 z-30">
          <ConversationHistory
            currentConversationId={conversationId}
            onLoadConversation={handleLoadConversation}
          />
        </div>

        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-start space-y-6 max-w-4xl mx-auto px-4 pt-8">
            <div className="text-center space-y-2">
              <Scale className="h-10 w-10 mx-auto text-primary-accent" />
              <h2 className="text-xl font-semibold text-foreground">Wisconsin Legal Assistant</h2>
              <p className="text-sm text-text-secondary max-w-md">
                Ask questions about Wisconsin law enforcement legal matters, statutes, policies, and procedures.
              </p>
            </div>

            {/* Quick Actions and Sample Queries - Side by Side */}
            <div className="w-full flex flex-col md:flex-row gap-6 md:gap-8 items-start justify-center">
              {/* Quick Actions */}
              <div className="w-full md:w-auto md:flex-1 md:max-w-md">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Quick Access
                  </span>
                </div>
                <QuickActions onSelectQuery={sendMessage} disabled={isLoading} />
              </div>

              {/* Sample queries */}
              <div className="w-full md:w-auto md:flex-1 md:max-w-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Try these examples
                  </span>
                </div>
                <div className="rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
                  <div className="divide-y divide-border/50">
                    {SAMPLE_QUERIES.map((query, index) => (
                      <button
                        key={index}
                        onClick={() => sendMessage(query)}
                        disabled={isLoading}
                        className="w-full text-left px-3 py-2.5 hover:bg-accent/50 transition-colors text-sm text-foreground/90 hover:text-foreground"
                      >
                        {query}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto pb-2">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Error display */}
        {error && (
          <Alert variant="destructive" className="max-w-4xl mx-auto mt-2">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Input Area - Fixed at bottom, completely separate */}
      <div className="absolute bottom-0 left-0 right-0 bg-background border-t px-4 py-3 z-20">
        <div className="max-w-4xl mx-auto flex items-end gap-2">
          <div className="flex-1">
            <ChatInput onSend={sendMessage} isLoading={isLoading} />
          </div>
          {messages.length > 0 && (
            <div className="flex gap-1.5 pb-0.5">
              <button
                onClick={clearMessages}
                className="text-[10px] px-2 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors whitespace-nowrap"
              >
                Clear
              </button>
              <ReportGeneratorButton
                messages={messages}
                conversationId={conversationId}
                disabled={isLoading}
              />
            </div>
          )}
        </div>
      </div>
    </>
  )
}
