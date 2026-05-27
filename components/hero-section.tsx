"use client"

import { Phone, ChevronDown, Sparkles, Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PHLogo } from "@/components/ph-logo"

export function HeroSection({ onCall }: { onCall: () => void }) {
  return (
    <section
      id="top"
      className="surface-dark divider-clip-down relative overflow-hidden"
    >
      <div className="bg-dotted absolute inset-0 opacity-60" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-primary/10 blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-primary/5 blur-[100px]"
        aria-hidden="true"
      />

      {/* Nav */}
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 pt-6">
        <PHLogo className="text-white" />
        <nav className="hidden items-center gap-8 text-sm text-white/70 md:flex">
          <a href="#how-it-works" className="hover:text-white">
            How it works
          </a>
          <a href="#inventory" className="hover:text-white">
            Inventory
          </a>
          <a href="#demo" className="hover:text-white">
            Try CARLO
          </a>
        </nav>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <span className="hidden sm:inline">CARLO online</span>
        </div>
      </header>

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-16 px-6 pb-32 pt-20 md:pb-40 lg:grid-cols-12 lg:gap-8 lg:pt-28">
        {/* Left content */}
        <div className="lg:col-span-7">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Powered by Agora Conversational AI</span>
          </div>

          <h1 className="text-balance text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl">
            Meet CARLO.
            <br />
            <span className="text-primary">Your AI Car Salesman.</span>
            <br />
            Always Ready.
          </h1>

          <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-white/70">
            Looking for your next car? Talk to CARLO —{" "}
            <span className="text-white">available 24/7</span>, ready to answer everything you need to know,
            confirm availability, and negotiate a real price live on the call.
          </p>

          <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="relative">
              <span
                className="absolute inset-0 rounded-full bg-primary/40 cta-glow"
                aria-hidden="true"
              />
              <Button
                onClick={onCall}
                size="lg"
                className="cta-pulse relative h-14 rounded-full bg-primary px-8 text-base font-bold text-primary-foreground shadow-xl shadow-primary/30 hover:bg-primary/90"
              >
                <Phone className="mr-2 h-5 w-5 fill-current" />
                Call CARLO Now
              </Button>
            </div>
            <a
              href="#inventory"
              className="group inline-flex items-center gap-1.5 text-sm text-white/70 transition hover:text-white"
            >
              Or browse our inventory
              <ChevronDown className="h-4 w-4 transition group-hover:translate-y-0.5" />
            </a>
          </div>

          <div className="mt-12 flex items-center gap-6 text-xs text-white/50">
            <div>
              <p className="font-mono text-2xl font-bold text-white">24/7</p>
              <p className="mt-1">Always answering</p>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div>
              <p className="font-mono text-2xl font-bold text-white">&lt;1s</p>
              <p className="mt-1">Voice latency</p>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div>
              <p className="font-mono text-2xl font-bold text-white">8</p>
              <p className="mt-1">Cars in stock</p>
            </div>
          </div>
        </div>

        {/* Right phone mockup */}
        <div className="relative lg:col-span-5">
          <PhoneMockup onCall={onCall} />
        </div>
      </div>
    </section>
  )
}

function PhoneMockup({ onCall }: { onCall: () => void }) {
  return (
    <div className="relative mx-auto w-full max-w-[320px]">
      <div
        className="absolute inset-0 -z-10 rounded-[3rem] bg-primary/20 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-ink p-3 shadow-2xl">
        <div className="absolute left-1/2 top-3 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-charcoal" />
        <div className="overflow-hidden rounded-[2rem] bg-charcoal">
          {/* Status */}
          <div className="flex items-center justify-between px-6 pb-2 pt-7 font-mono text-[10px] text-white/60">
            <span>9:41</span>
            <span>● ● ●</span>
          </div>

          <div className="px-6 pb-8 pt-6">
            <p className="text-center text-[10px] uppercase tracking-[0.25em] text-white/50">
              Incoming call
            </p>
            <div className="mt-6 flex flex-col items-center">
              <div className="relative">
                <span className="cta-pulse absolute inset-0 rounded-full bg-primary/40" />
                <div className="relative grid h-24 w-24 place-items-center rounded-full bg-primary text-primary-foreground">
                  <span className="font-mono text-2xl font-bold">C</span>
                </div>
              </div>
              <p className="mt-5 text-xl font-semibold text-white">CARLO</p>
              <p className="mt-1 text-xs text-white/50">Pearson Hardman Motors</p>
            </div>

            {/* Waveform */}
            <div className="mt-6 flex h-12 items-center justify-center gap-1">
              {[0.4, 0.7, 0.5, 0.9, 0.6, 1, 0.7, 0.4, 0.8, 0.5, 0.9, 0.6, 0.7].map(
                (h, i) => (
                  <span
                    key={i}
                    className="wave-bar block w-1 rounded-full bg-primary"
                    style={{
                      height: `${h * 100}%`,
                      animationDelay: `${i * 0.08}s`,
                    }}
                  />
                ),
              )}
            </div>

            <p className="mt-4 rounded-xl bg-white/5 px-3 py-2 text-center text-[11px] leading-relaxed text-white/70">
              "Hi! I see you're asking about the 2020 Honda City — what would you like to know?"
            </p>

            <div className="mt-6 flex items-center justify-around">
              <button
                aria-label="Decline"
                className="grid h-12 w-12 place-items-center rounded-full bg-destructive/90 text-white"
              >
                <Phone className="h-5 w-5 rotate-[135deg]" />
              </button>
              <button
                aria-label="Mute"
                className="grid h-12 w-12 place-items-center rounded-full bg-white/8 text-white"
              >
                <Mic className="h-5 w-5" />
              </button>
              <button
                onClick={onCall}
                aria-label="Answer"
                className="cta-pulse grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground"
              >
                <Phone className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
