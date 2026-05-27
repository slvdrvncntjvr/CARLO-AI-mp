"use client"

import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { inventory, formatPHP } from "@/lib/inventory"

const bodyTypeOrder = ["Sedan", "SUV", "Pickup", "MPV", "Hatchback"] as const

function buildLotComposition() {
  const counts = new Map<string, number>()
  for (const car of inventory) {
    counts.set(car.bodyType, (counts.get(car.bodyType) ?? 0) + 1)
  }
  return bodyTypeOrder
    .map((label) => ({ label, count: counts.get(label) ?? 0 }))
    .filter((row) => row.count > 0)
}

export function HeroSection({ onCall }: { onCall: () => void }) {
  const composition = buildLotComposition()
  const totalUnits = inventory.length
  const prices = inventory.map((c) => c.price)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const maxBodyCount = Math.max(...composition.map((r) => r.count))

  return (
    <section
      id="top"
      className="surface-dark divider-clip-down relative overflow-hidden"
    >
      {/* Background image */}
      <div className="absolute inset-0" aria-hidden="true">
        <img
          src="/showroom-hero.jpg"
          alt=""
          className="h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/85 to-ink" />
      </div>
      <div className="bg-dotted absolute inset-0 opacity-30" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-primary/10 blur-[120px]"
        aria-hidden="true"
      />

      <SiteHeader variant="dark" />

      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 pb-24 pt-20 md:pb-28 md:pt-24 lg:grid-cols-[1.35fr_1fr] lg:gap-8">
        <div className="max-w-4xl">
          <h1 className="text-balance text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl">
            Quality used cars,
            <br />
            <span className="text-primary">ready to drive home.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-white/70">
            Sedans, SUVs and pickups, every unit carefully inspected and priced fair. Browse the
            full lot, find the one you like, and our AI agent CARLO is on standby to answer
            questions or quote you a real price, day or night.
          </p>

          <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Button
              asChild
              size="lg"
              className="h-14 rounded-full bg-primary px-8 text-base font-bold text-primary-foreground shadow-xl shadow-primary/30 hover:bg-primary/90"
            >
              <Link href="/inventory">
                Browse Inventory
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>

            <button
              onClick={onCall}
              className="group inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm text-white backdrop-blur transition hover:border-primary/40 hover:bg-white/10"
            >
              <span className="relative flex h-8 w-8 items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-primary/40 cta-pulse" />
                <span className="relative grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
              </span>
              <span>Talk to CARLO instead</span>
            </button>
          </div>

          <div className="mt-14 max-w-2xl rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/50">
                  Lot composition
                </p>
                <p className="mt-1 font-serif text-lg font-semibold text-white">
                  {totalUnits} units in stock
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/50">
                  Price range
                </p>
                <p className="mt-1 font-mono text-sm font-semibold text-white">
                  {formatPHP(minPrice)} <span className="text-white/40">—</span> {formatPHP(maxPrice)}
                </p>
              </div>
            </div>

            <ul className="mt-4 space-y-2.5">
              {composition.map((row) => {
                const widthPct = (row.count / maxBodyCount) * 100
                return (
                  <li key={row.label} className="flex items-center gap-3 text-sm">
                    <span className="w-20 shrink-0 text-white/70">{row.label}</span>
                    <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
                      <span
                        className="absolute inset-y-0 left-0 rounded-full bg-primary"
                        style={{ width: `${widthPct}%` }}
                      />
                    </span>
                    <span className="w-6 shrink-0 text-right font-mono text-xs text-white">
                      {row.count}
                    </span>
                  </li>
                )
              })}
            </ul>

            <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-xs">
              <span className="inline-flex items-center gap-2 text-white/60">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                CARLO is online &middot; 24/7
              </span>
              <span className="text-white/40">120-pt inspection on every unit</span>
            </div>
          </div>
        </div>

        {/* CARLO mascot — right column */}
        <div className="relative hidden lg:block">
          <div className="relative mx-auto aspect-square w-full max-w-md">
            <div
              className="absolute inset-x-8 bottom-6 h-40 rounded-full bg-primary/25 blur-3xl"
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 rounded-full bg-primary/5 blur-2xl"
              aria-hidden="true"
            />
            <img
              src="/carlo/carlo-hero.png"
              alt="CARLO, the AI voice agent for Pearson Hardman Motors"
              className="carlo-float relative h-full w-full select-none object-contain"
              style={{ mixBlendMode: "lighten" }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
