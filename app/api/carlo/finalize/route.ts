import { NextResponse } from "next/server"
import { createSupabaseAdmin } from "@/lib/supabase/server"

/**
 * Receives a final transcript from the browser when the call ends and
 * stores it on the lead. The Agora agent does most of the structured work
 * via tools during the call; this is just for the human-readable transcript.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const leadId: string = body.leadId
    const transcript: Array<{ who: string; text: string; ts?: number }> = body.transcript ?? []
    const summary: string | undefined = body.summary

    if (!leadId) return NextResponse.json({ error: "leadId required" }, { status: 400 })

    const supabase = createSupabaseAdmin()
    const patch: Record<string, unknown> = { transcript }
    if (summary) patch.summary = summary

    await supabase.from("leads").update(patch).eq("id", leadId)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[v0] finalize error", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
