import Link from "next/link"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { formatPHP } from "@/lib/inventory"

export const dynamic = "force-dynamic"

type LeadRow = {
  id: string
  created_at: string
  customer_name: string | null
  customer_phone: string | null
  budget_php: number | null
  timeline: string | null
  cars_discussed: string[] | null
  current_stage: string
  status: string
  summary: string | null
}

const STATUS_STYLES: Record<string, string> = {
  open: "bg-white/10 text-white/80",
  test_drive_booked: "bg-primary/20 text-primary",
  offer_submitted: "bg-amber-500/20 text-amber-300",
  needs_human: "bg-rose-500/20 text-rose-300",
  lost: "bg-white/5 text-white/40",
}

export default async function AdminLeadsPage() {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("leads")
    .select(
      "id, created_at, customer_name, customer_phone, budget_php, timeline, cars_discussed, current_stage, status, summary",
    )
    .order("created_at", { ascending: false })
    .limit(100)

  const leads = (data ?? []) as LeadRow[]

  return (
    <main className="min-h-screen bg-ink text-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <header className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Pearson Hardman Motors · Sales Console
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">CARLO Leads</h1>
            <p className="mt-1 text-sm text-white/60">
              Every conversation CARLO has shows up here in real time.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-full border border-white/15 px-4 py-2 text-xs font-medium text-white/80 transition hover:bg-white/5"
          >
            Back to site
          </Link>
        </header>

        {error && (
          <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            Failed to load leads: {error.message}
          </div>
        )}

        {leads.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
            <p className="text-sm font-medium text-white/80">No calls yet</p>
            <p className="mt-1 text-xs text-white/50">
              Start a conversation with CARLO from the customer site and it will appear here instantly.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.03] text-[11px] font-semibold uppercase tracking-wider text-white/50">
                <tr>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Budget</th>
                  <th className="px-5 py-3">Timeline</th>
                  <th className="px-5 py-3">Cars</th>
                  <th className="px-5 py-3">Stage</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="transition hover:bg-white/[0.04]"
                  >
                    <td className="px-5 py-4">
                      <Link href={`/admin/leads/${lead.id}`} className="block">
                        <p className="font-medium text-white">
                          {lead.customer_name ?? "Unknown caller"}
                        </p>
                        <p className="text-xs text-white/50">
                          {lead.customer_phone ?? "no number captured"}
                        </p>
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-white/80">
                      {lead.budget_php ? formatPHP(lead.budget_php) : "—"}
                    </td>
                    <td className="px-5 py-4 text-white/80">{lead.timeline ?? "—"}</td>
                    <td className="px-5 py-4 text-white/80">
                      {lead.cars_discussed && lead.cars_discussed.length > 0 ? (
                        <span className="font-mono text-xs">
                          {lead.cars_discussed.slice(0, 2).join(", ")}
                          {lead.cars_discussed.length > 2 ? ` +${lead.cars_discussed.length - 2}` : ""}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/80">
                        {lead.current_stage}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${STATUS_STYLES[lead.status] ?? "bg-white/10 text-white/70"}`}
                      >
                        {lead.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-white/50">
                      {new Date(lead.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
