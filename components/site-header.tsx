"use client"

import Link from "next/link"
import { PHLogo } from "@/components/ph-logo"

export function SiteHeader({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const isDark = variant === "dark"
  const linkBase = isDark ? "text-white/70 hover:text-white" : "text-foreground/70 hover:text-foreground"

  return (
    <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 pt-6">
      <Link href="/" aria-label="Pearson Hardman Motors home">
        <PHLogo className={isDark ? "text-white" : "text-foreground"} />
      </Link>
      <nav className={`hidden items-center gap-8 text-sm md:flex ${linkBase}`}>
        <Link href="/inventory" className="hover:opacity-100">
          Inventory
        </Link>
        <Link href="/#how-it-works" className="hover:opacity-100">
          How CARLO works
        </Link>
        <Link href="/#demo" className="hover:opacity-100">
          Try CARLO
        </Link>
      </nav>
      <Link
        href="/inventory"
        className={
          isDark
            ? "rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            : "rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background hover:bg-foreground/90"
        }
      >
        Browse Inventory
      </Link>
    </header>
  )
}
