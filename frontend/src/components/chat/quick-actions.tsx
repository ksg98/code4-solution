"use client"

import {
  Car,
  Shield,
  FileText,
  Scale,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface QuickAction {
  id: string
  label: string
  query: string
}

interface Category {
  id: string
  label: string
  icon: typeof Scale
  actions: QuickAction[]
}

const CATEGORIES: Category[] = [
  {
    id: "traffic",
    label: "Traffic & OWI",
    icon: Car,
    actions: [
      {
        id: "owi-requirements",
        label: "OWI Arrest Requirements",
        query: "What are the legal requirements for an OWI arrest in Wisconsin?",
      },
      {
        id: "traffic-stop",
        label: "Traffic Stop Procedures",
        query: "What are the legal requirements for conducting a traffic stop in Wisconsin?",
      },
    ],
  },
  {
    id: "force",
    label: "Use of Force",
    icon: Shield,
    actions: [
      {
        id: "use-of-force",
        label: "Force Guidelines",
        query: "What are Wisconsin's use of force guidelines and legal standards?",
      },
      {
        id: "deadly-force",
        label: "Deadly Force",
        query: "When is deadly force justified under Wisconsin law?",
      },
    ],
  },
  {
    id: "rights",
    label: "Civil Rights",
    icon: FileText,
    actions: [
      {
        id: "miranda-rights",
        label: "Miranda Warnings",
        query: "What are the Miranda warning requirements in Wisconsin?",
      },
      {
        id: "search-seizure",
        label: "Search & Seizure",
        query: "What are the search and seizure requirements under Wisconsin law?",
      },
    ],
  },
  {
    id: "procedures",
    label: "Procedures",
    icon: Scale,
    actions: [
      {
        id: "probable-cause",
        label: "Probable Cause",
        query: "What constitutes probable cause for arrest in Wisconsin?",
      },
      {
        id: "juvenile-procedures",
        label: "Juvenile Procedures",
        query: "What are the special procedures for handling juvenile matters in Wisconsin?",
      },
    ],
  },
]

interface QuickActionsProps {
  onSelectQuery: (query: string) => void
  disabled?: boolean
}

export function QuickActions({ onSelectQuery, disabled = false }: QuickActionsProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
        {CATEGORIES.map((category, categoryIndex) => {
          const Icon = category.icon
          return (
            <div key={category.id}>
              {categoryIndex > 0 && <div className="h-px bg-border/50" />}
              <div className="px-3 py-2">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    {category.label}
                  </span>
                </div>
                <div className="space-y-0.5">
                  {category.actions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => !disabled && onSelectQuery(action.query)}
                      disabled={disabled}
                      className={cn(
                        "w-full flex items-center justify-between px-2 py-1.5 rounded-md text-left",
                        "text-sm text-foreground/90 hover:text-foreground",
                        "hover:bg-accent/50 transition-colors duration-150",
                        "group",
                        disabled && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <span>{action.label}</span>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
