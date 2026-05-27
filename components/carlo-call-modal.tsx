"use client"

import { useEffect, useRef, useState } from "react"
import { Phone, PhoneOff, Mic, Volume2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { type Car, formatPHP } from "@/lib/inventory"

type CallState = "ringing" | "connected" | "ended"

type Line = {
  who: "carlo" | "you"
  text: string
}

function buildScript(car?: Car): Line[] {
  if (!car) {
    return [
      { who: "carlo", text: "Hi! This is CARLO from Pearson Hardman Motors. What kind of car are you looking for today?" },
      { who: "you", text: "Just browsing — what do you have under 700 thousand?" },
      { who: "carlo", text: "Great budget. We have a 2020 Toyota Vios 1.3 XE CVT in pearl white at PHP 595,000 — only 42,000 kilometers, casa-maintained. Want me to walk you through it?" },
    ]
  }
  return [
    {
      who: "carlo",
      text: `Hi! I see you're asking about the ${car.year} ${car.make} ${car.model} ${car.variant} — the ${car.color.toLowerCase()} one in ${car.location}. What would you like to know?`,
    },
    { who: "you", text: "How's the condition? And is the price negotiable?" },
    {
      who: "carlo",
      text: `It's in ${car.condition.toLowerCase()} condition — ${car.mileage.toLocaleString()} kilometers, ${car.transmission.toLowerCase()} ${car.fuelType.toLowerCase()}. Asking is ${formatPHP(car.price)}. I have some flexibility — what number did you have in mind?`,
    },
    { who: "you", text: `Could you do ${formatPHP(Math.round(car.price * 0.82))}?` },
    {
      who: "carlo",
      text: `That's a bit below where we can land today. I can meet you at ${formatPHP(Math.round(car.price * 0.93))} — that's a real number, and I'll have our team confirm in writing. Shall I lock that in?`,
    },
  ]
}

export function CarloCallModal({
  open,
  onClose,
  car,
}: {
  open: boolean
  onClose: () => void
  car?: Car
}) {
  const [state, setState] = useState<CallState>("ringing")
  const [seconds, setSeconds] = useState(0)
  const [transcript, setTranscript] = useState<Line[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const script = useRef<Line[]>([])

  useEffect(() => {
    if (!open) return
    setState("ringing")
    setSeconds(0)
    setTranscript([])
    setActiveIndex(0)
    script.current = buildScript(car)

    const ringTimer = setTimeout(() => setState("connected"), 1400)
    return () => clearTimeout(ringTimer)
  }, [open, car])

  useEffect(() => {
    if (state !== "connected") return
    const t = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [state])

  useEffect(() => {
    if (state !== "connected") return
    if (activeIndex >= script.current.length) return
    const line = script.current[activeIndex]
    const delay = activeIndex === 0 ? 600 : 2200
    const t = setTimeout(() => {
      setTranscript((prev) => [...prev, line])
      setActiveIndex((i) => i + 1)
    }, delay)
    return () => clearTimeout(t)
  }, [state, activeIndex])

  if (!open) return null

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0")
  const ss = String(seconds % 60).padStart(2, "0")

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Call with CARLO"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-charcoal text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
          aria-label="Close call"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="border-b border-white/10 px-6 pb-5 pt-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-full bg-primary/15 ring-1 ring-primary/40">
                <img
                  src="/carlo/carlo-greeting.png"
                  alt="CARLO"
                  className="h-full w-full object-cover object-top"
                />
              </div>
              {state === "connected" && (
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-primary ring-2 ring-charcoal" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-base font-semibold">CARLO</p>
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
                  AI Agent
                </span>
              </div>
              <p className="text-xs text-white/60">
                {state === "ringing" && "Connecting…"}
                {state === "connected" && `On call · ${mm}:${ss}`}
                {state === "ended" && "Call ended"}
              </p>
            </div>
          </div>
          {car && (
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-white/5 p-3">
              <img
                src={car.image || "/placeholder.svg"}
                alt={`${car.year} ${car.make} ${car.model}`}
                className="h-12 w-16 rounded-md object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {car.year} {car.make} {car.model}
                </p>
                <p className="truncate text-xs text-white/60">
                  {car.color} · {car.location} · {formatPHP(car.price)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Body / Transcript */}
        <div className="relative h-[320px] overflow-y-auto px-6 py-5">
          {state === "ringing" && (
            <div className="flex h-full flex-col items-center justify-center gap-4">
              <div className="relative">
                <div className="cta-pulse h-20 w-20 rounded-full bg-primary/30" />
                <div className="absolute inset-0 grid place-items-center">
                  <Phone className="h-8 w-8 text-primary" />
                </div>
              </div>
              <p className="text-sm text-white/70">CARLO is picking up…</p>
            </div>
          )}

          {state !== "ringing" && (
            <div className="flex flex-col gap-3">
              {transcript.map((line, i) => (
                <div
                  key={i}
                  className={`flex ${line.who === "you" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      line.who === "carlo"
                        ? "bg-white/8 text-white"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {line.text}
                  </div>
                </div>
              ))}
              {state === "connected" && activeIndex < script.current.length && (
                <div className="flex items-center gap-1.5 px-3 py-2 text-white/50">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60 [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60 [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60" />
                  <span className="ml-2 text-xs">
                    {script.current[activeIndex]?.who === "carlo" ? "CARLO is speaking…" : "Listening…"}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 border-t border-white/10 bg-ink/60 px-6 py-5">
          <button
            className="grid h-12 w-12 place-items-center rounded-full bg-white/8 text-white/80 transition hover:bg-white/15"
            aria-label="Toggle microphone"
          >
            <Mic className="h-5 w-5" />
          </button>
          <Button
            onClick={() => {
              setState("ended")
              setTimeout(onClose, 600)
            }}
            className="h-14 w-14 rounded-full bg-destructive p-0 text-white hover:bg-destructive/90"
            aria-label="End call"
          >
            <PhoneOff className="h-5 w-5" />
          </Button>
          <button
            className="grid h-12 w-12 place-items-center rounded-full bg-white/8 text-white/80 transition hover:bg-white/15"
            aria-label="Toggle speaker"
          >
            <Volume2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
