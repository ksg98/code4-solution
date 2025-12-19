"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, FileText, FileJson, Check } from "lucide-react"
import type { Message } from "@/types"
import { exportConversationAsJSON, exportConversationAsReport } from "@/lib/conversation-storage"

interface ExportMenuProps {
  messages: Message[]
  conversationId: string
  disabled?: boolean
}

export function ExportMenu({ messages, conversationId, disabled = false }: ExportMenuProps) {
  const [exported, setExported] = useState(false)

  const handleExportReport = () => {
    if (messages.length === 0) return

    const conversation = {
      id: conversationId,
      title: messages[0]?.content.substring(0, 50) || "Conversation",
      messages,
      createdAt: new Date(messages[0]?.timestamp || new Date()),
      updatedAt: new Date(),
    }

    exportConversationAsReport(conversation)
    setExported(true)
    setTimeout(() => setExported(false), 2000)
  }

  const handleExportJSON = () => {
    if (messages.length === 0) return

    const conversation = {
      id: conversationId,
      title: messages[0]?.content.substring(0, 50) || "Conversation",
      messages,
      createdAt: new Date(messages[0]?.timestamp || new Date()),
      updatedAt: new Date(),
    }

    exportConversationAsJSON(conversation)
    setExported(true)
    setTimeout(() => setExported(false), 2000)
  }

  if (messages.length === 0) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="gap-2 text-xs h-8"
        >
          {exported ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Exported
            </>
          ) : (
            <>
              <Download className="h-3.5 w-3.5" />
              Export for Reports
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs">Export Conversation</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleExportReport} className="cursor-pointer">
          <FileText className="h-4 w-4 mr-2" />
          <div className="flex flex-col">
            <span className="text-xs font-medium">Text Report</span>
            <span className="text-[10px] text-muted-foreground">
              Formatted for report writing
            </span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleExportJSON} className="cursor-pointer">
          <FileJson className="h-4 w-4 mr-2" />
          <div className="flex flex-col">
            <span className="text-xs font-medium">JSON Data</span>
            <span className="text-[10px] text-muted-foreground">
              With full metadata
            </span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <div className="px-2 py-1.5">
          <p className="text-[9px] text-muted-foreground leading-tight">
            Exports include query timestamps, sources, statute citations, and confidence levels for documentation purposes.
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
