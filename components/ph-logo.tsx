export function PHLogo({
  className = "",
  variant = "light",
}: {
  className?: string
  variant?: "light" | "dark"
}) {
  const isDark = variant === "dark"
  const wordColor = isDark ? "text-white" : "text-foreground"
  const subColor = isDark ? "text-white/50" : "text-muted-foreground"
  const ruleColor = isDark ? "bg-white/15" : "bg-foreground/15"

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-baseline gap-2 leading-none">
        <span className={`font-serif text-[22px] font-semibold tracking-tight ${wordColor}`}>
          Pearson
        </span>
        <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-primary" />
        <span className={`font-serif text-[22px] font-semibold tracking-tight ${wordColor}`}>
          Hardman
        </span>
      </div>
      <span className={`hidden h-6 w-px ${ruleColor} sm:inline-block`} aria-hidden="true" />
      <div className="hidden flex-col leading-none sm:flex">
        <span className={`text-[10px] font-semibold uppercase tracking-[0.28em] ${subColor}`}>
          Motors
        </span>
        <span className={`mt-0.5 text-[9px] font-medium uppercase tracking-[0.2em] ${subColor}`}>
          Est. Manila
        </span>
      </div>
    </div>
  )
}
