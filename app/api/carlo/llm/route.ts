/**
 * Carlo's "custom LLM" endpoint that Agora's Conversational AI Engine calls
 * as if it were an OpenAI chat completions endpoint.
 *
 * Flow:
 *   Agora → POST /api/carlo/llm  (OpenAI-style chat.completions request)
 *   ↳ we forward to Groq (Llama 3.3 70B, free)
 *   ↳ if the model returns tool_calls, we execute them against Supabase
 *     and loop until the model emits final text.
 *   ↳ we return the final OpenAI-format response back to Agora, which TTS-es it.
 */
import { NextResponse } from "next/server"
import { executeTool, toolSchemas } from "@/lib/carlo/tools"

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
const MODEL = "llama-3.3-70b-versatile"
const MAX_TOOL_LOOPS = 4

type ChatMessage = {
  role: "system" | "user" | "assistant" | "tool"
  content?: string | null
  tool_calls?: Array<{
    id: string
    type: "function"
    function: { name: string; arguments: string }
  }>
  tool_call_id?: string
  name?: string
}

export async function POST(req: Request) {
  try {
    const incoming = await req.json()
    const messages: ChatMessage[] = incoming.messages ?? []
    const params = incoming as Record<string, unknown>

    // Agora passes our custom params through `params` on the original request,
    // but in the OpenAI-style call they appear as top-level extras. We also
    // tolerate them inside system messages as `lead_id=...` tokens.
    let leadId: string | undefined =
      (params.lead_id as string | undefined) ||
      extractFromSystem(messages, /lead_id=([0-9a-f-]+)/i)
    let channelName: string | undefined =
      (params.channel_name as string | undefined) ||
      extractFromSystem(messages, /channel=([\w-]+)/i)

    if (!leadId || !channelName) {
      console.warn("[v0] llm proxy missing lead/channel context", { leadId, channelName })
    }

    const groqKey = process.env.GROQ_API_KEY
    if (!groqKey) {
      return NextResponse.json({ error: "GROQ_API_KEY missing" }, { status: 500 })
    }

    const ctx = { leadId: leadId ?? "unknown", channelName: channelName ?? "unknown" }
    const conv: ChatMessage[] = [...messages]

    let final: ChatMessage | undefined
    for (let loop = 0; loop < MAX_TOOL_LOOPS; loop++) {
      const groqRes = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: conv,
          tools: toolSchemas,
          tool_choice: "auto",
          temperature: 0.6,
          max_tokens: 400,
        }),
      })

      if (!groqRes.ok) {
        const errText = await groqRes.text()
        console.error("[v0] groq error", groqRes.status, errText)
        return NextResponse.json(
          {
            id: "carlo-error",
            object: "chat.completion",
            choices: [
              {
                index: 0,
                message: {
                  role: "assistant",
                  content: "I'm having a small connection issue — let me try that again.",
                },
                finish_reason: "stop",
              },
            ],
          },
          { status: 200 },
        )
      }

      const groqJson = await groqRes.json()
      const choice = groqJson.choices?.[0]
      const msg: ChatMessage = choice?.message ?? { role: "assistant", content: "" }

      if (msg.tool_calls && msg.tool_calls.length > 0) {
        // Append the assistant's tool-call message, then execute each tool and
        // append a "tool" role message with the result.
        conv.push(msg)
        for (const call of msg.tool_calls) {
          let parsed: Record<string, unknown> = {}
          try {
            parsed = JSON.parse(call.function.arguments || "{}")
          } catch {
            parsed = {}
          }
          const result = await executeTool(call.function.name, parsed, ctx)
          conv.push({
            role: "tool",
            tool_call_id: call.id,
            name: call.function.name,
            content: JSON.stringify(result),
          })
        }
        // Loop again so the model can incorporate the tool results.
        continue
      }

      final = msg
      break
    }

    if (!final) {
      final = {
        role: "assistant",
        content: "Let me check on that and get right back to you.",
      }
    }

    // Return a minimal OpenAI-shaped response.
    return NextResponse.json({
      id: `carlo-${Date.now()}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: MODEL,
      choices: [
        {
          index: 0,
          message: { role: "assistant", content: final.content ?? "" },
          finish_reason: "stop",
        },
      ],
    })
  } catch (err) {
    console.error("[v0] /api/carlo/llm error", err)
    return NextResponse.json(
      {
        id: "carlo-error",
        object: "chat.completion",
        choices: [
          {
            index: 0,
            message: { role: "assistant", content: "I lost you for a second — can you say that again?" },
            finish_reason: "stop",
          },
        ],
      },
      { status: 200 },
    )
  }
}

function extractFromSystem(messages: ChatMessage[], re: RegExp): string | undefined {
  for (const m of messages) {
    if (m.role !== "system" || typeof m.content !== "string") continue
    const match = m.content.match(re)
    if (match) return match[1]
  }
  return undefined
}
