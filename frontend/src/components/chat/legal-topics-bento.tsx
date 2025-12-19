"use client"

import { Car, Shield, AlertCircle, FileText, Search, Scale, Users, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid"
import { Badge } from "@/components/ui/badge"

interface LegalTopic {
  statute: string
  title: string
  description: string
}

const trafficTopics: LegalTopic[] = [
  { statute: "§ 346.63", title: "Operating while intoxicated", description: "OWI requirements and procedures" },
  { statute: "§ 346.04", title: "Traffic stops", description: "Authority to stop vehicles" },
  { statute: "§ 343.305", title: "Implied consent", description: "Chemical testing requirements" },
  { statute: "§ 346.57", title: "Speed restrictions", description: "Speed limit enforcement" },
]

const forceTopics: LegalTopic[] = [
  { statute: "§ 939.48", title: "Self-defense", description: "Privileged use of force" },
  { statute: "§ 939.45", title: "Deadly force", description: "When deadly force is justified" },
  { statute: "§ 175.40", title: "Use of force policy", description: "Department requirements" },
]

const rightsTopics: LegalTopic[] = [
  { statute: "Miranda", title: "Miranda warnings", description: "Custodial interrogation rights" },
  { statute: "§ 968.04", title: "Search warrants", description: "When warrant is required" },
  { statute: "§ 968.24", title: "Search incident", description: "Warrantless search authority" },
  { statute: "§ 968.26", title: "Terry stop", description: "Stop and frisk procedures" },
]

const procedureTopics: LegalTopic[] = [
  { statute: "§ 968.07", title: "Probable cause", description: "Arrest requirements" },
  { statute: "§ 938.19", title: "Juvenile custody", description: "Taking juveniles into custody" },
  { statute: "§ 968.12", title: "Use of force in arrest", description: "Effecting an arrest" },
]

interface LegalTopicsBentoProps {
  onSelectQuery: (query: string) => void
  disabled?: boolean
}

export function LegalTopicsBento({ onSelectQuery, disabled = false }: LegalTopicsBentoProps) {
  const createQueryFromTopic = (topic: LegalTopic) => {
    return `What are the requirements and procedures for ${topic.title} under Wisconsin law (${topic.statute})?`
  }

  const features = [
    {
      Icon: Car,
      name: "Traffic & OWI",
      description: "Traffic stops, OWI arrests, and vehicle operations",
      cta: "Ask about Traffic Law",
      onClick: () => onSelectQuery("What are the legal requirements for an OWI arrest in Wisconsin?"),
      className: "col-span-3 lg:col-span-2",
      background: (
        <div className="absolute inset-0 top-10 grid grid-cols-2 gap-2 p-4">
          {trafficTopics.map((topic, idx) => (
            <button
              key={idx}
              onClick={() => !disabled && onSelectQuery(createQueryFromTopic(topic))}
              disabled={disabled}
              className={cn(
                "relative cursor-pointer overflow-hidden rounded-lg border p-3 text-left",
                "border-primary-accent/20 bg-primary-accent/5 hover:bg-primary-accent/10",
                "dark:border-primary-accent/20 dark:bg-primary-accent/10 dark:hover:bg-primary-accent/15",
                "transform-gpu transition-all duration-300 ease-out hover:scale-[1.02] hover:border-primary-accent/40",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <Car className="h-3 w-3 text-primary-accent" />
                  <span className="text-xs font-semibold text-primary-accent font-mono">
                    {topic.statute}
                  </span>
                </div>
                <div className="text-xs font-medium text-foreground line-clamp-1">{topic.title}</div>
                <p className="text-[10px] text-muted-foreground line-clamp-2">{topic.description}</p>
              </div>
            </button>
          ))}
        </div>
      ),
    },
    {
      Icon: Shield,
      name: "Use of Force",
      description: "Force continuum, deadly force, and self-defense",
      cta: "Ask about Use of Force",
      onClick: () => onSelectQuery("What are Wisconsin's use of force guidelines and legal standards?"),
      className: "col-span-3 lg:col-span-1",
      background: (
        <div className="absolute inset-0 top-10 flex flex-col gap-2 p-4">
          {forceTopics.map((topic, idx) => (
            <button
              key={idx}
              onClick={() => !disabled && onSelectQuery(createQueryFromTopic(topic))}
              disabled={disabled}
              className={cn(
                "relative cursor-pointer overflow-hidden rounded-lg border p-3 text-left",
                "border-error/20 bg-error/5 hover:bg-error/10",
                "dark:border-error/20 dark:bg-error/10 dark:hover:bg-error/15",
                "transform-gpu transition-all duration-300 ease-out hover:scale-[1.02] hover:border-error/40",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-3 w-3 text-error" />
                  <span className="text-xs font-semibold text-error font-mono">
                    {topic.statute}
                  </span>
                </div>
                <div className="text-xs font-medium text-foreground line-clamp-1">{topic.title}</div>
                <p className="text-[10px] text-muted-foreground line-clamp-2">{topic.description}</p>
              </div>
            </button>
          ))}
        </div>
      ),
    },
    {
      Icon: FileText,
      name: "Civil Rights",
      description: "Miranda, search & seizure, and constitutional rights",
      cta: "Ask about Civil Rights",
      onClick: () => onSelectQuery("What are the Miranda warning requirements in Wisconsin?"),
      className: "col-span-3 lg:col-span-1",
      background: (
        <div className="absolute inset-0 top-10 flex flex-col gap-2 p-4">
          {rightsTopics.map((topic, idx) => (
            <button
              key={idx}
              onClick={() => !disabled && onSelectQuery(createQueryFromTopic(topic))}
              disabled={disabled}
              className={cn(
                "relative cursor-pointer overflow-hidden rounded-lg border p-3 text-left",
                "border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10",
                "dark:border-purple-500/20 dark:bg-purple-500/10 dark:hover:bg-purple-500/15",
                "transform-gpu transition-all duration-300 ease-out hover:scale-[1.02] hover:border-purple-500/40",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <Lock className="h-3 w-3 text-purple-500" />
                  <span className="text-xs font-semibold text-purple-500 font-mono">
                    {topic.statute}
                  </span>
                </div>
                <div className="text-xs font-medium text-foreground line-clamp-1">{topic.title}</div>
                <p className="text-[10px] text-muted-foreground line-clamp-2">{topic.description}</p>
              </div>
            </button>
          ))}
        </div>
      ),
    },
    {
      Icon: Scale,
      name: "Procedures",
      description: "Probable cause, arrests, and juvenile matters",
      cta: "Ask about Procedures",
      onClick: () => onSelectQuery("What constitutes probable cause for arrest in Wisconsin?"),
      className: "col-span-3 lg:col-span-2",
      background: (
        <div className="absolute inset-0 top-10 grid grid-cols-2 gap-2 p-4">
          {procedureTopics.map((topic, idx) => (
            <button
              key={idx}
              onClick={() => !disabled && onSelectQuery(createQueryFromTopic(topic))}
              disabled={disabled}
              className={cn(
                "relative cursor-pointer overflow-hidden rounded-lg border p-3 text-left",
                "border-success/20 bg-success/5 hover:bg-success/10",
                "dark:border-success/20 dark:bg-success/10 dark:hover:bg-success/15",
                "transform-gpu transition-all duration-300 ease-out hover:scale-[1.02] hover:border-success/40",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <Scale className="h-3 w-3 text-success" />
                  <span className="text-xs font-semibold text-success font-mono">
                    {topic.statute}
                  </span>
                </div>
                <div className="text-xs font-medium text-foreground line-clamp-1">{topic.title}</div>
                <p className="text-[10px] text-muted-foreground line-clamp-2">{topic.description}</p>
              </div>
            </button>
          ))}
        </div>
      ),
    },
  ]

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-2 px-2">
        <Scale className="h-4 w-4 text-primary-accent" />
        <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
          Quick Access - Wisconsin Legal Topics
        </h3>
      </div>

      <BentoGrid className="lg:grid-rows-2">
        {features.map((feature, idx) => (
          <BentoCard key={idx} {...feature} disabled={disabled} />
        ))}
      </BentoGrid>

      <p className="text-center text-[10px] text-muted-foreground tracking-wide">
        Click any statute card or category button to ask questions about Wisconsin law
      </p>
    </div>
  )
}
