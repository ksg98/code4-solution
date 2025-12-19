"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { BlurFade } from "@/components/ui/blur-fade"
import { NumberTicker } from "@/components/ui/number-ticker"
import { getSources } from "@/lib/api"
import type { KnowledgeSource, DocumentType } from "@/types"
import { Scale, BookOpen, FileText, GraduationCap, Database, AlertCircle } from "lucide-react"

const typeConfig: Record<DocumentType, { icon: typeof Scale; label: string; color: string }> = {
  statute: {
    icon: Scale,
    label: "Statutes",
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  case_law: {
    icon: BookOpen,
    label: "Case Law",
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  },
  policy: {
    icon: FileText,
    label: "Policies",
    color: "bg-green-500/10 text-green-600 border-green-500/20",
  },
  training: {
    icon: GraduationCap,
    label: "Training",
    color: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  },
  pdf: {
    icon: FileText,
    label: "PDFs",
    color: "bg-red-500/10 text-red-600 border-red-500/20",
  },
  txt: {
    icon: FileText,
    label: "Text Files",
    color: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  },
  md: {
    icon: FileText,
    label: "Markdown",
    color: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  },
  document: {
    icon: FileText,
    label: "Documents",
    color: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  },
}

function SourceCard({ source }: { source: KnowledgeSource }) {
  const config = typeConfig[source.type]
  const Icon = config.icon

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${config.color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-base">{source.title}</CardTitle>
            <CardDescription className="text-sm">{source.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm">
          <Badge variant="outline" className={config.color}>
            {config.label}
          </Badge>
          <span className="text-muted-foreground">
            {source.chunk_count} chunks indexed
          </span>
        </div>
        {source.statute_num && (
          <p className="text-xs text-muted-foreground mt-2">
            § {source.statute_num}
          </p>
        )}
        {source.case_citation && (
          <p className="text-xs text-muted-foreground mt-2">
            {source.case_citation}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export default function SourcesPage() {
  const [sources, setSources] = useState<KnowledgeSource[]>([])
  const [totalChunks, setTotalChunks] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSources() {
      try {
        const data = await getSources()
        setSources(data.sources)
        setTotalChunks(data.total_chunks)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load sources")
      } finally {
        setIsLoading(false)
      }
    }
    fetchSources()
  }, [])

  const sourcesByType = sources.reduce((acc, source) => {
    if (!acc[source.type]) acc[source.type] = []
    acc[source.type].push(source)
    return acc
  }, {} as Record<DocumentType, KnowledgeSource[]>)

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container py-8">
        <BlurFade delay={0.1}>
          <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Database className="h-8 w-8 text-primary" />
              Knowledge Base
            </h1>
            <p className="text-muted-foreground">
              Browse the legal sources available in this system. All data is sourced
              from official Wisconsin state resources.
            </p>
          </div>
        </BlurFade>

        {/* Stats */}
        <BlurFade delay={0.2}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {isLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <NumberTicker value={sources.length} />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Source Types</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {isLoading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <NumberTicker value={totalChunks} />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Total Chunks</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">Active</div>
                <p className="text-sm text-muted-foreground">Index Status</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">Wisconsin</div>
                <p className="text-sm text-muted-foreground">Jurisdiction</p>
              </CardContent>
            </Card>
          </div>
        </BlurFade>

        {error ? (
          <Card className="border-destructive">
            <CardContent className="pt-6 flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </CardContent>
          </Card>
        ) : (
          <BlurFade delay={0.3}>
            <Tabs defaultValue="all" className="space-y-6">
              <TabsList>
                <TabsTrigger value="all">All Sources</TabsTrigger>
                {Object.entries(typeConfig).map(([type, config]) => (
                  <TabsTrigger key={type} value={type}>
                    {config.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {isLoading ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Card key={i}>
                        <CardHeader>
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent>
                          <Skeleton className="h-6 w-20" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : sources.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                      No sources have been indexed yet. Run the ingestion script to populate the knowledge base.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sources.map((source) => (
                      <SourceCard key={source.id} source={source} />
                    ))}
                  </div>
                )}
              </TabsContent>

              {Object.entries(typeConfig).map(([type, config]) => (
                <TabsContent key={type} value={type} className="space-y-4">
                  {sourcesByType[type as DocumentType]?.length ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {sourcesByType[type as DocumentType].map((source) => (
                        <SourceCard key={source.id} source={source} />
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="pt-6 text-center text-muted-foreground">
                        No {config.label.toLowerCase()} have been indexed yet.
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </BlurFade>
        )}
      </main>
      <Footer />
    </div>
  )
}
