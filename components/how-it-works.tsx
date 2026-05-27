import { Search, AudioLines, Handshake } from "lucide-react"

const steps = [
  {
    n: "01",
    icon: Search,
    title: "Browse Our Inventory",
    body:
      "Explore our available units below and find a car that fits your needs and budget. All listings are real, in stock, and verified.",
  },
  {
    n: "02",
    icon: AudioLines,
    title: "Call CARLO",
    body:
      "Tap the call button on any listing. CARLO answers instantly, confirms availability, and answers all your questions in real time.",
  },
  {
    n: "03",
    icon: Handshake,
    title: "Negotiate. Get the Deal.",
    body:
      "CARLO negotiates on our behalf live on the call. When you're ready, CARLO captures your details and we follow up to close.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative bg-background py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            How it works
          </p>
          <h2 className="mt-3 text-balance text-4xl font-bold tracking-tight md:text-5xl">
            Three steps to your next car.
          </h2>
          <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
            No forms. No waiting. Just a phone call with the smartest car salesman in the Philippines.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3 md:gap-8">
          {steps.map((s) => (
            <div
              key={s.n}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-7 transition hover:border-primary/40"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold tracking-widest text-muted-foreground">
                  {s.n}
                </span>
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/12 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                  <s.icon className="h-5 w-5" strokeWidth={2} />
                </div>
              </div>
              <h3 className="mt-8 text-xl font-bold tracking-tight">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              <span
                className="absolute -bottom-px left-7 right-7 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition group-hover:opacity-100"
                aria-hidden="true"
              />
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Powered by Agora Conversational AI — real-time voice, sub-second latency
          </div>
        </div>
      </div>
    </section>
  )
}
