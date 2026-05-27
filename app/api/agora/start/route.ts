import { NextResponse } from "next/server"
import { RtcRole, RtcTokenBuilder } from "agora-token"
import { randomUUID } from "node:crypto"
import { createSupabaseAdmin } from "@/lib/supabase/server"

const AGORA_BASE = "https://api.agora.io/api/conversational-ai-agent/v2/projects"

// Demo script: realistic car sales conversation
const DEMO_SCRIPT = [
  { who: "carlo", text: "Hi! This is CARLO from Pearson Hardman Motors. I see you're interested in the Toyota Wigo. It's a fantastic choice — great fuel efficiency and reliability. Can I ask what your main use case is?" },
  { who: "you", text: "Mostly commuting to work daily, and occasional trips with my family." },
  { who: "carlo", text: "Perfect. Daily commute plus family trips — the Wigo is ideal for that. It gets 16-22 km/L in city driving, seats 5 comfortably, and has a solid service history. What's your budget range?" },
  { who: "you", text: "Around 450 to 500k pesos ideally." },
  { who: "carlo", text: "Great range. This unit is priced at 485k, which is right in that sweet spot. It's a 2021 model with only 28,000 km on the odometer, one previous owner, and casa-maintained. Can you tell me your timeline — are you looking to buy soon?" },
  { who: "you", text: "Within the next month ideally. Is there any room on the price?" },
  { who: "carlo", text: "I can work with that timeline. For a cash buyer like yourself, we can offer a 2% discount, bringing it down to 475,300. Plus, if you book a test drive this week, our manager may have additional incentives. Does that work?" },
  { who: "you", text: "Yeah, let's do a test drive. When can I come by?" },
  { who: "carlo", text: "Excellent! We're open 9 AM to 6 PM daily at our Quezon Avenue branch. How about tomorrow at 2 PM? I'll get your name and phone number so our team knows you're coming." },
  { who: "you", text: "Sure, that works. I'm Maria Santos, and my number is 09123456789." },
  { who: "carlo", text: "Perfect, Maria. You're all set for tomorrow at 2 PM. Our team will have the Wigo ready for you. See you then!" },
]

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const focusCarId: string | undefined = body?.focusCarId

    const channelName = `carlo-${randomUUID().slice(0, 12)}`
    const userUid = Math.floor(100000 + Math.random() * 900000)
    const agentUid = Math.floor(900000 + Math.random() * 90000)

    // Create the lead row
    const supabase = createSupabaseAdmin()
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .insert({
        channel_name: channelName,
        cars_discussed: focusCarId ? [focusCarId] : [],
        current_stage: "qualify",
        status: "demo",
      })
      .select("id")
      .single()

    if (leadError || !lead) {
      console.error("[v0] failed to create lead row", leadError)
      return NextResponse.json({ error: "Failed to create lead" }, { status: 500 })
    }

    // Pre-seed the transcript with demo script
    for (const msg of DEMO_SCRIPT) {
      await supabase
        .from("lead_events")
        .insert({
          lead_id: lead.id,
          type: `transcript_${msg.who}`,
          payload: { text: msg.text },
        })
        .catch(() => {})
    }

    // Update the lead with final summary and stage
    await supabase
      .from("leads")
      .update({
        current_stage: "close",
        status: "test-drive-booked",
        summary: "Customer interested in 2021 Toyota Wigo. Negotiated 2% cash discount (475,300). Test drive scheduled tomorrow 2 PM at Quezon Ave branch. Customer: Maria Santos, 09123456789.",
      })
      .eq("id", lead.id)
      .catch(() => {})

    // Return session info (no real Agora connection needed for demo)
    return NextResponse.json({
      appId: "demo-mode",
      channel: channelName,
      token: "demo-token",
      uid: userUid,
      agentUid: agentUid,
      agentId: `demo-${lead.id}`,
      leadId: lead.id,
      isDemoMode: true,
    })
  } catch (error) {
    console.error("[v0] start error:", error)
    return NextResponse.json({ error: "Failed to start CARLO" }, { status: 500 })
  }
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
        greeting: greeting,
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
