# CARLO: AI Voice Sales Agent for Used-Car Dealerships

**The Problem**
Filipino used-car buyers face opaque pricing, limited after-hours support, and slow negotiations. Dealerships lose leads to friction.

**The Solution**
CARLO is a voice-first AI sales agent that sits inside your dealership's website. Customers browse inventory, click a car, and talk to CARLO instantly — he knows every unit's specs, can negotiate within your floor price, books test drives, and captures qualified leads. Available 24/7, no human needed until the sale is ready.

## Key Stats

- **20 units** in inventory across 5 body types (sedans, SUVs, pickups, MPVs, hatchbacks)
- **4 sales stages** visible in real-time UI: Qualify → Recommend → Negotiate → Close
- **100% free** to operate (Agora free tier covers 300 min/mo; Groq, ElevenLabs, Supabase all free)
- **Leads captured** with full transcript, tool-call timeline, and structured data (customer, budget, timeline, cars discussed, offers submitted)

## The Tech

**Frontend** — Next.js 16 (App Router), Tailwind CSS, Shadcn/ui  
**Voice Pipeline** — Agora Conversational AI Engine (STT + agent orchestration) + Groq Llama 3.3 70B (LLM) + ElevenLabs (TTS)  
**Data** — Supabase (Postgres; leads, test_drives, offers tables) + Vercel Blob (deployment)  
**Knowledge Base** — Grounded in 20-car inventory with full specs, pricing, service history, and anti-hallucination rules  

## How It Works

1. **Browse** — Customer sees the lot: 20 cars with photos, prices, body type, mileage
2. **Call** — Click "Talk to CARLO" on any car → Agora RTC channel opens, CARLO greets them grounded in that exact car's KB
3. **Qualify** — CARLO asks budget, timeline, family size, primary use → system prompt adjusts recommendations
4. **Recommend** — CARLO suggests 2–3 other units from inventory that match
5. **Negotiate** — Customer likes a price → CARLO negotiates within dealership floor (PHP 10-50k margin per unit)
6. **Close** — Test drive booked or written offer submitted → lead persists to Supabase with full transcript
7. **Admin** — `/admin/leads` dashboard shows all leads (realtime), transcript, tool calls, status. One-click export or send to dealer.

## Demo Flow

```
1. Home page → hero + lot composition stats (20 units, price range, body-type breakdown)
2. /inventory → full grid, search, filters, "Ask CARLO" button on each car
3. Click "Ask CARLO" → real voice call (5 min scripted demo)
   - CARLO greets customer about a specific car
   - Customer asks questions (handled via KB + tools)
   - CARLO recommends alternatives
   - Books test drive OR submits offer
   - Hangs up
4. /admin/leads → new lead appears, full transcript visible, tool timeline shows every decision
```

## Deploy & Play

```bash
git clone <this-repo>
pnpm install
# Add env vars (Agora, Groq, ElevenLabs, Supabase) to .env.local
pnpm dev
# Visit http://localhost:3000 → click a car → talk to CARLO
```

## Judging Alignment

✅ **Sales Use Case Fit (20%)** — Full 5-stage sales workflow visible in UI stepper  
✅ **Core Workflow Completion (25%)** — Qualify → Recommend → Negotiate → Close, all tool-driven  
✅ **Data Capture & Handoff (15%)** — Supabase schema + `/admin/leads` with transcripts & events  
✅ **Demo Video (20%)** — Tight 3-min script: problem → solution → unbroken call → lead dashboard  
✅ **Technical Execution (20%)** — Agora orchestration, KB grounding (no hallucination), tool calling, RLS, RTC

---

Built for **Agora Hackathon 2026** by Team Pearson Hardman.
