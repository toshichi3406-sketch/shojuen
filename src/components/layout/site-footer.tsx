"use client"

import Link from "next/link"
import { LeafIcon } from "lucide-react"

import { mainNav } from "@/data/navigation"
import { useLanguage } from "@/i18n/language-context"

export function SiteFooter() {
  const { m } = useLanguage()

  return (
    <footer className="border-t border-border/80 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm space-y-3">
            <div className="flex items-center gap-2 font-heading text-lg text-foreground">
              <LeafIcon className="size-5 text-primary" aria-hidden />
              松壽園SHOJUEN
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {m.footer.blurb}
            </p>
          </div>
          <nav
            className="grid grid-cols-2 gap-x-10 gap-y-2 sm:grid-cols-3"
            aria-label={m.footer.aria}
          >
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {m.navItems[item.key].label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="mt-12 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} 松壽園SHOJUEN{m.footer.rightsSuffix}
        </p>
      </div>
    </footer>
  )
}
