"use client"

import { useState } from "react"
import { HeroSection } from "@/components/hero-section"
import { HowItWorks } from "@/components/how-it-works"
import { DemoSection } from "@/components/demo-section"
import { SiteFooter } from "@/components/site-footer"
import { CarloCallModal } from "@/components/carlo-call-modal"

export default function Page() {
  const [callOpen, setCallOpen] = useState(false)

  return (
    <main className="min-h-screen bg-background">
      <HeroSection onCall={() => setCallOpen(true)} />
      <HowItWorks />
      <DemoSection onCall={() => setCallOpen(true)} />
      <SiteFooter />

      <CarloCallModal open={callOpen} onClose={() => setCallOpen(false)} />
    </main>
  )
}
