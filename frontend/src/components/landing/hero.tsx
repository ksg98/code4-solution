"use client"

import Link from "next/link"
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { TextAnimate } from "@/components/ui/text-animate"
import { DotPattern } from "@/components/ui/dot-pattern"
import { BlurFade } from "@/components/ui/blur-fade"
import { Scale, ArrowRight, Shield, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

export function Hero() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <DotPattern
        className={cn(
          "[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]",
          "absolute inset-0 opacity-50"
        )}
      />

      <div className="container mx-auto relative z-10 py-20">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Badge */}
          <BlurFade delay={0.1}>
            <AnimatedGradientText className="px-4 py-1.5">
              <Scale className="h-4 w-4 mr-2" />
              <span>Wisconsin Law Enforcement Legal Assistant</span>
            </AnimatedGradientText>
          </BlurFade>

          {/* Main heading */}
          <BlurFade delay={0.2}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl">
              <TextAnimate animation="blurInUp" by="word">
                AI-Powered Legal Research for Law Enforcement
              </TextAnimate>
            </h1>
          </BlurFade>

          {/* Subtitle */}
          <BlurFade delay={0.3}>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              Get instant answers about Wisconsin statutes, policies, and case law.
              Built specifically for law enforcement professionals with real-time
              citations and confidence scoring.
            </p>
          </BlurFade>

          {/* CTA Buttons */}
          <BlurFade delay={0.4}>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login">
                <ShimmerButton className="shadow-2xl" background="#005cde">
                  <span className="flex items-center gap-2 whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white">
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </ShimmerButton>
              </Link>
              <Link href="/login">
                <ShimmerButton className="shadow-lg" background="#2563eb">
                  <span className="flex items-center gap-2 whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white">
                    <BookOpen className="h-4 w-4" />
                    Sign In
                  </span>
                </ShimmerButton>
              </Link>
            </div>
          </BlurFade>

          {/* Trust indicators */}
          <BlurFade delay={0.5}>
            <div className="flex items-center gap-6 text-sm text-muted-foreground pt-8">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Real Wisconsin Statutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Citation Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Confidence Scoring</span>
              </div>
            </div>
          </BlurFade>
        </div>
      </div>
    </section>
  )
}
