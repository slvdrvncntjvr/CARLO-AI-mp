import Link from "next/link"
import { notFound } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { formatPHP } from "@/lib/inventory"
import { findCar } from "@/lib/carlo/kb"

export const dynamic = "force-dynamic"

type Lead = {
  id: string
  created_at: string
  customer_name: string | null
  customer_phone: string | null
  budget_php: number | null
  timeline: string | null
  primary_use: string | null
  cars_discussed: string[] | null
  current_stage: string
  status: string
  summary: string | null
  transcript: Array<{ who: string; text: string; ts?: number }> | null
}

type Event = {
  id: string
  created_at: string
  type: string
  payload: Record<string, unknown> | null
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  const [{ data: lead }, { data: events }, { data: drives }, { data: offers }] = await Promise.all([
    supabase.from("leads").select("*").eq("id", id).single(),
    supabase
      .from("lead_events")
      .select("id, created_at, type, payload")
      .eq("lead_id", id)
      .order("created_at", { ascending: true }),
    supabase.from("test_drives").select("*").eq("lead_id", id),
    supabase.from("offers").select("*").eq("lead_id", id),
  ])

  if (!lead) notFound()
  const l = lead as Lead
  const ev = (events ?? []) as Event[]

  return (
    <main className="min-h-screen bg-ink text-white">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <Link
          href="/admin/leads"
          className="text-xs font-medium uppercase tracking-wider text-white/60 hover:text-white"
        >
          ← All leads
        </Link>

        <header className="mt-4 flex items-end justify-between border-b border-white/10 pb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {l.customer_name ?? "Unknown caller"}
            </h1>
            <p className="mt-1 text-sm text-white/60">
              {l.customer_phone ?? "no phone"} · captured{" "}
              {new Date(l.created_at).toLocaleString()}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="rounded-full bg-primary/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
              {l.status.replace(/_/g, " ")}
            </span>
            <span className="text-xs text-white/50">stage: {l.current_stage}</span>
          </div>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <Stat label="Budget" value={l.budget_php ? formatPHP(l.budget_php) : "—"} />
          <Stat label="Timeline" value={l.timeline ?? "—"} />
          <Stat label="Primary use" value={l.primary_use ?? "—"} />
        </section>

        {l.summary && (
          <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
              Call summary
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/85">{l.summary}</p>
          </section>
        )}

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
              Cars discussed
            </h2>
            <div className="space-y-2">
              {(l.cars_discussed ?? []).length === 0 && (
                <p className="text-sm text-white/40">No cars logged yet.</p>
              )}
              {(l.cars_discussed ?? []).map((cid) => {
                const c = findCar(cid)
                return (
                  <div
                    key={cid}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {c
                          ? `${c.year} ${c.make} ${c.model} ${c.variant}`
                          : cid}
                      </p>
                      <p className="text-xs text-white/50">
                        {c ? `${c.location_branch} · ${formatPHP(c.price_php)}` : ""}
                      </p>
                    </div>
                    <span className="font-mono text-[10px] text-white/40">{cid}</span>
                  </div>
                )
              })}
            </div>

            {(drives?.length ?? 0) > 0 && (
              <>
                <h2 className="mb-3 mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                  Test drives booked
                </h2>
                <div className="space-y-2">
                  {drives!.map((d: any) => (
                    <div key={d.id} className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm">
                      {new Date(d.scheduled_at).toLocaleString()} · {d.car_id} · {d.branch}
                    </div>
                  ))}
                </div>
              </>
            )}

            {(offers?.length ?? 0) > 0 && (
              <>
                <h2 className="mb-3 mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                  Offers submitted
                </h2>
                <div className="space-y-2">
                  {offers!.map((o: any) => (
                    <div key={o.id} className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
                      {formatPHP(o.amount_php)} on {o.car_id}
                      {o.notes ? <p className="mt-1 text-xs text-white/60">{o.notes}</p> : null}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
              Tool calls & events
            </h2>
            <ol className="space-y-2">
              {ev.length === 0 && (
                <p className="text-sm text-white/40">No events recorded.</p>
              )}
              {ev.map((e) => (
                <li
                  key={e.id}
                  className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-semibold text-primary">{e.type}</span>
                    <span className="text-white/40">
                      {new Date(e.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  {e.payload && Object.keys(e.payload).length > 0 && (
                    <pre className="mt-2 overflow-x-auto text-[11px] leading-relaxed text-white/70">
                      {JSON.stringify(e.payload, null, 2)}
                    </pre>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {l.transcript && l.transcript.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
              Transcript
            </h2>
            <div className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              {l.transcript.map((line, i) => (
                <div
                  key={i}
                  className={`flex ${line.who === "you" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                      line.who === "carlo"
                        ? "bg-white/10 text-white"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {line.text}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">{label}</p>
      <p className="mt-1.5 text-base font-medium text-white">{value}</p>
    </div>
  )
}
