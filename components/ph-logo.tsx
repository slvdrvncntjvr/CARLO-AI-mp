export function PHLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <span className="font-mono text-sm font-bold tracking-tighter">PH</span>
        <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary ring-2 ring-charcoal" />
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-[15px] font-bold tracking-tight">Pearson Hardman</span>
        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Motors
        </span>
      </div>
    </div>
  )
}
