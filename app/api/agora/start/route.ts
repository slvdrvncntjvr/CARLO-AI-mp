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

    console.log("[v0] Agora start — credentials check:", {
      appId: !!appId,
      appCertificate: !!appCertificate,
      customerKey: !!customerKey,
      customerSecret: !!customerSecret,
    })

    if (!appId || !appCertificate || !customerKey || !customerSecret) {
      console.error("[v0] Missing Agora credentials")
      return NextResponse.json({ error: "Agora credentials not configured" }, { status: 500 })
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

    const systemPrompt = buildSystemPrompt({ focusCarId, channelName, leadId: lead.id })

    const payload = {
      name: `carlo-${channelName}`,
      properties: {
        channel: channelName,
        token: agentToken,
        agent_rtc_uid: String(agentUid),
        remote_rtc_uids: [String(userUid)],
        enable_string_uid: false,
        asr: {
          vendor: "deepgram",
          language: "en-US",
        },
        llm: {
          url: llmUrl,
          api_key: "carlo",
          system_messages: [
            {
              role: "system",
              content: systemPrompt,
            },
          ],
          greeting_message: greeting,
          max_history: 20,
          style: "openai",
        },
        tts: {
          addon: "default",
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
    console.log("[v0] Agora API response:", {
      status: agoraRes.status,
      detail: agoraJson?.detail,
      agentId: agoraJson?.agent_id,
    })
    
    if (!agoraRes.ok) {
      console.error("[v0] agora join failed", {
        status: agoraRes.status,
        response: agoraJson,
        payloadSent: JSON.stringify(payload, null, 2),
      })
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
