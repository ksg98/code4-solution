"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { BlurFade } from "@/components/ui/blur-fade"
import { BorderBeam } from "@/components/ui/border-beam"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { search } from "@/lib/api"
import type { SearchResult, DocumentType, Jurisdiction } from "@/types"
import {
  Search,
  Scale,
  BookOpen,
  FileText,
  GraduationCap,
  AlertCircle,
  Sparkles,
  ChevronDown,
  Filter,
  X,
  Check,
  Loader2,
  ArrowRight,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

const typeConfig: Record<DocumentType, { icon: typeof Scale; label: string; color: string; bgColor: string }> = {
  statute: { icon: Scale, label: "Statute", color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-500/10 border-blue-500/20" },
  case_law: { icon: BookOpen, label: "Case Law", color: "text-purple-600 dark:text-purple-400", bgColor: "bg-purple-500/10 border-purple-500/20" },
  policy: { icon: FileText, label: "Policy", color: "text-green-600 dark:text-green-400", bgColor: "bg-green-500/10 border-green-500/20" },
  training: { icon: GraduationCap, label: "Training", color: "text-orange-600 dark:text-orange-400", bgColor: "bg-orange-500/10 border-orange-500/20" },
  pdf: { icon: FileText, label: "PDF", color: "text-red-600 dark:text-red-400", bgColor: "bg-red-500/10 border-red-500/20" },
  txt: { icon: FileText, label: "Text", color: "text-gray-600 dark:text-gray-400", bgColor: "bg-gray-500/10 border-gray-500/20" },
  md: { icon: FileText, label: "Markdown", color: "text-gray-600 dark:text-gray-400", bgColor: "bg-gray-500/10 border-gray-500/20" },
  document: { icon: FileText, label: "Document", color: "text-gray-600 dark:text-gray-400", bgColor: "bg-gray-500/10 border-gray-500/20" },
}

const docTypeOptions: { value: DocumentType | "all"; label: string; icon: typeof Scale }[] = [
  { value: "all", label: "All Types", icon: FileText },
  { value: "statute", label: "Statutes", icon: Scale },
  { value: "case_law", label: "Case Law", icon: BookOpen },
  { value: "policy", label: "Policies", icon: FileText },
  { value: "training", label: "Training", icon: GraduationCap },
]

const jurisdictionOptions: { value: Jurisdiction | "all"; label: string }[] = [
  { value: "all", label: "All Jurisdictions" },
  { value: "wisconsin", label: "Wisconsin" },
  { value: "federal", label: "Federal" },
]

function FilterDropdown({
  label,
  value,
  options,
  onChange,
  icon: Icon,
}: {
  label: string
  value: string
  options: { value: string; label: string; icon?: typeof Scale }[]
  onChange: (value: string) => void
  icon?: typeof Scale
}) {
  const [open, setOpen] = useState(false)
  const selectedOption = options.find((opt) => opt.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-11 px-4 gap-2 rounded-xl border-2 transition-all duration-200",
            open && "border-primary ring-2 ring-primary/20"
          )}
        >
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          <span className="font-medium">{selectedOption?.label || label}</span>
          <ChevronDown className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <div className="space-y-1">
          {options.map((option) => {
            const OptionIcon = option.icon
            return (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value)
                  setOpen(false)
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  value === option.value
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted"
                )}
              >
                {OptionIcon && <OptionIcon className="h-4 w-4" />}
                <span className="flex-1 text-left">{option.label}</span>
                {value === option.value && (
                  <Check className="h-4 w-4" />
                )}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function ResultCard({ result, index }: { result: SearchResult; index: number }) {
  const config = typeConfig[result.metadata.type]
  const Icon = config.icon
  const relevancePercent = Math.round(result.score * 100)

  return (
    <BlurFade delay={0.05 * index} direction="up">
      <motion.div
        whileHover={{ scale: 1.01, y: -2 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <Card className="group relative overflow-hidden border-2 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className={cn(
                "shrink-0 p-3 rounded-xl border transition-transform duration-300 group-hover:scale-110",
                config.bgColor
              )}>
                <Icon className={cn("h-5 w-5", config.color)} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors">
                      {result.metadata.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className={cn("text-xs", config.bgColor, config.color)}>
                        {config.label}
                      </Badge>
                      {result.metadata.statute_num && (
                        <Badge variant="outline" className="text-xs">
                          § {result.metadata.statute_num}
                        </Badge>
                      )}
                      {result.metadata.case_citation && (
                        <Badge variant="outline" className="text-xs">
                          {result.metadata.case_citation}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Relevance Score */}
                  <div className="shrink-0 flex flex-col items-center">
                    <div className={cn(
                      "text-lg font-bold",
                      relevancePercent >= 80 ? "text-green-600 dark:text-green-400" :
                      relevancePercent >= 60 ? "text-yellow-600 dark:text-yellow-400" :
                      "text-muted-foreground"
                    )}>
                      {relevancePercent}%
                    </div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">match</span>
                  </div>
                </div>

                {/* Text Preview */}
                <div className="relative">
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed bg-muted/30 rounded-lg p-3 border">
                    {result.text}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    {result.metadata.jurisdiction && (
                      <span className="capitalize flex items-center gap-1">
                        <Scale className="h-3 w-3" />
                        {result.metadata.jurisdiction}
                      </span>
                    )}
                    {result.metadata.effective_date && (
                      <span>Effective: {result.metadata.effective_date}</span>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    View Details
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </BlurFade>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <BlurFade key={i} delay={0.1 * i}>
          <Card className="overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="h-11 w-11 rounded-xl bg-muted animate-pulse" />
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between">
                    <div className="space-y-2">
                      <div className="h-5 w-48 bg-muted rounded animate-pulse" />
                      <div className="flex gap-2">
                        <div className="h-5 w-16 bg-muted rounded-full animate-pulse" />
                        <div className="h-5 w-20 bg-muted rounded-full animate-pulse" />
                      </div>
                    </div>
                    <div className="h-8 w-12 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="h-20 w-full bg-muted rounded-lg animate-pulse" />
                  <div className="flex gap-4">
                    <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </BlurFade>
      ))}
    </div>
  )
}

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [docType, setDocType] = useState<DocumentType | "all">("all")
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction | "all">("all")
  const [results, setResults] = useState<SearchResult[]>([])
  const [enhancedQuery, setEnhancedQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return
    setIsLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      const data = await search({
        query: query.trim(),
        top_k: 20,
        doc_type: docType === "all" ? undefined : docType,
        jurisdiction: jurisdiction === "all" ? undefined : jurisdiction,
      })
      setResults(data.results)
      setEnhancedQuery(data.enhanced_query)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed")
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [query, docType, jurisdiction])

  const clearFilters = () => {
    setDocType("all")
    setJurisdiction("all")
  }

  const hasActiveFilters = docType !== "all" || jurisdiction !== "all"

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <BlurFade>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Direct Search</h1>
                  <p className="text-sm text-muted-foreground">
                    Search the knowledge base directly with semantic relevance ranking
                  </p>
                </div>
              </div>
            </div>
          </BlurFade>

          {/* Search Input */}
          <BlurFade delay={0.1}>
            <div className="relative">
              <div className={cn(
                "relative rounded-2xl border-2 bg-background transition-all duration-300",
                isFocused ? "border-primary shadow-lg shadow-primary/10" : "border-border hover:border-primary/50"
              )}>
                {isFocused && <BorderBeam size={120} duration={8} colorFrom="hsl(var(--primary))" colorTo="hsl(var(--primary) / 0.4)" />}

                <div className="flex items-center gap-3 p-2">
                  <div className="pl-3">
                    <Search className={cn(
                      "h-5 w-5 transition-colors",
                      isFocused ? "text-primary" : "text-muted-foreground"
                    )} />
                  </div>

                  <input
                    type="text"
                    placeholder="Search Wisconsin legal sources..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="flex-1 h-12 bg-transparent text-base outline-none placeholder:text-muted-foreground"
                  />

                  <ShimmerButton
                    onClick={handleSearch}
                    disabled={!query.trim() || isLoading}
                    shimmerColor="hsl(var(--primary-foreground))"
                    background="hsl(var(--primary))"
                    borderRadius="12px"
                    className="h-11 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <span className="flex items-center gap-2 font-medium">
                        <Zap className="h-4 w-4" />
                        Search
                      </span>
                    )}
                  </ShimmerButton>
                </div>
              </div>
            </div>
          </BlurFade>

          {/* Filters */}
          <BlurFade delay={0.15}>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="h-4 w-4" />
                <span>Filters:</span>
              </div>

              <FilterDropdown
                label="Document Type"
                value={docType}
                options={docTypeOptions}
                onChange={(v) => setDocType(v as DocumentType | "all")}
                icon={FileText}
              />

              <FilterDropdown
                label="Jurisdiction"
                value={jurisdiction}
                options={jurisdictionOptions}
                onChange={(v) => setJurisdiction(v as Jurisdiction | "all")}
                icon={Scale}
              />

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-9 gap-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                  Clear
                </Button>
              )}
            </div>
          </BlurFade>

          {/* Enhanced Query Notice */}
          <AnimatePresence>
            {enhancedQuery && enhancedQuery !== query && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20"
              >
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm">
                  <span className="text-muted-foreground">Query enhanced to: </span>
                  <span className="font-medium">&quot;{enhancedQuery}&quot;</span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="border-destructive/50 bg-destructive/5">
                  <CardContent className="p-4 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                    <p className="text-sm text-destructive">{error}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          {isLoading ? (
            <LoadingSkeleton />
          ) : hasSearched ? (
            results.length > 0 ? (
              <div className="space-y-4">
                <BlurFade delay={0.2}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Found <span className="font-semibold text-foreground">{results.length}</span> results
                    </p>
                    <Badge variant="outline" className="gap-1">
                      <Zap className="h-3 w-3" />
                      Semantic Search
                    </Badge>
                  </div>
                </BlurFade>

                <div className="space-y-3">
                  {results.map((result, index) => (
                    <ResultCard key={result.id} result={result} index={index} />
                  ))}
                </div>
              </div>
            ) : (
              <BlurFade delay={0.2}>
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <Search className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">
                      No results found for &quot;{query}&quot;
                    </p>
                    <p className="text-sm text-muted-foreground/70 mt-1">
                      Try different keywords or adjust your filters
                    </p>
                  </CardContent>
                </Card>
              </BlurFade>
            )
          ) : (
            <BlurFade delay={0.2}>
              <Card className="border-dashed">
                <CardContent className="py-16 text-center">
                  <div className="relative inline-block">
                    <Search className="h-16 w-16 mx-auto text-muted-foreground/20 mb-6" />
                    <motion.div
                      className="absolute -top-1 -right-1"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <Sparkles className="h-6 w-6 text-primary/40" />
                    </motion.div>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Start Your Search</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    Enter a search query to find relevant Wisconsin legal sources using semantic search
                  </p>
                </CardContent>
              </Card>
            </BlurFade>
          )}
        </div>
      </div>
    </div>
  )
}
