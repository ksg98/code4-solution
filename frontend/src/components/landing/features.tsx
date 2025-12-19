"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BlurFade } from "@/components/ui/blur-fade"
import {
  Search,
  FileText,
  Shield,
  Zap,
  BookOpen,
  AlertTriangle,
  Link2,
  BarChart3,
} from "lucide-react"

const features = [
  {
    icon: Search,
    title: "Hybrid Search",
    description: "Combines semantic understanding with keyword matching for accurate results using Pinecone vector database.",
  },
  {
    icon: FileText,
    title: "Real Citations",
    description: "Every answer includes direct citations to Wisconsin statutes, case law, and official policies.",
  },
  {
    icon: BarChart3,
    title: "Confidence Scoring",
    description: "Know how reliable each answer is with automatic confidence assessment based on source quality.",
  },
  {
    icon: Link2,
    title: "Citation Chaining",
    description: "Automatically discovers and retrieves cross-referenced statutes mentioned in your results.",
  },
  {
    icon: AlertTriangle,
    title: "Sensitive Topics",
    description: "Special handling for use-of-force and other sensitive topics with additional disclaimers.",
  },
  {
    icon: Zap,
    title: "Streaming Responses",
    description: "Get answers in real-time with server-sent events for instant feedback.",
  },
  {
    icon: BookOpen,
    title: "Multiple Sources",
    description: "Searches across statutes, case law, LESB policies, and training materials simultaneously.",
  },
  {
    icon: Shield,
    title: "Wisconsin Focused",
    description: "Specifically trained on Wisconsin law enforcement legal requirements and procedures.",
  },
]

export function Features() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto">
        <BlurFade delay={0.1}>
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              Built for Law Enforcement
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to help officers and departments quickly find
              accurate legal information when they need it most.
            </p>
          </div>
        </BlurFade>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <BlurFade key={feature.title} delay={0.1 + index * 0.05}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <feature.icon className="h-10 w-10 text-primary mb-2" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  )
}
