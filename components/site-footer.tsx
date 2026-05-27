import { PHLogo } from "@/components/ph-logo"
import { Github, Twitter, Linkedin } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background py-14">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-start justify-between gap-10 md:flex-row md:items-center">
          <div className="max-w-md">
            <PHLogo />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Pearson Hardman Motors — Powered by Agora WorkFlow PH
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-sm sm:grid-cols-3">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Site
              </p>
              <ul className="space-y-2">
                <li>
                  <a href="#how-it-works" className="hover:text-primary">
                    How it works
                  </a>
                </li>
                <li>
                  <a href="#inventory" className="hover:text-primary">
                    Inventory
                  </a>
                </li>
                <li>
                  <a href="#demo" className="hover:text-primary">
                    Try CARLO
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Follow
              </p>
              <div className="flex items-center gap-3">
                <a
                  href="#"
                  aria-label="Twitter"
                  className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground transition hover:border-primary hover:text-primary"
                >
                  <Twitter className="h-4 w-4" />
                </a>
                <a
                  href="#"
                  aria-label="GitHub"
                  className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground transition hover:border-primary hover:text-primary"
                >
                  <Github className="h-4 w-4" />
                </a>
                <a
                  href="#"
                  aria-label="LinkedIn"
                  className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground transition hover:border-primary hover:text-primary"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
