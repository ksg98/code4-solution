import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Hero } from "@/components/landing/hero"
import { Features } from "@/components/landing/features"
import { SampleQueries } from "@/components/landing/sample-queries"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
        <SampleQueries />
      </main>
      <Footer />
    </div>
  )
}
