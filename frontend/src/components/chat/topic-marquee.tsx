"use client"

import { Badge } from "@/components/ui/badge"
import { Scale } from "lucide-react"

const TOPICS = [
  { category: "Traffic & OWI", items: ["OWI Arrest Requirements", "Traffic Stop Procedures"] },
  { category: "Use of Force", items: ["Use of Force Guidelines", "Deadly Force Justification"] },
  { category: "Civil Rights", items: ["Miranda Warnings", "Search & Seizure"] },
  { category: "Procedures", items: ["Probable Cause", "Juvenile Procedures"] },
]

const CATEGORY_COLORS = {
  "Traffic & OWI": "bg-primary-accent/10 text-primary-accent border-primary-accent/20",
  "Use of Force": "bg-error/10 text-error border-error/20",
  "Civil Rights": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "Procedures": "bg-success/10 text-success border-success/20",
}

export function TopicMarquee() {
  // Duplicate topics for seamless loop
  const duplicatedTopics = [...TOPICS, ...TOPICS]

  return (
    <div className="w-full overflow-hidden bg-[#0a0a0a] border-y border-[#222222] py-3 relative">
      {/* Gradient overlays for fade effect */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10" />

      <div className="flex items-center gap-2 mb-2 px-6">
        <Scale className="h-3.5 w-3.5 text-primary-accent" />
        <span className="text-[10px] uppercase tracking-wide font-semibold text-text-secondary">
          Quick Access - Common Legal Topics
        </span>
      </div>

      {/* Marquee container */}
      <div className="relative flex overflow-hidden">
        <div className="flex animate-marquee gap-6 items-center" style={{ '--duration': '40s', '--gap': '1.5rem' } as React.CSSProperties}>
          {duplicatedTopics.map((topic, index) => (
            <div key={index} className="flex items-center gap-3 shrink-0">
              {/* Category badge */}
              <Badge
                variant="outline"
                className={`text-[10px] px-2.5 py-1 font-semibold uppercase tracking-wide ${
                  CATEGORY_COLORS[topic.category as keyof typeof CATEGORY_COLORS]
                }`}
              >
                {topic.category}
              </Badge>

              {/* Topic items */}
              <div className="flex gap-2">
                {topic.items.map((item, itemIndex) => (
                  <span
                    key={itemIndex}
                    className="text-xs text-text-secondary bg-[#121212] px-3 py-1.5 rounded-md border border-[#222222] whitespace-nowrap transition-all duration-300 hover:border-primary-accent/50 hover:bg-primary-accent/5"
                  >
                    {item}
                  </span>
                ))}
              </div>

              {/* Separator */}
              {index < duplicatedTopics.length - 1 && (
                <div className="h-4 w-px bg-[#333333]" />
              )}
            </div>
          ))}
        </div>

        {/* Duplicate for seamless loop */}
        <div className="flex animate-marquee gap-6 items-center" aria-hidden="true" style={{ '--duration': '40s', '--gap': '1.5rem' } as React.CSSProperties}>
          {duplicatedTopics.map((topic, index) => (
            <div key={`dup-${index}`} className="flex items-center gap-3 shrink-0">
              <Badge
                variant="outline"
                className={`text-[10px] px-2.5 py-1 font-semibold uppercase tracking-wide ${
                  CATEGORY_COLORS[topic.category as keyof typeof CATEGORY_COLORS]
                }`}
              >
                {topic.category}
              </Badge>

              <div className="flex gap-2">
                {topic.items.map((item, itemIndex) => (
                  <span
                    key={itemIndex}
                    className="text-xs text-text-secondary bg-[#121212] px-3 py-1.5 rounded-md border border-[#222222] whitespace-nowrap transition-all duration-300 hover:border-primary-accent/50 hover:bg-primary-accent/5"
                  >
                    {item}
                  </span>
                ))}
              </div>

              {index < duplicatedTopics.length - 1 && (
                <div className="h-4 w-px bg-[#333333]" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Subtle info text */}
      <div className="text-center mt-2 px-6">
        <p className="text-[9px] text-text-secondary/60 tracking-wide">
          Click any quick access button below for instant legal information from Wisconsin statutes
        </p>
      </div>
    </div>
  )
}
