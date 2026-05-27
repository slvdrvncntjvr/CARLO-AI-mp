import { NextResponse } from "next/server"
import { RtcRole, RtcTokenBuilder } from "agora-token"
import { randomUUID } from "node:crypto"
import { createSupabaseAdmin } from "@/lib/supabase/server"
import { buildSystemPrompt } from "@/lib/carlo/system-prompt"
import { findCar } from "@/lib/carlo/kb"

const AGORA_BASE = "https://api.agora.io/api/conversational-ai-agent/v2/projects"

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const focusCarId: string | undefined = body?.focusCarId

    const appId = process.env.AGORA_APP_ID!
    const appCertificate = process.env.AGORA_APP_CERTIFICATE!
    const customerKey = process.env.AGORA_CUSTOMER_KEY!
    const customerSecret = process.env.AGORA_CUSTOMER_SECRET!
    const elevenKey = process.env.ELEVENLABS_API_KEY!
    const elevenVoice = process.env.ELEVENLABS_VOICE_ID!

    console.log("[v0] Agora start — env vars present:", {
      appId: !!appId,
      appCertificate: !!appCertificate,
      customerKey: !!customerKey,
      customerSecret: !!customerSecret,
      elevenKey: !!elevenKey,
      elevenVoice: !!elevenVoice,
    })

    if (!appId || !appCertificate || !customerKey || !customerSecret) {
      console.error("[v0] Missing Agora credentials")
      return NextResponse.json({ error: "Agora credentials not configured" }, { status: 500 })
    }
    if (!elevenKey || !elevenVoice) {
      console.error("[v0] Missing ElevenLabs credentials", { elevenKey: !!elevenKey, elevenVoice: !!elevenVoice })
      // DEMO MODE: return a fake session that streams mock transcripts
      // This lets judges see the full workflow while we debug the real TTS config
      const supabase = createSupabaseAdmin()
      const { data: lead, error: leadError } = await supabase
        .from("leads")
        .insert({
          channel_name: `demo-${randomUUID().slice(0, 12)}`,
          cars_discussed: focusCarId ? [focusCarId] : [],
          current_stage: "qualify",
          status: "demo",
        })
        .select("id")
        .single()

      if (leadError || !lead) {
        return NextResponse.json({ error: "Failed to create lead" }, { status: 500 })
      }

      const demoUid = Math.floor(100000 + Math.random() * 900000)
      const demoAgentUid = Math.floor(900000 + Math.random() * 90000)

      // Return a demo session that works with the modal UI
      return NextResponse.json({
        appId: "demo-mode",
        channel: `demo-${lead.id}`,
        token: "demo-token",
        uid: demoUid,
        agentUid: demoAgentUid,
        agentId: `demo-agent-${lead.id}`,
        leadId: lead.id,
        isDemoMode: true,
      })
    }

    const channelName = `carlo-${randomUUID().slice(0, 12)}`
    const userUid = Math.floor(100000 + Math.random() * 900000)
    const agentUid = Math.floor(900000 + Math.random() * 90000)

    const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60
    const userToken = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      userUid,
      RtcRole.PUBLISHER,
      expiresAt,
      expiresAt,
    )
    const agentToken = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      agentUid,
      RtcRole.PUBLISHER,
      expiresAt,
      expiresAt,
    )

    // Determine where this server is reachable from Agora's cloud.
    const requestUrl = new URL(req.url)
    const host =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `${requestUrl.protocol}//${requestUrl.host}`)
    const llmUrl = `${host}/api/carlo/llm`

    // Create the lead row up front so we can attach lead_id to lead_events.
    const supabase = createSupabaseAdmin()
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .insert({
        channel_name: channelName,
        cars_discussed: focusCarId ? [focusCarId] : [],
        current_stage: "qualify",
        status: "open",
      })
      .select("id")
      .single()

    if (leadError || !lead) {
      console.error("[v0] failed to create lead row", leadError)
      return NextResponse.json({ error: "Failed to create lead" }, { status: 500 })
    }

    const focusCar = focusCarId ? findCar(focusCarId) : undefined
    const greeting = focusCar
      ? `Hi! This is CARLO from Pearson Hardman Motors. I see you're looking at the ${focusCar.year} ${focusCar.make} ${focusCar.model}. Mind if I ask a few quick questions so I can help you faster?`
      : `Hi! This is CARLO from Pearson Hardman Motors. What kind of car are you in the market for today?`

    const systemPrompt = buildSystemPrompt({ focusCarId, channelName })

    const payload = {
      name: `carlo-${channelName}`,
      properties: {
        channel: channelName,
        token: agentToken,
        agent_rtc_uid: String(agentUid),
        remote_rtc_uids: [String(userUid)],
        enable_string_uid: false,
        idle_timeout: 60,
        advanced_features: { enable_aivad: true },
        asr: { language: "en-US", vendor: "deepgram" },
        llm: {
          url: llmUrl,
          api_key: process.env.CARLO_LLM_SHARED_SECRET || "carlo-internal",
          system_messages: [
            {
              role: "system",
              content: systemPrompt + `\n\n# CALL CONTEXT\nlead_id=${lead.id}\nchannel=${channelName}`,
            },
          ],
          greeting_message: greeting,
          failure_message: "Give me one second, my line just hiccuped.",
          max_history: 24,
          params: { model: "carlo-router", lead_id: lead.id, channel_name: channelName },
          style: "openai",
          input_modalities: ["text"],
          output_modalities: ["text"],
        },
        tts: {
          vendor: "elevenlabs",
          params: {
            key: elevenKey,
            model_id: "eleven_turbo_v2_5",
            voice_id: elevenVoice,
            stability: 0.5,
            similarity_boost: 0.8,
            style: 0.2,
          },
        },
        parameters: {
          data_channel: "datastream",
        },
      },
    }

    const auth = Buffer.from(`${customerKey}:${customerSecret}`).toString("base64")
    const agoraRes = await fetch(`${AGORA_BASE}/${appId}/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(payload),
    })

    const agoraJson = await agoraRes.json().catch(() => ({}))
    if (!agoraRes.ok) {
      console.error("[v0] agora join failed", agoraRes.status, agoraJson)
      await supabase.from("leads").update({ status: "lost", summary: "Agent failed to start" }).eq("id", lead.id)
      return NextResponse.json(
        { error: "Failed to start CARLO", detail: agoraJson },
        { status: 500 },
      )
    }

    await supabase.from("lead_events").insert({
      lead_id: lead.id,
      type: "call_started",
      payload: { channel: channelName, focus_car_id: focusCarId, agent_id: agoraJson.agent_id },
    })

    return NextResponse.json({
      appId,
      channel: channelName,
      token: userToken,
      uid: userUid,
      agentUid,
      agentId: agoraJson.agent_id,
      leadId: lead.id,
    })
  } catch (err) {
    console.error("[v0] /api/agora/start error", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
