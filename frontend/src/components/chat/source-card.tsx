"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp, ExternalLink, FileText, Scale, BookOpen, GraduationCap, AlertTriangle } from "lucide-react"
import type { Source } from "@/types"

interface SourceCardProps {
  source: Source
  index: number
}

const typeConfig: Record<string, { icon: typeof FileText; label: string; color: string }> = {
  statute: {
    icon: Scale,
    label: "Statute",
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  case_law: {
    icon: BookOpen,
    label: "Case Law",
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  },
  policy: {
    icon: FileText,
    label: "Policy",
    color: "bg-green-500/10 text-green-600 border-green-500/20",
  },
  training: {
    icon: GraduationCap,
    label: "Training",
    color: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  },
  pdf: {
    icon: FileText,
    label: "PDF",
    color: "bg-red-500/10 text-red-600 border-red-500/20",
  },
  txt: {
    icon: FileText,
    label: "Text",
    color: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  },
  md: {
    icon: FileText,
    label: "Markdown",
    color: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  },
}

const defaultConfig = {
  icon: FileText,
  label: "Document",
  color: "bg-gray-500/10 text-gray-600 border-gray-500/20",
}

export function SourceCard({ source, index }: SourceCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  const config = typeConfig[source.metadata?.type] || defaultConfig
  const Icon = config.icon
  const relevancePercent = Math.round(source.score * 100)

  return (
    <Card className="border-muted/50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <div className="py-2 px-3 cursor-pointer hover:bg-muted/50 transition-colors flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-xs text-muted-foreground shrink-0">
                [{index + 1}]
              </span>
              <Icon className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="text-xs font-medium truncate">
                {source.metadata?.title || "Document"}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Badge variant="outline" className={`${config.color} text-[10px] px-1.5 py-0`}>
                {config.label}
              </Badge>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {relevancePercent}%
              </Badge>
              <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-3 pb-2 pt-0 space-y-2">
            {/* Jurisdiction & Currency Warnings */}
            {source.metadata?.jurisdiction && source.metadata.jurisdiction !== 'wisconsin' && (
              <div className="text-[10px] bg-yellow-500/10 border border-yellow-500/20 p-1.5 rounded flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-yellow-600" />
                <span className="text-yellow-700 dark:text-yellow-400 font-medium">
                  {source.metadata.jurisdiction === 'federal' ? 'Federal Law - Not WI Specific' : 'Non-Wisconsin Jurisdiction'}
                </span>
              </div>
            )}

            {source.metadata?.status === 'superseded' && (
              <div className="text-[10px] bg-orange-500/10 border border-orange-500/20 p-1.5 rounded flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-orange-600" />
                <span className="text-orange-700 dark:text-orange-400 font-medium">
                  Superseded Law - May be outdated
                </span>
              </div>
            )}

            {/* Legal Metadata */}
            {(source.metadata?.statute_num || source.metadata?.chapter || source.metadata?.cross_references?.length) && (
              <div className="text-[10px] space-y-1 bg-muted/20 p-2 rounded">
                {source.metadata.jurisdiction && (
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Jurisdiction:</span>
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0 font-medium">
                      {source.metadata.jurisdiction === 'wisconsin' ? 'Wisconsin' : source.metadata.jurisdiction?.toUpperCase()}
                    </Badge>
                  </div>
                )}
                {source.metadata.statute_num && (
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Statute:</span>
                    <span className="font-mono font-medium">§ {source.metadata.statute_num}</span>
                  </div>
                )}
                {source.metadata.chapter && !source.metadata.statute_num && (
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Chapter:</span>
                    <span className="font-mono font-medium">{source.metadata.chapter}</span>
                  </div>
                )}
                {source.metadata.effective_date && (
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Effective:</span>
                    <span className="font-medium">{source.metadata.effective_date}</span>
                  </div>
                )}
                {source.metadata.cross_references && source.metadata.cross_references.length > 0 && (
                  <div className="flex items-start gap-1">
                    <span className="text-muted-foreground shrink-0">References:</span>
                    <div className="flex flex-wrap gap-1">
                      {source.metadata.cross_references.slice(0, 3).map((ref, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="text-[9px] px-1 py-0 hover:bg-muted/50 cursor-pointer"
                          title={`${ref.type}: ${ref.context?.substring(0, 100)}...`}
                        >
                          § {ref.target}
                        </Badge>
                      ))}
                      {source.metadata.cross_references.length > 3 && (
                        <span className="text-muted-foreground">+{source.metadata.cross_references.length - 3} more</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Document Text with Source Info */}
            <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
              <p className="line-clamp-3 leading-relaxed">
                {source.text}
              </p>
              {(source.metadata?.page || source.metadata?.source) && (
                <p className="text-[9px] text-muted-foreground mt-1.5 pt-1.5 border-t border-muted flex items-center gap-1">
                  {source.metadata.page && <span>Page {source.metadata.page}</span>}
                  {source.metadata.page && source.metadata.source && <span>•</span>}
                  {source.metadata.source && <span className="truncate">{source.metadata.source.split('/').pop()}</span>}
                </p>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
