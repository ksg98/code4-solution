"use client"

import { Car, Shield, AlertCircle, FileText, Scale, Lock } from "lucide-react"
import { cn } from "@/lib/utils"

interface LegalTopic {
  statute: string
  title: string
  description: string
}

const trafficTopics: LegalTopic[] = [
  { statute: "§ 346.63", title: "Operating while intoxicated", description: "OWI requirements" },
  { statute: "§ 346.04", title: "Traffic stops", description: "Vehicle stop authority" },
  { statute: "§ 343.305", title: "Implied consent", description: "Chemical testing" },
  { statute: "§ 346.57", title: "Speed restrictions", description: "Speed enforcement" },
]

const forceTopics: LegalTopic[] = [
  { statute: "§ 939.48", title: "Self-defense", description: "Privileged force" },
  { statute: "§ 939.45", title: "Deadly force", description: "When justified" },
  { statute: "§ 175.40", title: "Force policy", description: "Department requirements" },
]

const rightsTopics: LegalTopic[] = [
  { statute: "Miranda", title: "Miranda warnings", description: "Custodial interrogation" },
  { statute: "§ 968.04", title: "Search warrants", description: "Warrant requirements" },
  { statute: "§ 968.24", title: "Search incident", description: "Warrantless authority" },
  { statute: "§ 968.26", title: "Terry stop", description: "Stop and frisk" },
]

const procedureTopics: LegalTopic[] = [
  { statute: "§ 968.07", title: "Probable cause", description: "Arrest requirements" },
  { statute: "§ 938.19", title: "Juvenile custody", description: "Taking juveniles" },
  { statute: "§ 968.12", title: "Force in arrest", description: "Effecting arrest" },
]

interface LegalTopicsGridProps {
  onSelectQuery: (query: string) => void
  disabled?: boolean
}

export function LegalTopicsGrid({ onSelectQuery, disabled = false }: LegalTopicsGridProps) {
  const createQueryFromTopic = (topic: LegalTopic) => {
    return `What are the requirements and procedures for ${topic.title} under Wisconsin law (${topic.statute})?`
  }

  const categories = [
    {
      name: "Traffic & OWI",
      icon: Car,
      color: "var(--primary-accent)",
      bgClass: "bg-primary-accent/10 hover:bg-primary-accent/15 border-primary-accent/20 hover:border-primary-accent/40",
      textClass: "text-primary-accent",
      topics: trafficTopics,
    },
    {
      name: "Use of Force",
      icon: Shield,
      color: "var(--error)",
      bgClass: "bg-error/10 hover:bg-error/15 border-error/20 hover:border-error/40",
      textClass: "text-error",
      topics: forceTopics,
    },
    {
      name: "Civil Rights",
      icon: FileText,
      color: "#a855f7",
      bgClass: "bg-purple-500/10 hover:bg-purple-500/15 border-purple-500/20 hover:border-purple-500/40",
      textClass: "text-purple-500",
      topics: rightsTopics,
    },
    {
      name: "Procedures",
      icon: Scale,
      color: "var(--success)",
      bgClass: "bg-success/10 hover:bg-success/15 border-success/20 hover:border-success/40",
      textClass: "text-success",
      topics: procedureTopics,
    },
  ]

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-2">
        <Scale className="h-4 w-4 text-primary-accent" />
        <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
          Quick Access - Wisconsin Legal Topics
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((category) => {
          const Icon = category.icon
          return (
            <div
              key={category.name}
              className="flex flex-col gap-3 p-4 rounded-xl border border-[#222222] bg-[#0a0a0a]"
            >
              {/* Category Header */}
              <div className="flex items-center gap-2 pb-2 border-b border-[#222222]">
                <Icon className={cn("h-5 w-5", category.textClass)} />
                <h4 className="text-sm font-semibold text-foreground">{category.name}</h4>
              </div>

              {/* Statute Cards */}
              <div className="flex flex-col gap-2">
                {category.topics.map((topic) => (
                  <button
                    key={topic.statute}
                    onClick={() => !disabled && onSelectQuery(createQueryFromTopic(topic))}
                    disabled={disabled}
                    className={cn(
                      "w-full p-3 rounded-lg border text-left",
                      "transition-all duration-300 ease-out",
                      category.bgClass,
                      disabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className="flex flex-col gap-1">
                      <span className={cn("text-xs font-semibold font-mono", category.textClass)}>
                        {topic.statute}
                      </span>
                      <span className="text-xs font-medium text-foreground line-clamp-1">
                        {topic.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground line-clamp-1">
                        {topic.description}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-center text-[10px] text-muted-foreground tracking-wide">
        Click any statute card to ask questions about Wisconsin law
      </p>
    </div>
  )
}
