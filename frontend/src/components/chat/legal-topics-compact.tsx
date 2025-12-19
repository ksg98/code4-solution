"use client"

import { Car, Shield, AlertCircle, FileText, Scale, Lock, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid"

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

interface LegalTopicsCompactProps {
  onSelectQuery: (query: string) => void
  disabled?: boolean
}

export function LegalTopicsCompact({ onSelectQuery, disabled = false }: LegalTopicsCompactProps) {
  const createQueryFromTopic = (topic: LegalTopic) => {
    return `What are the requirements and procedures for ${topic.title} under Wisconsin law (${topic.statute})?`
  }

  const features = [
    {
      Icon: Car,
      name: "Traffic & OWI",
      description: "Traffic stops, OWI arrests, and vehicle operations",
      cta: "View All Traffic Laws",
      onClick: () => onSelectQuery("What are the legal requirements for traffic stops and OWI arrests in Wisconsin?"),
      className: "col-span-3 lg:col-span-2",
      color: "var(--primary-accent)",
      topics: trafficTopics,
      background: (
        <div className="absolute inset-0 flex flex-col justify-center p-6 gap-3">
          {/* Show first 2 topics */}
          {trafficTopics.slice(0, 2).map((topic, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation()
                !disabled && onSelectQuery(createQueryFromTopic(topic))
              }}
              disabled={disabled}
              className={cn(
                "group/topic relative cursor-pointer overflow-hidden rounded-lg border p-3 text-left",
                "border-primary-accent/20 bg-primary-accent/5 hover:bg-primary-accent/15",
                "dark:border-primary-accent/20 dark:bg-primary-accent/10 dark:hover:bg-primary-accent/20",
                "transition-all duration-300 ease-out hover:scale-[1.02] hover:border-primary-accent/50",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex items-center gap-3">
                <Car className="h-4 w-4 text-primary-accent shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-primary-accent font-mono block">
                    {topic.statute}
                  </span>
                  <span className="text-xs font-medium text-foreground block truncate">
                    {topic.title}
                  </span>
                </div>
              </div>
            </button>
          ))}

          {/* Show more indicator - expands on hover */}
          <div className="group/more relative">
            <div className="text-center py-2 text-xs text-primary-accent/60 flex items-center justify-center gap-1">
              <ChevronDown className="h-3 w-3" />
              <span>+{trafficTopics.length - 2} more topics</span>
            </div>

            {/* Hidden topics - revealed on hover */}
            <div className="absolute bottom-full left-0 right-0 mb-2 opacity-0 invisible group-hover/more:opacity-100 group-hover/more:visible transition-all duration-300 flex flex-col gap-2 z-20">
              {trafficTopics.slice(2).map((topic, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation()
                    !disabled && onSelectQuery(createQueryFromTopic(topic))
                  }}
                  disabled={disabled}
                  className={cn(
                    "cursor-pointer overflow-hidden rounded-lg border p-3 text-left",
                    "border-primary-accent/30 bg-primary-accent/10 hover:bg-primary-accent/20",
                    "dark:border-primary-accent/30 dark:bg-primary-accent/15 dark:hover:bg-primary-accent/25",
                    "transition-all duration-300 ease-out hover:scale-[1.02]",
                    disabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Car className="h-4 w-4 text-primary-accent shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-semibold text-primary-accent font-mono block">
                        {topic.statute}
                      </span>
                      <span className="text-xs font-medium text-foreground block truncate">
                        {topic.title}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      Icon: Shield,
      name: "Use of Force",
      description: "Force continuum, deadly force, and self-defense",
      cta: "View Force Guidelines",
      onClick: () => onSelectQuery("What are Wisconsin's use of force guidelines and legal standards?"),
      className: "col-span-3 lg:col-span-1",
      color: "var(--error)",
      topics: forceTopics,
      background: (
        <div className="absolute inset-0 flex flex-col justify-center p-6 gap-3">
          {forceTopics.slice(0, 2).map((topic, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation()
                !disabled && onSelectQuery(createQueryFromTopic(topic))
              }}
              disabled={disabled}
              className={cn(
                "cursor-pointer overflow-hidden rounded-lg border p-3 text-left",
                "border-error/20 bg-error/5 hover:bg-error/15",
                "dark:border-error/20 dark:bg-error/10 dark:hover:bg-error/20",
                "transition-all duration-300 ease-out hover:scale-[1.02] hover:border-error/50",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="h-4 w-4 text-error shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-error font-mono block">
                    {topic.statute}
                  </span>
                  <span className="text-xs font-medium text-foreground block truncate">
                    {topic.title}
                  </span>
                </div>
              </div>
            </button>
          ))}

          {forceTopics.length > 2 && (
            <div className="group/more relative">
              <div className="text-center py-2 text-xs text-error/60 flex items-center justify-center gap-1">
                <ChevronDown className="h-3 w-3" />
                <span>+{forceTopics.length - 2} more</span>
              </div>

              <div className="absolute bottom-full left-0 right-0 mb-2 opacity-0 invisible group-hover/more:opacity-100 group-hover/more:visible transition-all duration-300 flex flex-col gap-2 z-20">
                {forceTopics.slice(2).map((topic, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation()
                      !disabled && onSelectQuery(createQueryFromTopic(topic))
                    }}
                    disabled={disabled}
                    className={cn(
                      "cursor-pointer overflow-hidden rounded-lg border p-3 text-left",
                      "border-error/30 bg-error/10 hover:bg-error/20",
                      "transition-all duration-300 ease-out hover:scale-[1.02]",
                      disabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-4 w-4 text-error shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold text-error font-mono block">
                          {topic.statute}
                        </span>
                        <span className="text-xs font-medium text-foreground block truncate">
                          {topic.title}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      Icon: FileText,
      name: "Civil Rights",
      description: "Miranda, search & seizure, and constitutional rights",
      cta: "View Civil Rights Laws",
      onClick: () => onSelectQuery("What are the Miranda warning and search & seizure requirements in Wisconsin?"),
      className: "col-span-3 lg:col-span-1",
      color: "var(--secondary-accent)",
      topics: rightsTopics,
      background: (
        <div className="absolute inset-0 flex flex-col justify-center p-6 gap-3">
          {rightsTopics.slice(0, 2).map((topic, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation()
                !disabled && onSelectQuery(createQueryFromTopic(topic))
              }}
              disabled={disabled}
              className={cn(
                "cursor-pointer overflow-hidden rounded-lg border p-3 text-left",
                "border-secondary-accent/20 bg-secondary-accent/5 hover:bg-secondary-accent/15",
                "dark:border-secondary-accent/20 dark:bg-secondary-accent/10 dark:hover:bg-secondary-accent/20",
                "transition-all duration-300 ease-out hover:scale-[1.02] hover:border-secondary-accent/50",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex items-center gap-3">
                <Lock className="h-4 w-4 text-secondary-accent shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-secondary-accent font-mono block">
                    {topic.statute}
                  </span>
                  <span className="text-xs font-medium text-foreground block truncate">
                    {topic.title}
                  </span>
                </div>
              </div>
            </button>
          ))}

          <div className="group/more relative">
            <div className="text-center py-2 text-xs text-secondary-accent/60 flex items-center justify-center gap-1">
              <ChevronDown className="h-3 w-3" />
              <span>+{rightsTopics.length - 2} more</span>
            </div>

            <div className="absolute bottom-full left-0 right-0 mb-2 opacity-0 invisible group-hover/more:opacity-100 group-hover/more:visible transition-all duration-300 flex flex-col gap-2 z-20">
              {rightsTopics.slice(2).map((topic, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation()
                    !disabled && onSelectQuery(createQueryFromTopic(topic))
                  }}
                  disabled={disabled}
                  className={cn(
                    "cursor-pointer overflow-hidden rounded-lg border p-3 text-left",
                    "border-secondary-accent/30 bg-secondary-accent/10 hover:bg-secondary-accent/20",
                    "transition-all duration-300 ease-out hover:scale-[1.02]",
                    disabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Lock className="h-4 w-4 text-secondary-accent shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-semibold text-secondary-accent font-mono block">
                        {topic.statute}
                      </span>
                      <span className="text-xs font-medium text-foreground block truncate">
                        {topic.title}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      Icon: Scale,
      name: "Procedures",
      description: "Probable cause, arrests, and juvenile matters",
      cta: "View All Procedures",
      onClick: () => onSelectQuery("What are the legal procedures for arrests and probable cause in Wisconsin?"),
      className: "col-span-3 lg:col-span-2",
      color: "var(--success)",
      topics: procedureTopics,
      background: (
        <div className="absolute inset-0 flex flex-col justify-center p-6 gap-3">
          {procedureTopics.slice(0, 2).map((topic, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation()
                !disabled && onSelectQuery(createQueryFromTopic(topic))
              }}
              disabled={disabled}
              className={cn(
                "cursor-pointer overflow-hidden rounded-lg border p-3 text-left",
                "border-success/20 bg-success/5 hover:bg-success/15",
                "dark:border-success/20 dark:bg-success/10 dark:hover:bg-success/20",
                "transition-all duration-300 ease-out hover:scale-[1.02] hover:border-success/50",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex items-center gap-3">
                <Scale className="h-4 w-4 text-success shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-success font-mono block">
                    {topic.statute}
                  </span>
                  <span className="text-xs font-medium text-foreground block truncate">
                    {topic.title}
                  </span>
                </div>
              </div>
            </button>
          ))}

          {procedureTopics.length > 2 && (
            <div className="group/more relative">
              <div className="text-center py-2 text-xs text-success/60 flex items-center justify-center gap-1">
                <ChevronDown className="h-3 w-3" />
                <span>+{procedureTopics.length - 2} more</span>
              </div>

              <div className="absolute bottom-full left-0 right-0 mb-2 opacity-0 invisible group-hover/more:opacity-100 group-hover/more:visible transition-all duration-300 flex flex-col gap-2 z-20">
                {procedureTopics.slice(2).map((topic, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation()
                      !disabled && onSelectQuery(createQueryFromTopic(topic))
                    }}
                    disabled={disabled}
                    className={cn(
                      "cursor-pointer overflow-hidden rounded-lg border p-3 text-left",
                      "border-success/30 bg-success/10 hover:bg-success/20",
                      "transition-all duration-300 ease-out hover:scale-[1.02]",
                      disabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Scale className="h-4 w-4 text-success shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold text-success font-mono block">
                          {topic.statute}
                        </span>
                        <span className="text-xs font-medium text-foreground block truncate">
                          {topic.title}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
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
        Click statute cards for specific questions • Hover "show more" to see all topics • Click category button for general overview
      </p>
    </div>
  )
}
