import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, AlertCircle } from "lucide-react"
import type { ConfidenceLevel } from "@/types"

interface ConfidenceBadgeProps {
  level: ConfidenceLevel
}

export function ConfidenceBadge({ level }: ConfidenceBadgeProps) {
  const config = {
    high: {
      label: "High Confidence",
      variant: "default" as const,
      className: "bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20",
      icon: CheckCircle,
    },
    medium: {
      label: "Medium Confidence",
      variant: "secondary" as const,
      className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 hover:bg-yellow-500/20",
      icon: AlertCircle,
    },
    low: {
      label: "Low Confidence",
      variant: "destructive" as const,
      className: "bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20",
      icon: AlertTriangle,
    },
  }

  const { label, className, icon: Icon } = config[level]

  return (
    <Badge variant="outline" className={className}>
      <Icon className="h-3 w-3 mr-1" />
      {label}
    </Badge>
  )
}
