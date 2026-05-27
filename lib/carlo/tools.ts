/**
 * Tool definitions + executors for CARLO.
 *
 * Each tool is exposed to the LLM in OpenAI tool-calling format and executed
 * server-side inside /api/carlo/llm. Side effects (Supabase writes) happen
 * here so the /admin dashboard updates live.
 */
import { createSupabaseAdmin } from "@/lib/supabase/server"
import { findCar, loadKnowledgeBase } from "@/lib/carlo/kb"

export const STAGES = ["qualify", "recommend", "objection", "negotiate", "close"] as const
export type Stage = (typeof STAGES)[number]

export const toolSchemas = [
  {
    type: "function",
    function: {
      name: "set_stage",
      description: "Update the current sales stage so the live dashboard advances.",
      parameters: {
        type: "object",
        properties: {
          stage: { type: "string", enum: [...STAGES] },
        },
        required: ["stage"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_lead",
      description: "Save what you've learned about the customer. Call as soon as you learn each field.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          phone: { type: "string", description: "Philippine mobile in 09XX format" },
          budget_php: { type: "number" },
          timeline: { type: "string", description: "e.g. 'this month', 'next 2 weeks'" },
          primary_use: { type: "string", description: "e.g. 'family of 5', 'solo commute', 'business hauling'" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "shortlist_cars",
      description: "Record the cars you've recommended to the customer.",
      parameters: {
        type: "object",
        properties: {
          car_ids: { type: "array", items: { type: "string" } },
        },
        required: ["car_ids"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "lookup_car",
      description: "Get full specs, features, known issues, talking points for one car. Use when discussing a specific unit.",
      parameters: {
        type: "object",
        properties: { car_id: { type: "string" } },
        required: ["car_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "book_test_drive",
      description: "Schedule a test drive once the customer has agreed.",
      parameters: {
        type: "object",
        properties: {
          car_id: { type: "string" },
          customer_name: { type: "string" },
          customer_phone: { type: "string" },
          scheduled_iso: { type: "string", description: "ISO 8601 datetime" },
          branch: { type: "string" },
        },
        required: ["car_id", "customer_name", "customer_phone", "scheduled_iso"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "submit_offer",
      description: "Submit the customer's written offer for a car.",
      parameters: {
        type: "object",
        properties: {
          car_id: { type: "string" },
          customer_name: { type: "string" },
          customer_phone: { type: "string" },
          amount_php: { type: "number" },
          notes: { type: "string" },
        },
        required: ["car_id", "customer_name", "customer_phone", "amount_php"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "escalate_to_human",
      description: "Flag this lead for a human callback. Use when the request is outside your knowledge base.",
      parameters: {
        type: "object",
        properties: {
          reason: { type: "string" },
        },
        required: ["reason"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "end_call",
      description: "Call this just before saying goodbye. Provide a 1-2 sentence summary of what was agreed.",
      parameters: {
        type: "object",
        properties: { summary: { type: "string" } },
        required: ["summary"],
      },
    },
  },
] as const

type ToolContext = {
  leadId: string
  channelName: string
}

export async function executeTool(
  name: string,
  args: Record<string, unknown>,
  ctx: ToolContext,
): Promise<{ ok: boolean; data?: unknown; error?: string }> {
  const supabase = createSupabaseAdmin()
  const { leadId } = ctx

  // Always record the tool call as an event for the dashboard.
  await supabase.from("lead_events").insert({
    lead_id: leadId,
    type: `tool:${name}`,
    payload: args,
  })

  try {
    switch (name) {
      case "set_stage": {
        const stage = String(args.stage)
        if (!STAGES.includes(stage as Stage)) {
          return { ok: false, error: `Unknown stage ${stage}` }
        }
        await supabase.from("leads").update({ current_stage: stage }).eq("id", leadId)
        return { ok: true, data: { stage } }
      }

      case "update_lead": {
        const patch: Record<string, unknown> = {}
        if (args.name) patch.customer_name = args.name
        if (args.phone) patch.customer_phone = args.phone
        if (args.budget_php) patch.budget_php = args.budget_php
        if (args.timeline) patch.timeline = args.timeline
        if (args.primary_use) patch.primary_use = args.primary_use
        if (Object.keys(patch).length > 0) {
          await supabase.from("leads").update(patch).eq("id", leadId)
        }
        return { ok: true, data: patch }
      }

      case "shortlist_cars": {
        const ids = (args.car_ids as string[]) ?? []
        const valid = ids.filter((id) => !!findCar(id))
        // Merge with existing cars_discussed.
        const { data: existing } = await supabase
          .from("leads")
          .select("cars_discussed")
          .eq("id", leadId)
          .single()
        const merged = Array.from(new Set([...(existing?.cars_discussed ?? []), ...valid]))
        await supabase.from("leads").update({ cars_discussed: merged }).eq("id", leadId)
        return { ok: true, data: { cars_discussed: merged } }
      }

      case "lookup_car": {
        const car = findCar(String(args.car_id))
        if (!car) return { ok: false, error: "Car not in inventory" }
        // Do NOT expose the floor price to the LLM.
        const { minimum_acceptable_php: _floor, ...safe } = car
        return { ok: true, data: safe }
      }

      case "book_test_drive": {
        const car = findCar(String(args.car_id))
        if (!car) return { ok: false, error: "Car not in inventory" }
        const { data, error } = await supabase
          .from("test_drives")
          .insert({
            lead_id: leadId,
            car_id: String(args.car_id),
            customer_name: String(args.customer_name),
            customer_phone: String(args.customer_phone),
            scheduled_at: String(args.scheduled_iso),
            branch: (args.branch as string) ?? car.location_branch,
          })
          .select("id")
          .single()
        if (error) return { ok: false, error: error.message }
        await supabase
          .from("leads")
          .update({ status: "test_drive_booked", current_stage: "close" })
          .eq("id", leadId)
        return { ok: true, data: { test_drive_id: data?.id, scheduled_at: args.scheduled_iso } }
      }

      case "submit_offer": {
        const car = findCar(String(args.car_id))
        if (!car) return { ok: false, error: "Car not in inventory" }
        const amount = Number(args.amount_php)
        const { data, error } = await supabase
          .from("offers")
          .insert({
            lead_id: leadId,
            car_id: String(args.car_id),
            customer_name: String(args.customer_name),
            customer_phone: String(args.customer_phone),
            amount_php: amount,
            notes: (args.notes as string) ?? null,
          })
          .select("id")
          .single()
        if (error) return { ok: false, error: error.message }
        await supabase
          .from("leads")
          .update({ status: "offer_submitted", current_stage: "close" })
          .eq("id", leadId)
        return { ok: true, data: { offer_id: data?.id, amount_php: amount } }
      }

      case "escalate_to_human": {
        await supabase
          .from("leads")
          .update({ status: "needs_human", summary: String(args.reason) })
          .eq("id", leadId)
        return { ok: true, data: { reason: args.reason } }
      }

      case "end_call": {
        await supabase
          .from("leads")
          .update({ summary: String(args.summary) })
          .eq("id", leadId)
        return { ok: true, data: { summary: args.summary } }
      }

      default:
        return { ok: false, error: `Unknown tool ${name}` }
    }
  } catch (err) {
    console.error("[v0] tool execution error", name, err)
    return { ok: false, error: (err as Error).message }
  }
}

export function lotSize() {
  return loadKnowledgeBase().inventory.length
}
