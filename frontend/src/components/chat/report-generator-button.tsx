"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileText, Download, Check, FileCode } from "lucide-react"
import type { Message } from "@/types"
import { exportPDFReport, exportDOCXReport, exportMarkdownReport } from "@/lib/report-generator"

interface ReportGeneratorButtonProps {
  messages: Message[]
  conversationId: string
  disabled?: boolean
}

export function ReportGeneratorButton({ messages, conversationId, disabled = false }: ReportGeneratorButtonProps) {
  const [open, setOpen] = useState(false)
  const [reportTitle, setReportTitle] = useState("")
  const [officerName, setOfficerName] = useState("")
  const [badgeNumber, setBadgeNumber] = useState("")
  const [department, setDepartment] = useState("")
  const [exported, setExported] = useState<"pdf" | "docx" | "md" | null>(null)

  const resetForm = () => {
    setReportTitle("")
    setOfficerName("")
    setBadgeNumber("")
    setDepartment("")
    setExported(null)
  }

  const handleExport = (format: "pdf" | "docx" | "md") => {
    if (messages.length === 0) return

    const options = {
      title: reportTitle || "Legal Research Report",
      conversationId,
      messages,
      officerName: officerName || undefined,
      badgeNumber: badgeNumber || undefined,
      department: department || undefined,
    }

    switch (format) {
      case "pdf":
        exportPDFReport(options)
        break
      case "docx":
        exportDOCXReport(options)
        break
      case "md":
        exportMarkdownReport(options)
        break
    }

    setExported(format)
    setTimeout(() => {
      setExported(null)
      setOpen(false)
      resetForm()
    }, 2000)
  }

  if (messages.length === 0) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="sm"
          disabled={disabled}
          className="gap-2 text-xs h-8 bg-blue-600 hover:bg-blue-700"
        >
          <FileText className="h-3.5 w-3.5" />
          Generate Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Legal Research Report
          </DialogTitle>
          <DialogDescription className="text-xs">
            Create a professional report from this conversation. All fields are optional but recommended for official documentation.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="report-title" className="text-xs font-medium">
              Report Title
            </Label>
            <Input
              id="report-title"
              placeholder="e.g., OWI Legal Requirements Research"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              className="text-xs h-8"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="officer-name" className="text-xs font-medium">
              Officer Name
            </Label>
            <Input
              id="officer-name"
              placeholder="e.g., John Smith"
              value={officerName}
              onChange={(e) => setOfficerName(e.target.value)}
              className="text-xs h-8"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="badge-number" className="text-xs font-medium">
                Badge Number
              </Label>
              <Input
                id="badge-number"
                placeholder="e.g., 12345"
                value={badgeNumber}
                onChange={(e) => setBadgeNumber(e.target.value)}
                className="text-xs h-8"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="department" className="text-xs font-medium">
                Department
              </Label>
              <Input
                id="department"
                placeholder="e.g., Madison PD"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="text-xs h-8"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              onClick={() => handleExport("pdf")}
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-initial gap-2 text-xs h-8"
              disabled={exported !== null}
            >
              {exported === "pdf" ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Exported
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" />
                  PDF
                </>
              )}
            </Button>

            <Button
              onClick={() => handleExport("docx")}
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-initial gap-2 text-xs h-8"
              disabled={exported !== null}
            >
              {exported === "docx" ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Exported
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" />
                  DOCX
                </>
              )}
            </Button>

            <Button
              onClick={() => handleExport("md")}
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-initial gap-2 text-xs h-8"
              disabled={exported !== null}
            >
              {exported === "md" ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Exported
                </>
              ) : (
                <>
                  <FileCode className="h-3.5 w-3.5" />
                  MD
                </>
              )}
            </Button>
          </div>
        </DialogFooter>

        <div className="pt-2 border-t">
          <p className="text-[10px] text-muted-foreground leading-tight">
            Reports include full conversation history, timestamps, sources, statute citations, confidence levels, and legal disclaimers for official documentation.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
