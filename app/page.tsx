"use client"

import { useState } from "react"
import { HeroSection } from "@/components/hero-section"
import { HowItWorks } from "@/components/how-it-works"
import { InventorySection } from "@/components/inventory-section"
import { DemoSection } from "@/components/demo-section"
import { SiteFooter } from "@/components/site-footer"
import { CarloCallModal } from "@/components/carlo-call-modal"
import type { Car } from "@/lib/inventory"

export default function Page() {
  const [callOpen, setCallOpen] = useState(false)
  const [activeCar, setActiveCar] = useState<Car | undefined>(undefined)

  const openCall = (car?: Car) => {
    setActiveCar(car)
    setCallOpen(true)
  }

  return (
    <main className="min-h-screen bg-background">
      <HeroSection onCall={() => openCall(undefined)} />
      <HowItWorks />
      <InventorySection onCallCar={(car) => openCall(car)} />
      <DemoSection onCall={() => openCall(undefined)} />
      <SiteFooter />

      <CarloCallModal
        open={callOpen}
        onClose={() => setCallOpen(false)}
        car={activeCar}
      />
    </main>
  )
}
