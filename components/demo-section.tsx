"use client"

import { Phone, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DemoSection({ onCall }: { onCall: () => void }) {
  return (
    <section id="demo" className="surface-dark divider-clip-up relative overflow-hidden py-28 md:py-36">
      <div className="bg-dotted absolute inset-0 opacity-50" aria-hidden="true" />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[140px]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Live demo</span>
          </div>
          <h2 className="mt-5 text-balance text-4xl font-bold tracking-tight text-white md:text-6xl">
            Try CARLO Right Now.
          </h2>
          <p className="mt-5 text-pretty text-base leading-relaxed text-white/70 md:text-lg">
            This is a live demo. CARLO will answer, check our actual inventory, and negotiate a real
            price with you. Try offering a lowball price and see what happens.
          </p>
        </div>

        <div className="mt-14 rounded-3xl border border-white/10 bg-charcoal-2/60 p-2 shadow-2xl backdrop-blur">
          <div className="relative rounded-[1.4rem] border border-white/5 bg-ink p-10 md:p-16">
            <div className="flex flex-col items-center text-center">
              {/* Big animated call orb */}
              <div className="relative">
                <span className="cta-pulse absolute inset-0 rounded-full bg-primary/40" />
                <button
                  onClick={onCall}
                  aria-label="Start call with CARLO"
                  className="relative grid h-32 w-32 place-items-center rounded-full bg-primary text-primary-foreground shadow-2xl shadow-primary/40 transition hover:scale-105 md:h-40 md:w-40"
                >
                  <Phone className="h-12 w-12 fill-current md:h-14 md:w-14" />
                </button>
              </div>

              {/* Waveform */}
              <div className="mt-10 flex h-16 items-end justify-center gap-1.5">
                {Array.from({ length: 28 }).map((_, i) => {
                  const heights = [0.3, 0.6, 0.4, 0.85, 0.55, 1, 0.7, 0.5, 0.9, 0.65]
                  const h = heights[i % heights.length]
                  return (
                    <span
                      key={i}
                      className="wave-bar block w-1.5 rounded-full bg-primary/80"
                      style={{
                        height: `${h * 100}%`,
                        animationDelay: `${(i % 10) * 0.07}s`,
                      }}
                    />
                  )
                })}
              </div>

              <p className="mt-10 max-w-md text-balance text-base text-white/80">
                Tap to start a real voice call with CARLO. He&apos;ll greet you, walk you through any
                listing, and negotiate live.
              </p>

              <Button
                onClick={onCall}
                size="lg"
                className="mt-6 h-12 rounded-full bg-white px-8 font-semibold text-charcoal hover:bg-white/90"
              >
                <Phone className="mr-2 h-4 w-4 fill-current" />
                Start the call
              </Button>

              <div className="mt-12 grid w-full max-w-xl grid-cols-3 gap-4 border-t border-white/10 pt-8 text-left">
                <Stat label="Avg. response" value="0.6s" />
                <Stat label="Languages" value="EN · TL" />
                <Stat label="Calls handled" value="∞" />
              </div>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-white/50">
          Tip for judges: ask CARLO about a specific car from the inventory above — he already knows it.
        </p>
      </div>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-xl font-bold text-white md:text-2xl">{value}</p>
      <p className="mt-1 text-[11px] uppercase tracking-wider text-white/50">{label}</p>
    </div>
  )
}
