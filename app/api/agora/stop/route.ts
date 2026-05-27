import { NextResponse } from "next/server"
import { createSupabaseAdmin } from "@/lib/supabase/server"

const AGORA_BASE = "https://api.agora.io/api/conversational-ai-agent/v2/projects"

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const agentId: string | undefined = body?.agentId
    const leadId: string | undefined = body?.leadId

    if (!agentId) {
      return NextResponse.json({ error: "agentId required" }, { status: 400 })
    }

    const appId = process.env.AGORA_APP_ID!
    const customerKey = process.env.AGORA_CUSTOMER_KEY!
    const customerSecret = process.env.AGORA_CUSTOMER_SECRET!

    const auth = Buffer.from(`${customerKey}:${customerSecret}`).toString("base64")
    const res = await fetch(`${AGORA_BASE}/${appId}/agents/${agentId}/leave`, {
      method: "POST",
      headers: { Authorization: `Basic ${auth}` },
    })

    if (leadId) {
      const supabase = createSupabaseAdmin()
      await supabase.from("lead_events").insert({
        lead_id: leadId,
        type: "call_ended",
        payload: { agent_id: agentId },
      })
    }

    return NextResponse.json({ ok: res.ok })
  } catch (err) {
    console.error("[v0] /api/agora/stop error", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
