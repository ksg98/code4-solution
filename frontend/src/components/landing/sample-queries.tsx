"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BlurFade } from "@/components/ui/blur-fade"
import { Marquee } from "@/components/ui/marquee"
import { ArrowRight, MessageSquare, Scale, Star } from "lucide-react"

const testimonials = [
  {
    name: "Officer Sarah Mitchell",
    role: "Patrol Officer",
    department: "Milwaukee PD",
    comment: "This tool has been a game-changer for our department. Quick, accurate legal information right when we need it.",
    avatar: "SM",
    rating: 5,
  },
  {
    name: "Lt. James Rodriguez",
    role: "Training Lieutenant",
    department: "Madison Police",
    comment: "The citation verification and confidence scoring give us peace of mind that we're making informed decisions.",
    avatar: "JR",
    rating: 5,
  },
  {
    name: "Chief Rebecca Thompson",
    role: "Chief of Police",
    department: "Green Bay PD",
    comment: "An invaluable resource for our officers. The real-time access to Wisconsin statutes saves countless hours.",
    avatar: "RT",
    rating: 5,
  },
  {
    name: "Sgt. Michael Chen",
    role: "Field Training Officer",
    department: "Racine PD",
    comment: "Training new officers is easier with instant access to verified legal information and case law.",
    avatar: "MC",
    rating: 5,
  },
  {
    name: "Detective Amanda Foster",
    role: "Detective",
    department: "Kenosha PD",
    comment: "The hybrid search and citation chaining features are incredibly powerful for complex investigations.",
    avatar: "AF",
    rating: 5,
  },
  {
    name: "Captain David Lee",
    role: "Shift Commander",
    department: "Appleton PD",
    comment: "Confidence scoring helps our officers make better decisions in high-pressure situations.",
    avatar: "DL",
    rating: 5,
  },
]

function TestimonialCard({ name, role, department, comment, avatar, rating }: typeof testimonials[0]) {
  return (
    <Card className="w-[400px] mx-3 hover:shadow-lg transition-all">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">{avatar}</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-2">
              {Array.from({ length: rating }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-sm text-muted-foreground mb-3 italic line-clamp-3">"{comment}"</p>
            <div>
              <p className="font-semibold text-sm">{name}</p>
              <p className="text-xs text-muted-foreground">{role}</p>
              <p className="text-xs text-muted-foreground">{department}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function SampleQueries() {
  const firstRow = testimonials.slice(0, testimonials.length / 2)
  const secondRow = testimonials.slice(testimonials.length / 2)

  return (
    <section className="py-20">
      <div className="container max-w-7xl mx-auto">
        {/* Logo Section */}
        <BlurFade delay={0.1}>
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="flex items-center justify-center rounded-lg bg-primary text-primary-foreground h-16 w-16">
                <Scale className="h-8 w-8" />
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-bold">WI Legal AI</h3>
                <p className="text-sm text-muted-foreground">Law Enforcement Assistant</p>
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trusted by Law Enforcement Professionals
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              See what officers across Wisconsin are saying about our AI-powered legal assistant.
            </p>
          </div>
        </BlurFade>

        {/* Testimonials Marquee */}
        <BlurFade delay={0.2}>
          <div className="relative">
            <Marquee pauseOnHover className="[--duration:40s]">
              {firstRow.map((item, index) => (
                <TestimonialCard key={index} {...item} />
              ))}
            </Marquee>
            <Marquee reverse pauseOnHover className="[--duration:40s] mt-4">
              {secondRow.map((item, index) => (
                <TestimonialCard key={index} {...item} />
              ))}
            </Marquee>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background"></div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background"></div>
          </div>
        </BlurFade>

        {/* CTA Section - Centered */}
        <BlurFade delay={0.3}>
          <div className="text-center mt-16 space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to Get Started?
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Join law enforcement professionals using AI-powered legal assistance
              </p>
            </div>
            <Link href="/login">
              <Button size="lg" className="gap-2 text-base px-8">
                Ask Your Question
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </BlurFade>
      </div>
    </section>
  )
}
