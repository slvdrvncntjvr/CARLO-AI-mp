"use client"

import { Sparkles } from "lucide-react"

export function CarloFab({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Ask CARLO for help"
      className="group fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-full border border-border bg-foreground py-2 pl-2 pr-5 text-background shadow-2xl shadow-black/20 transition hover:scale-[1.02]"
    >
      <span className="relative grid h-12 w-12 place-items-center overflow-hidden rounded-full bg-primary">
        <span className="absolute inset-0 cta-pulse rounded-full bg-primary/50" aria-hidden="true" />
        <img
          src="/carlo/carlo-hero.png"
          alt=""
          className="relative h-14 w-14 -translate-y-0.5 select-none object-contain"
          style={{ mixBlendMode: "lighten" }}
        />
      </span>
      <span className="flex flex-col items-start leading-tight">
        <span className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-background/60">
          <Sparkles className="h-2.5 w-2.5" />
          AI agent
        </span>
        <span className="text-sm font-semibold">Ask CARLO</span>
      </span>
    </button>
  )
}
