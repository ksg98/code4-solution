"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { BlurFade } from "@/components/ui/blur-fade"
import { BorderBeam } from "@/components/ui/border-beam"
import { getSources, listDocuments, uploadDocument, deleteDocument, ingestDocuments, DocumentFile } from "@/lib/api"
import {
  Database,
  AlertCircle,
  Upload,
  Trash2,
  FileText,
  RefreshCw,
  Loader2,
  Search,
  ChevronDown,
  Check,
  X,
  Filter,
  Scale,
  Flag,
  FileType,
  Layers,
  CheckCircle2,
  BookOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"

import type { DocumentType, Jurisdiction } from "@/types"

type DocTypeFilter = DocumentType | "all"
type JurisdictionFilter = Jurisdiction | "all"

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
}

const docTypeOptions: { value: DocTypeFilter; label: string; icon: typeof FileText }[] = [
  { value: "all", label: "All Types", icon: FileType },
  { value: "case_law", label: "Cases", icon: BookOpen },
  { value: "policy", label: "Policies", icon: FileText },
  { value: "statute", label: "Statutes", icon: Scale },
]

const jurisdictionOptions: { value: JurisdictionFilter; label: string }[] = [
  { value: "all", label: "All Jurisdictions" },
  { value: "wisconsin", label: "Wisconsin" },
  { value: "federal", label: "Federal" },
]

// Upload dialog options (without "all")
const uploadDocTypeOptions: { value: DocumentType; label: string; icon: typeof FileText }[] = [
  { value: "case_law", label: "Cases", icon: BookOpen },
  { value: "policy", label: "Policies", icon: FileText },
  { value: "statute", label: "Statutes", icon: Scale },
]

const uploadJurisdictionOptions: { value: Jurisdiction; label: string }[] = [
  { value: "wisconsin", label: "Wisconsin" },
  { value: "federal", label: "Federal" },
]

// Helper to determine document type from filename
function getDocType(filename: string): { type: string; icon: typeof Scale; color: string; bgColor: string } {
  const name = filename.toLowerCase()
  if (name.includes("case") || name.includes("case_law")) {
    return { type: "Case", icon: BookOpen, color: "text-purple-600", bgColor: "bg-purple-500/10 border-purple-500/20" }
  }
  if (name.includes("policy") || name.includes("procedure")) {
    return { type: "Policy", icon: FileText, color: "text-green-600", bgColor: "bg-green-500/10 border-green-500/20" }
  }
  if (name.includes("statute") || name.includes("wis_stat")) {
    return { type: "Statute", icon: Scale, color: "text-blue-600", bgColor: "bg-blue-500/10 border-blue-500/20" }
  }
  return { type: "Document", icon: FileText, color: "text-gray-600", bgColor: "bg-gray-500/10 border-gray-500/20" }
}

function FilterDropdown({
  label,
  value,
  options,
  onChange,
  icon: Icon,
}: {
  label: string
  value: string
  options: { value: string; label: string; icon?: typeof FileText }[]
  onChange: (value: string) => void
  icon?: typeof FileText
}) {
  const [open, setOpen] = useState(false)
  const selectedOption = options.find((opt) => opt.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-9 px-3 gap-2 rounded-lg border transition-all duration-200",
            open && "border-primary ring-2 ring-primary/20"
          )}
        >
          {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
          <span className="text-sm">{selectedOption?.label || label}</span>
          <ChevronDown className={cn(
            "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-1.5" align="start">
        <div className="space-y-0.5">
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
                  "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                  value === option.value
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted"
                )}
              >
                {OptionIcon && <OptionIcon className="h-3.5 w-3.5" />}
                <span className="flex-1 text-left">{option.label}</span>
                {value === option.value && <Check className="h-3.5 w-3.5" />}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  isLoading,
}: {
  icon: typeof Database
  label: string
  value: string | number
  color: string
  isLoading: boolean
}) {
  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl border bg-background/50",
      color
    )}>
      <div className={cn("p-2 rounded-lg", color.replace("border-", "bg-").replace("/30", "/10"))}>
        <Icon className={cn("h-4 w-4", color.replace("border-", "text-").replace("/30", ""))} />
      </div>
      <div>
        <div className="text-lg font-bold">
          {isLoading ? <div className="h-5 w-12 bg-muted rounded animate-pulse" /> : value}
        </div>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

export default function SourcesPage() {
  const [documents, setDocuments] = useState<DocumentFile[]>([])
  const [totalChunks, setTotalChunks] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [isIngesting, setIsIngesting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("")
  const [docTypeFilter, setDocTypeFilter] = useState<DocTypeFilter>("all")
  const [jurisdictionFilter, setJurisdictionFilter] = useState<JurisdictionFilter>("all")
  const [isFocused, setIsFocused] = useState(false)

  // Upload dialog state
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadDocType, setUploadDocType] = useState<DocumentType>("case_law")
  const [uploadJurisdiction, setUploadJurisdiction] = useState<Jurisdiction>("wisconsin")

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [docsData, sourcesData] = await Promise.all([
        listDocuments(),
        getSources()
      ])
      setDocuments(docsData.documents)
      setTotalChunks(sourcesData.total_chunks)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Filter documents based on search and filters
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (!doc.filename.toLowerCase().includes(query)) {
          return false
        }
      }

      // Document type filter - match based on filename patterns
      if (docTypeFilter !== "all") {
        const filename = doc.filename.toLowerCase()
        if (docTypeFilter === "case_law" && !filename.includes("case") && !filename.includes("case_law")) {
          return false
        }
        if (docTypeFilter === "policy" && !filename.includes("policy") && !filename.includes("procedure")) {
          return false
        }
        if (docTypeFilter === "statute" && !filename.includes("statute") && !filename.includes("wis_stat")) {
          return false
        }
      }

      // Jurisdiction filter
      if (jurisdictionFilter !== "all") {
        const filename = doc.filename.toLowerCase()
        if (jurisdictionFilter === "wisconsin" && filename.includes("federal")) {
          return false
        }
        if (jurisdictionFilter === "federal" && !filename.includes("federal") && !filename.includes("usc")) {
          return false
        }
      }

      return true
    })
  }, [documents, searchQuery, docTypeFilter, jurisdictionFilter])

  // When files are selected, open the dialog to choose type/jurisdiction
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Limit to 10 files
    const fileArray = Array.from(files).slice(0, 10)
    setSelectedFiles(fileArray)
    setUploadDialogOpen(true)
    // Reset file input so same files can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // Confirm upload after selecting type and jurisdiction
  const handleConfirmUpload = async () => {
    if (selectedFiles.length === 0) return

    setIsUploading(true)
    setError(null)
    setMessage(null)
    setUploadDialogOpen(false)

    try {
      // Upload all files with the same type and jurisdiction
      const uploadPromises = selectedFiles.map(async (file) => {
        // Create a new file with metadata in the filename
        // Format: {jurisdiction}_{doctype}_{original_filename}
        const newFilename = `${uploadJurisdiction}_${uploadDocType}_${file.name}`
        const renamedFile = new File([file], newFilename, { type: file.type })
        return uploadDocument(renamedFile)
      })

      await Promise.all(uploadPromises)
      const typeLabel = uploadDocTypeOptions.find(o => o.value === uploadDocType)?.label
      const jurisdictionLabel = uploadJurisdictionOptions.find(o => o.value === uploadJurisdiction)?.label
      setMessage(`Uploaded ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''} as ${typeLabel} (${jurisdictionLabel})`)
      await fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setIsUploading(false)
      setSelectedFiles([])
    }
  }

  const handleCancelUpload = () => {
    setUploadDialogOpen(false)
    setSelectedFiles([])
  }

  const handleDelete = async (filename: string) => {
    if (!confirm(`Delete ${filename}?`)) return

    setError(null)
    setMessage(null)
    try {
      await deleteDocument(filename)
      setMessage(`Deleted ${filename}`)
      await fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed")
    }
  }

  const handleIngest = async () => {
    setIsIngesting(true)
    setError(null)
    setMessage(null)
    try {
      const result = await ingestDocuments()
      setMessage(`Ingested ${result.documents_loaded} documents, created ${result.chunks_created} chunks`)
      await fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ingestion failed")
    } finally {
      setIsIngesting(false)
    }
  }

  const clearFilters = () => {
    setSearchQuery("")
    setDocTypeFilter("all")
    setJurisdictionFilter("all")
  }

  const hasActiveFilters = searchQuery || docTypeFilter !== "all" || jurisdictionFilter !== "all"

  // Count documents by type (based on filename patterns)
  const casesCount = documents.filter(d => d.filename.toLowerCase().includes("case") || d.filename.toLowerCase().includes("case_law")).length
  const policyCount = documents.filter(d => d.filename.toLowerCase().includes("policy") || d.filename.toLowerCase().includes("procedure")).length
  const statuteCount = documents.filter(d => d.filename.toLowerCase().includes("statute") || d.filename.toLowerCase().includes("wis_stat")).length

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-5xl mx-auto space-y-5">
          {/* Header with Stats */}
          <BlurFade>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                  <Database className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Knowledge Base</h1>
                  <p className="text-sm text-muted-foreground">
                    Manage documents for the RAG system
                  </p>
                </div>
              </div>

              {/* Compact Stats Row */}
              <div className="flex flex-wrap items-center gap-2">
                <StatCard
                  icon={FileText}
                  label="Documents"
                  value={documents.length}
                  color="border-blue-500/30"
                  isLoading={isLoading}
                />
                <StatCard
                  icon={Layers}
                  label="Chunks"
                  value={totalChunks.toLocaleString()}
                  color="border-purple-500/30"
                  isLoading={isLoading}
                />
                <StatCard
                  icon={Scale}
                  label="Wisconsin"
                  value={documents.length}
                  color="border-red-500/30"
                  isLoading={isLoading}
                />
                <StatCard
                  icon={Flag}
                  label="Federal"
                  value={0}
                  color="border-green-500/30"
                  isLoading={isLoading}
                />
                <StatCard
                  icon={CheckCircle2}
                  label="Status"
                  value="Active"
                  color="border-emerald-500/30"
                  isLoading={false}
                />
              </div>
            </div>
          </BlurFade>

          {/* Search and Filters Bar */}
          <BlurFade delay={0.1}>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Input */}
              <div className="flex-1 relative">
                <div className={cn(
                  "relative rounded-xl border bg-background transition-all duration-200",
                  isFocused ? "border-primary shadow-sm shadow-primary/10" : "border-border hover:border-primary/50"
                )}>
                  {isFocused && <BorderBeam size={80} duration={6} colorFrom="hsl(var(--primary))" colorTo="hsl(var(--primary) / 0.3)" />}

                  <div className="flex items-center gap-2 px-3">
                    <Search className={cn(
                      "h-4 w-4 transition-colors",
                      isFocused ? "text-primary" : "text-muted-foreground"
                    )} />
                    <input
                      type="text"
                      placeholder="Search documents..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      className="flex-1 h-10 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="p-1 hover:bg-muted rounded"
                      >
                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Filter className="h-3.5 w-3.5" />
                </div>

                <FilterDropdown
                  label="Type"
                  value={docTypeFilter}
                  options={docTypeOptions}
                  onChange={(v) => setDocTypeFilter(v as DocTypeFilter)}
                  icon={Scale}
                />

                <FilterDropdown
                  label="Jurisdiction"
                  value={jurisdictionFilter}
                  options={jurisdictionOptions}
                  onChange={(v) => setJurisdictionFilter(v as JurisdictionFilter)}
                  icon={Scale}
                />

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-9 px-2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".pdf,.txt,.md"
                  multiple
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="h-10"
                >
                  {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  <span className="ml-2 hidden sm:inline">Upload</span>
                </Button>
                <Button
                  size="sm"
                  onClick={handleIngest}
                  disabled={isIngesting || documents.length === 0}
                  className="h-10"
                >
                  {isIngesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  <span className="ml-2 hidden sm:inline">Ingest</span>
                </Button>
              </div>
            </div>
          </BlurFade>

          {/* Results Count */}
          <BlurFade delay={0.15}>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{filteredDocuments.length}</span> of{" "}
                <span className="font-semibold text-foreground">{documents.length}</span> documents
                {hasActiveFilters && " (filtered)"}
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs gap-1">
                  <span className="h-2 w-2 rounded-full bg-purple-500" />
                  {casesCount} Cases
                </Badge>
                <Badge variant="outline" className="text-xs gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  {policyCount} Policies
                </Badge>
                <Badge variant="outline" className="text-xs gap-1">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  {statuteCount} Statutes
                </Badge>
              </div>
            </div>
          </BlurFade>

          {/* Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card className="border-destructive/50 bg-destructive/5">
                  <CardContent className="p-3 flex items-center gap-3">
                    <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                    <p className="text-sm text-destructive">{error}</p>
                    <button onClick={() => setError(null)} className="ml-auto">
                      <X className="h-4 w-4 text-destructive/70 hover:text-destructive" />
                    </button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card className="border-green-500/50 bg-green-500/5">
                  <CardContent className="p-3 flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                    <p className="text-sm text-green-600">{message}</p>
                    <button onClick={() => setMessage(null)} className="ml-auto">
                      <X className="h-4 w-4 text-green-600/70 hover:text-green-600" />
                    </button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Documents List */}
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <BlurFade key={i} delay={0.05 * i}>
                  <Card>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted animate-pulse" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-48 bg-muted rounded animate-pulse" />
                          <div className="h-3 w-32 bg-muted rounded animate-pulse" />
                        </div>
                        <div className="h-6 w-12 bg-muted rounded-full animate-pulse" />
                      </div>
                    </CardContent>
                  </Card>
                </BlurFade>
              ))}
            </div>
          ) : filteredDocuments.length === 0 ? (
            <BlurFade delay={0.2}>
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                  {hasActiveFilters ? (
                    <>
                      <p className="text-muted-foreground">No documents match your filters</p>
                      <Button variant="link" onClick={clearFilters} className="mt-2">
                        Clear filters
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="text-muted-foreground">No documents yet</p>
                      <p className="text-sm text-muted-foreground/70 mt-1">
                        Upload PDFs, TXT, or MD files to get started
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </BlurFade>
          ) : (
            <div className="space-y-2">
              {filteredDocuments.map((doc, index) => {
                const docType = getDocType(doc.filename)
                const DocIcon = docType.icon
                return (
                  <BlurFade key={doc.filename} delay={0.03 * index} direction="up">
                    <motion.div
                      whileHover={{ scale: 1.005, x: 2 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    >
                      <Card className="group hover:border-primary/30 transition-all duration-200 hover:shadow-md">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            {/* Document Type Icon */}
                            <div className={cn(
                              "p-2.5 rounded-lg border transition-transform duration-200 group-hover:scale-105",
                              docType.bgColor
                            )}>
                              <DocIcon className={cn("h-4 w-4", docType.color)} />
                            </div>

                            {/* File Info */}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                                {doc.filename}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{formatBytes(doc.size)}</span>
                                <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
                                <span className="uppercase">{doc.type}</span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="secondary"
                                className={cn("text-xs", docType.bgColor, docType.color)}
                              >
                                {docType.type}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(doc.filename)}
                                className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </BlurFade>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Upload {selectedFiles.length > 1 ? `${selectedFiles.length} Documents` : 'Document'}
            </DialogTitle>
            <DialogDescription>
              Select the document type and jurisdiction for {selectedFiles.length > 1 ? 'all files' : 'this file'}.
            </DialogDescription>
          </DialogHeader>

          {selectedFiles.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
                  <FileText className="h-6 w-6 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-4">
            {/* Document Type Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Document Type</label>
              <div className="grid grid-cols-2 gap-2">
                {uploadDocTypeOptions.map((option) => {
                  const OptionIcon = option.icon
                  return (
                    <button
                      key={option.value}
                      onClick={() => setUploadDocType(option.value)}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-lg border text-left transition-all",
                        uploadDocType === option.value
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      )}
                    >
                      <OptionIcon className={cn(
                        "h-4 w-4",
                        uploadDocType === option.value ? "text-primary" : "text-muted-foreground"
                      )} />
                      <span className={cn(
                        "text-sm",
                        uploadDocType === option.value ? "font-medium" : ""
                      )}>
                        {option.label}
                      </span>
                      {uploadDocType === option.value && (
                        <Check className="h-4 w-4 text-primary ml-auto" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Jurisdiction Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Jurisdiction</label>
              <div className="grid grid-cols-2 gap-2">
                {uploadJurisdictionOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setUploadJurisdiction(option.value)}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-lg border text-left transition-all",
                      uploadJurisdiction === option.value
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    )}
                  >
                    <Flag className={cn(
                      "h-4 w-4",
                      uploadJurisdiction === option.value ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className={cn(
                      "text-sm",
                      uploadJurisdiction === option.value ? "font-medium" : ""
                    )}>
                      {option.label}
                    </span>
                    {uploadJurisdiction === option.value && (
                      <Check className="h-4 w-4 text-primary ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleCancelUpload}>
              Cancel
            </Button>
            <Button onClick={handleConfirmUpload} disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload {selectedFiles.length > 1 ? `${selectedFiles.length} Files` : 'Document'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
