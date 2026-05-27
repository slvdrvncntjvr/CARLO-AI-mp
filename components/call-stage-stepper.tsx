"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const STAGES = [
  { key: "qualify", label: "Qualify" },
  { key: "recommend", label: "Recommend" },
  { key: "objection", label: "Handle" },
  { key: "negotiate", label: "Negotiate" },
  { key: "close", label: "Close" },
] as const

export function CallStageStepper({ stage }: { stage: string }) {
  const idx = STAGES.findIndex((s) => s.key === stage)
  const activeIdx = idx === -1 ? 0 : idx

  return (
    <div className="flex items-center gap-1.5">
      {STAGES.map((s, i) => {
        const done = i < activeIdx
        const active = i === activeIdx
        return (
          <div key={s.key} className="flex items-center gap-1.5">
            <div
              className={cn(
                "flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider transition",
                done && "bg-primary/15 text-primary",
                active && "bg-primary text-primary-foreground",
                !done && !active && "bg-white/5 text-white/40",
              )}
            >
              <span
                className={cn(
                  "grid h-3.5 w-3.5 place-items-center rounded-full text-[9px]",
                  done && "bg-primary text-primary-foreground",
                  active && "bg-primary-foreground/20",
                  !done && !active && "bg-white/10",
                )}
              >
                {done ? <Check className="h-2.5 w-2.5" /> : i + 1}
              </span>
              {s.label}
            </div>
            {i < STAGES.length - 1 && (
              <span
                className={cn(
                  "h-px w-3 transition",
                  i < activeIdx ? "bg-primary/40" : "bg-white/10",
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
