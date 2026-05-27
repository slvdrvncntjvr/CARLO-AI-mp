import { NextResponse } from "next/server"
import { randomUUID } from "node:crypto"
import { createSupabaseAdmin } from "@/lib/supabase/server"

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
    const leadId = randomUUID()

    // Kick off Supabase writes in background (don't wait for them)
    Promise.resolve().then(async () => {
      try {
        const sb = createSupabaseAdmin()
        
        // Insert lead
        await sb.from("leads").insert({
          id: leadId,
          channel_name: channelName,
          cars_discussed: focusCarId ? [focusCarId] : [],
          current_stage: "qualify",
          status: "demo",
        })
        
        // Insert transcript events
        for (const msg of DEMO_SCRIPT) {
          await sb.from("lead_events").insert({
            lead_id: leadId,
            type: `transcript_${msg.who}`,
            payload: { text: msg.text },
          })
        }
        
        // Update lead to close
        await sb.from("leads").update({
          current_stage: "close",
          status: "test-drive-booked",
          summary:
            "Customer interested in 2021 Toyota Wigo. Negotiated 2% cash discount (475,300). Test drive scheduled tomorrow 2 PM at Quezon Ave branch. Customer: Maria Santos, 09123456789.",
        }).eq("id", leadId)
      } catch (e) {
        console.error("[v0] background supabase error:", e)
      }
    })

    // Return immediately
    return NextResponse.json({
      appId: "demo-mode",
      channel: channelName,
      token: "demo-token",
      uid: userUid,
      agentUid: agentUid,
      agentId: `demo-${leadId}`,
      leadId: leadId,
      isDemoMode: true,
    })
  } catch (error) {
    console.error("[v0] start error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Failed to start CARLO", detail: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
