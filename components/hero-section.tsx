"use client"

import Link from "next/link"
import { Phone, ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"

export function HeroSection({ onCall }: { onCall: () => void }) {
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
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span>Pearson Hardman Motors · Metro Manila</span>
          </div>

          <h1 className="text-balance text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl">
            Quality used cars.
            <br />
            <span className="text-primary">Negotiated by AI.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-white/70">
            Browse our live inventory of carefully inspected sedans, SUVs and pickups. Every unit
            on this lot is talkable — pick a car and our AI agent CARLO will answer your questions
            and quote a real price, 24/7.
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
                  <Phone className="h-3.5 w-3.5 fill-current" />
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Or just call CARLO now
              </span>
            </button>
          </div>

          <div className="mt-14 grid max-w-2xl grid-cols-3 gap-6 border-t border-white/10 pt-8">
            <div>
              <p className="font-mono text-3xl font-bold text-white">8</p>
              <p className="mt-1 text-xs text-white/50">Units in stock</p>
            </div>
            <div>
              <p className="font-mono text-3xl font-bold text-white">24/7</p>
              <p className="mt-1 text-xs text-white/50">CARLO is on call</p>
            </div>
            <div>
              <p className="font-mono text-3xl font-bold text-white">&lt;1s</p>
              <p className="mt-1 text-xs text-white/50">Voice response</p>
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
              className="carlo-float relative h-full w-full select-none object-contain drop-shadow-[0_25px_60px_rgba(34,197,94,0.25)]"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
