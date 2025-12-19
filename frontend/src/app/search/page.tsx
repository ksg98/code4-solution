"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { BlurFade } from "@/components/ui/blur-fade"
import { search } from "@/lib/api"
import type { SearchResult, DocumentType, Jurisdiction } from "@/types"
import { Search, Scale, BookOpen, FileText, GraduationCap, AlertCircle, Sparkles } from "lucide-react"

const typeConfig: Record<DocumentType, { icon: typeof Scale; label: string; color: string }> = {
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
  document: {
    icon: FileText,
    label: "Document",
    color: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  },
}

function ResultCard({ result, index }: { result: SearchResult; index: number }) {
  const config = typeConfig[result.metadata.type]
  const Icon = config.icon
  const relevancePercent = Math.round(result.score * 100)

  return (
    <BlurFade delay={0.05 * index}>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className={`p-2 rounded-lg shrink-0 ${config.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base line-clamp-1">
                  {result.metadata.title}
                </CardTitle>
                <div className="flex flex-wrap gap-2 mt-1">
                  <Badge variant="outline" className={config.color}>
                    {config.label}
                  </Badge>
                  {result.metadata.statute_num && (
                    <Badge variant="secondary">§ {result.metadata.statute_num}</Badge>
                  )}
                  {result.metadata.case_citation && (
                    <Badge variant="secondary">{result.metadata.case_citation}</Badge>
                  )}
                </div>
              </div>
            </div>
            <Badge variant="outline" className="shrink-0">
              {relevancePercent}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-3 bg-muted/50 p-3 rounded-md">
            {result.text}
          </p>
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            {result.metadata.jurisdiction && (
              <span className="capitalize">{result.metadata.jurisdiction}</span>
            )}
            {result.metadata.effective_date && (
              <span>Effective: {result.metadata.effective_date}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </BlurFade>
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

  const handleSearch = async () => {
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
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container py-8">
        <BlurFade delay={0.1}>
          <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Search className="h-8 w-8 text-primary" />
              Direct Search
            </h1>
            <p className="text-muted-foreground">
              Search the knowledge base directly without AI-generated answers.
              Results are ranked by semantic relevance.
            </p>
          </div>
        </BlurFade>

        {/* Search Form */}
        <BlurFade delay={0.2}>
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search Wisconsin legal sources..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="h-12"
                  />
                </div>
                <Select
                  value={docType}
                  onValueChange={(v) => setDocType(v as DocumentType | "all")}
                >
                  <SelectTrigger className="w-full md:w-[180px] h-12">
                    <SelectValue placeholder="Document Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="statute">Statutes</SelectItem>
                    <SelectItem value="case_law">Case Law</SelectItem>
                    <SelectItem value="policy">Policies</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={jurisdiction}
                  onValueChange={(v) => setJurisdiction(v as Jurisdiction | "all")}
                >
                  <SelectTrigger className="w-full md:w-[180px] h-12">
                    <SelectValue placeholder="Jurisdiction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Jurisdictions</SelectItem>
                    <SelectItem value="wisconsin">Wisconsin</SelectItem>
                    <SelectItem value="federal">Federal</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleSearch}
                  disabled={!query.trim() || isLoading}
                  className="h-12 px-8"
                >
                  {isLoading ? (
                    <span className="animate-pulse">Searching...</span>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </BlurFade>

        {/* Enhanced query indicator */}
        {enhancedQuery && enhancedQuery !== query && (
          <BlurFade delay={0.25}>
            <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Query enhanced to: &quot;{enhancedQuery}&quot;</span>
            </div>
          </BlurFade>
        )}

        {/* Error */}
        {error && (
          <Card className="border-destructive mb-8">
            <CardContent className="pt-6 flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : hasSearched ? (
          results.length > 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Found {results.length} results
              </p>
              {results.map((result, index) => (
                <ResultCard key={result.id} result={result} index={index} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No results found for &quot;{query}&quot;. Try different keywords or filters.
              </CardContent>
            </Card>
          )
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              Enter a search query to find relevant legal sources.
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  )
}
