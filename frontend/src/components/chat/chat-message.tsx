"use client"

import ReactMarkdown from "react-markdown"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfidenceBadge } from "./confidence-badge"
import { SourceCard } from "./source-card"
import { User, Bot, AlertTriangle } from "lucide-react"
import { BlurFade } from "@/components/ui/blur-fade"
import type { Message } from "@/types"

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"

  return (
    <BlurFade delay={0.1} inView>
      <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
        {/* Avatar */}
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className={isUser ? "bg-primary text-primary-foreground" : "bg-muted"}>
            {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className={`flex-1 space-y-2 ${isUser ? "items-end" : "items-start"}`}>
          <Card className={`p-4 max-w-[85%] ${isUser ? "ml-auto bg-primary text-primary-foreground" : ""}`}>
            {message.isStreaming && !message.content ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            ) : (
              <div className={`prose prose-sm dark:prose-invert max-w-none ${isUser ? "[&_*]:text-primary-foreground" : ""}`}>
                <ReactMarkdown>{message.content}</ReactMarkdown>
                {message.isStreaming && (
                  <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1" />
                )}
              </div>
            )}
          </Card>

          {/* Metadata and Sources - Only for assistant messages */}
          {!isUser && !message.isStreaming && message.content && (
            <div className="space-y-3 max-w-[85%]">
              {/* Sensitive topic warning with specific guidance */}
              {message.is_sensitive && message.sources && message.sources.length > 0 && (
                <Alert variant="destructive" className="bg-destructive/10">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>
                      {message.sources[0].metadata.sensitive_topic === 'use_of_force' && 'Use of Force - Critical Legal Area'}
                      {message.sources[0].metadata.sensitive_topic === 'civil_rights' && 'Civil Rights - Constitutional Protections'}
                      {message.sources[0].metadata.sensitive_topic === 'juvenile' && 'Juvenile Matters - Special Procedures'}
                      {!message.sources[0].metadata.sensitive_topic && 'Sensitive Legal Matter'}
                    </strong>
                    <br />
                    This information requires strict adherence to policy and legal standards. Consult your supervisor and legal counsel before taking action.
                  </AlertDescription>
                </Alert>
              )}
              {message.is_sensitive && (!message.sources || message.sources.length === 0) && (
                <Alert variant="destructive" className="bg-destructive/10">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    This topic involves sensitive subject matter. Exercise particular caution and consult department policy and legal counsel.
                  </AlertDescription>
                </Alert>
              )}

              {/* Confidence badge */}
              {message.confidence && (
                <div className="flex items-center gap-2">
                  <ConfidenceBadge level={message.confidence} />
                </div>
              )}

              {/* Sources */}
              {message.sources && message.sources.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Sources ({message.sources.length})
                  </h4>
                  <div className="space-y-2">
                    {message.sources.map((source, index) => (
                      <SourceCard key={source.id} source={source} index={index} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </BlurFade>
  )
}
