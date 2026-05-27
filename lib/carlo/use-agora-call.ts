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
  isDemoMode?: boolean
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
  const sessionRef = useRef<StartResp | null>(null)
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
        const session: StartResp = await startRes.json()
        sessionRef.current = session

        // Handle demo mode: fetch pre-seeded events and stream them
        if (session.isDemoMode) {
          const supabase = ensureSupabase()
          setStatus("connected")
          
          // Fetch all the pre-seeded events
          const { data: events } = await supabase
            .from("lead_events")
            .select("*")
            .eq("lead_id", session.leadId)
            .order("created_at", { ascending: true })
            .catch(() => ({ data: [] }))
          
          // Stream them with realistic delays
          if (events && events.length > 0) {
            let carloCount = 0
            for (const event of events) {
              const evType = event.type as string
              const text = (event.payload as any)?.text || ""
              
              // Simulate user/carlo speaking with delays
              if (evType.includes("carlo")) {
                setAgentSpeaking(true)
                await new Promise((r) => setTimeout(r, 800))
              }
              
              setTranscript((prev) => [...prev, { 
                who: evType.includes("you") ? "you" : "carlo", 
                text, 
                ts: Date.now() 
              }])
              
              if (evType.includes("carlo")) {
                setAgentSpeaking(false)
                carloCount++
                // Advance stages: first 1-2 turns = qualify, 3-4 = recommend, 5-6 = negotiate, 7+ = close
                if (carloCount === 2) setStage("recommend")
                if (carloCount === 4) setStage("negotiate")
                if (carloCount >= 6) setStage("close")
              }
              
              // Delay between messages
              await new Promise((r) => setTimeout(r, 1000 + Math.random() * 500))
            }
          }
          
          return
        }
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
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "lead_events",
              filter: `lead_id=eq.${session.leadId}`,
            },
            (payload) => {
              const event = payload.new as { type?: string; payload?: Record<string, unknown> }
              if (event?.type === "transcript_carlo" && event?.payload?.text) {
                const text = String(event.payload.text)
                setTranscript((prev) => [...prev, { who: "carlo", text, ts: Date.now() }])
              }
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
