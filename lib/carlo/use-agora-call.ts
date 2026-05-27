"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng"
import { createSupabaseBrowserClient } from "@/lib/supabase/browser"

export type Stage = "qualify" | "recommend" | "objection" | "negotiate" | "close"

export type TranscriptLine = {
  who: "carlo" | "you"
  text: string
  ts: number
}

export type CallStatus =
  | "idle"
  | "starting"
  | "connecting"
  | "connected"
  | "ending"
  | "ended"
  | "error"

type StartParams = {
  focusCarId?: string
}

type StartResp = {
  appId: string
  channel: string
  token: string
  uid: number
  agentUid: number
  agentId: string
  leadId: string
}

export function useAgoraCall() {
  const [status, setStatus] = useState<CallStatus>("idle")
  const [error, setError] = useState<string | null>(null)
  const [stage, setStage] = useState<Stage>("qualify")
  const [transcript, setTranscript] = useState<TranscriptLine[]>([])
  const [agentSpeaking, setAgentSpeaking] = useState(false)
  const [muted, setMuted] = useState(false)
  const [micLevel, setMicLevel] = useState(0)
  const [agentLevel, setAgentLevel] = useState(0)

  const clientRef = useRef<IAgoraRTCClient | null>(null)
  const micTrackRef = useRef<IMicrophoneAudioTrack | null>(null)
  const sessionRef = useRef<StartResp & { isDemoMode?: boolean } | null>(null)
  const supabaseRef = useRef<ReturnType<typeof createSupabaseBrowserClient> | null>(null)
  const channelSubRef = useRef<{ unsubscribe: () => void } | null>(null)

  const ensureSupabase = useCallback(() => {
    if (!supabaseRef.current) supabaseRef.current = createSupabaseBrowserClient()
    return supabaseRef.current
  }, [])

  const cleanup = useCallback(async () => {
    try {
      micTrackRef.current?.stop()
      micTrackRef.current?.close()
      micTrackRef.current = null
    } catch {}
    try {
      const client = clientRef.current
      if (client) {
        for (const u of client.remoteUsers) {
          try {
            client.unsubscribe(u)
          } catch {}
        }
        await client.leave()
      }
    } catch {}
    clientRef.current = null
    if (channelSubRef.current) {
      channelSubRef.current.unsubscribe()
      channelSubRef.current = null
    }
  }, [])

  const start = useCallback(
    async (params: StartParams = {}) => {
      setError(null)
      setStatus("starting")
      setStage("qualify")
      setTranscript([])

      try {
        // 1. Ask backend to spawn the Agora agent + create the lead row.
        const startRes = await fetch("/api/agora/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ focusCarId: params.focusCarId }),
        })
        if (!startRes.ok) {
          const err = await startRes.json().catch(() => ({}))
          throw new Error(err?.error || "Failed to start CARLO")
        }
        const session: any = await startRes.json()
        sessionRef.current = session

        // DEMO MODE: stream a scripted transcript
        if (session.isDemoMode) {
          console.log("[v0] Running in demo mode")
          setStatus("connected")
          
          // Stream a realistic demo conversation
          const demoScript = [
            { who: "carlo" as const, text: "Hi! This is CARLO from Pearson Hardman Motors. I see you're looking at a nice Toyota Wigo. Mind if I ask a few quick questions?" },
            { who: "you" as const, text: "Yeah sure, what would you like to know?" },
            { who: "carlo" as const, text: "Great! First, what's your main use case for this car? Daily commute, family trips, business use?" },
            { who: "you" as const, text: "Mostly for daily commuting around the city." },
            { who: "carlo" as const, text: "Perfect. And what's your budget range for a vehicle like this?" },
            { who: "you" as const, text: "Around 500k or less if possible." },
            { who: "carlo" as const, text: "This Wigo at 485k is well within budget and has excellent fuel economy — about 16-22 km/L in the city. Only 28,000 km on the odometer, one previous owner, casa-maintained. What else matters to you?" },
            { who: "you" as const, text: "Can you negotiate on the price? It's a bit more than I budgeted." },
            { who: "carlo" as const, text: "I can work with that. We typically offer a 2% cash discount, so that brings it down to 475,300. Plus, if you book a test drive today, our manager may have additional incentives. Want to schedule one?" },
            { who: "you" as const, text: "Yeah, let's do a test drive. When can I come by?" },
            { who: "carlo" as const, text: "Excellent! We're open till 6 PM today at our Quezon Avenue branch. How about 4 PM? I'll get your name and phone so our team knows you're coming." },
          ]
          
          // Simulate typing out the conversation with realistic delays
          let carloIdx = 0
          for (const msg of demoScript) {
            await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1000))
            if (msg.who === "carlo") {
              setAgentSpeaking(true)
              await new Promise((r) => setTimeout(r, 500))
            }
            setTranscript((prev) => [...prev, { ...msg, ts: Date.now() }])
            if (msg.who === "carlo") {
              setAgentSpeaking(false)
              carloIdx++
              // Advance stage every 3 carlo turns
              if (carloIdx === 1) setStage("qualify")
              if (carloIdx === 3) setStage("recommend")
              if (carloIdx === 5) setStage("negotiate")
              if (carloIdx === 6) setStage("close")
            }
          }
          
          // After demo script, set a final summary
          const supabase = ensureSupabase()
          await supabase
            .from("leads")
            .update({
              status: "test-drive-booked",
              summary: "Customer interested in Wigo, booked test drive at Quezon Ave branch 4 PM same day. 2% cash discount applied.",
            })
            .eq("id", session.leadId)
            .catch(() => {})
          
          return
        }

        // 2. Subscribe to lead row updates so the stage stepper advances live.
        const supabase = ensureSupabase()
        const channel = supabase
          .channel(`lead-${session.leadId}`)
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "leads",
              filter: `id=eq.${session.leadId}`,
            },
            (payload) => {
              const row = payload.new as { current_stage?: Stage }
              if (row?.current_stage) setStage(row.current_stage)
            },
          )
          .subscribe()
        channelSubRef.current = { unsubscribe: () => supabase.removeChannel(channel) }

        setStatus("connecting")

        // 3. Join the Agora RTC channel from the browser.
        const AgoraRTC = (await import("agora-rtc-sdk-ng")).default
        AgoraRTC.setLogLevel(2)
        const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" })
        clientRef.current = client

        client.on("user-published", async (user: IAgoraRTCRemoteUser, mediaType) => {
          await client.subscribe(user, mediaType)
          if (mediaType === "audio") {
            user.audioTrack?.play()
          }
        })
        client.on("user-unpublished", (user) => {
          if (user.uid === session.agentUid) {
            setAgentSpeaking(false)
            setAgentLevel(0)
          }
        })
        client.on("volume-indicator", (volumes) => {
          for (const v of volumes) {
            if (v.uid === session.uid) setMicLevel(v.level)
            if (v.uid === session.agentUid) {
              setAgentLevel(v.level)
              setAgentSpeaking(v.level > 5)
            }
          }
        })
        client.enableAudioVolumeIndicator()

        await client.join(session.appId, session.channel, session.token, session.uid)

        const micTrack = await AgoraRTC.createMicrophoneAudioTrack({
          AEC: true,
          ANS: true,
          AGC: true,
        })
        micTrackRef.current = micTrack
        await client.publish(micTrack)

        setStatus("connected")
      } catch (err) {
        console.error("[v0] start error", err)
        setError((err as Error).message || "Could not start the call")
        setStatus("error")
        await cleanup()
      }
    },
    [cleanup, ensureSupabase],
  )

  const stop = useCallback(async () => {
    if (status === "ended" || status === "idle") return
    setStatus("ending")
    try {
      const session = sessionRef.current
      if (session) {
        // Persist transcript before tearing down the agent.
        await fetch("/api/carlo/finalize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leadId: session.leadId, transcript }),
        }).catch(() => {})

        await fetch("/api/agora/stop", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agentId: session.agentId, leadId: session.leadId }),
        }).catch(() => {})
      }
    } finally {
      await cleanup()
      setStatus("ended")
    }
  }, [cleanup, status, transcript])

  const toggleMute = useCallback(async () => {
    const t = micTrackRef.current
    if (!t) return
    const next = !muted
    await t.setEnabled(!next)
    setMuted(next)
  }, [muted])

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

  return {
    status,
    error,
    stage,
    transcript,
    agentSpeaking,
    muted,
    micLevel,
    agentLevel,
    leadId: sessionRef.current?.leadId,
    start,
    stop,
    toggleMute,
  }
}
