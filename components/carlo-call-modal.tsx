"use client"

import { useEffect } from "react"
import { Phone, PhoneOff, Mic, MicOff, X, Loader2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { type Car, formatPHP } from "@/lib/inventory"
import { useAgoraCall } from "@/lib/carlo/use-agora-call"
import { CallStageStepper } from "@/components/call-stage-stepper"

export function CarloCallModal({
  open,
  onClose,
  car,
}: {
  open: boolean
  onClose: () => void
  car?: Car
}) {
  const call = useAgoraCall()

  useEffect(() => {
    if (open && call.status === "idle") {
      call.start({ focusCarId: car?.id })
    }
    if (!open && (call.status === "connected" || call.status === "connecting")) {
      call.stop()
    }
    // We deliberately don't depend on `call` to avoid re-running on every state tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!open) return null

  const handleClose = async () => {
    await call.stop()
    onClose()
  }

  const statusLabel =
    call.status === "starting" || call.status === "connecting"
      ? "Connecting…"
      : call.status === "connected"
        ? call.agentSpeaking
          ? "CARLO is speaking"
          : "Listening…"
        : call.status === "ending"
          ? "Wrapping up…"
          : call.status === "ended"
            ? "Call ended"
            : call.status === "error"
              ? "Connection issue"
              : ""

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Call with CARLO"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-charcoal text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
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
              {call.status === "connected" && (
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-primary ring-2 ring-charcoal" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-base font-semibold">CARLO</p>
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
                  Live AI Agent
                </span>
              </div>
              <p className="text-xs text-white/60">{statusLabel}</p>
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

          <div className="mt-4 overflow-x-auto pb-1">
            <CallStageStepper stage={call.stage} />
          </div>
        </div>

        {/* Body */}
        <div className="relative h-[280px] overflow-y-auto px-6 py-5">
          {(call.status === "starting" || call.status === "connecting") && (
            <div className="flex h-full flex-col items-center justify-center gap-4">
              <div className="relative">
                <div className="cta-pulse h-20 w-20 rounded-full bg-primary/30" />
                <div className="absolute inset-0 grid place-items-center">
                  <Loader2 className="h-7 w-7 animate-spin text-primary" />
                </div>
              </div>
              <p className="text-sm text-white/70">CARLO is picking up…</p>
            </div>
          )}

          {call.status === "error" && (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <p className="text-sm font-semibold">We couldn&apos;t reach CARLO.</p>
              <p className="text-xs text-white/60">{call.error}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => call.start({ focusCarId: car?.id })}
                className="mt-2 border-white/20 bg-white/5 text-white hover:bg-white/10"
              >
                Try again
              </Button>
            </div>
          )}

          {(call.status === "connected" ||
            call.status === "ending" ||
            call.status === "ended") && (
            <div className="flex h-full flex-col items-center justify-center gap-6">
              <div className="relative grid place-items-center">
                <div
                  className="absolute inset-0 rounded-full bg-primary/30 transition-transform"
                  style={{
                    transform: `scale(${1 + (call.agentLevel / 100) * 1.4})`,
                    opacity: call.agentSpeaking ? 0.8 : 0.25,
                  }}
                />
                <div className="relative grid h-24 w-24 place-items-center overflow-hidden rounded-full bg-primary/15 ring-1 ring-primary/40">
                  <img
                    src="/carlo/carlo-greeting.png"
                    alt=""
                    className="h-full w-full object-cover object-top"
                  />
                </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <p className="text-sm font-medium text-white/80">
                  {call.agentSpeaking
                    ? "CARLO is speaking…"
                    : call.muted
                      ? "Microphone muted"
                      : "CARLO is listening"}
                </p>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: 12 }).map((_, i) => {
                    const threshold = (i + 1) * (100 / 12)
                    const filled = call.micLevel >= threshold
                    return (
                      <span
                        key={i}
                        className={`h-3 w-1 rounded-full transition ${filled ? "bg-primary" : "bg-white/10"}`}
                      />
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 border-t border-white/10 bg-ink/60 px-6 py-5">
          <button
            onClick={call.toggleMute}
            disabled={call.status !== "connected"}
            className={`grid h-12 w-12 place-items-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-50 ${
              call.muted
                ? "bg-destructive/20 text-destructive"
                : "bg-white/8 text-white/80 hover:bg-white/15"
            }`}
            aria-label="Toggle microphone"
          >
            {call.muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>
          <Button
            onClick={handleClose}
            className="h-14 w-14 rounded-full bg-destructive p-0 text-white hover:bg-destructive/90"
            aria-label="End call"
          >
            <PhoneOff className="h-5 w-5" />
          </Button>
          <button
            disabled
            className="grid h-12 w-12 place-items-center rounded-full bg-white/8 text-white/40"
            aria-label="Speaker"
          >
            <Phone className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
