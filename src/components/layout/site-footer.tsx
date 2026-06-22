"use client"

import Link from "next/link"
import { LeafIcon } from "lucide-react"

import { mainNav } from "@/data/navigation"
import { getContactEmail } from "@/data/site-contact"
import { useLanguage } from "@/i18n/language-context"

export function SiteFooter() {
  const { m } = useLanguage()
  const email = getContactEmail()

  return (
    <footer className="border-t border-border/80 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm space-y-4">
            <div className="flex items-center gap-2 font-heading text-lg text-foreground">
              <LeafIcon className="size-5 text-primary" aria-hidden />
              松壽園（SHOJUEN）
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {m.footer.blurb}
            </p>
            <p className="text-sm">
              <a
                href={`mailto:${email}`}
                className="font-mono text-foreground underline-offset-4 hover:underline"
              >
                {email}
              </a>
            </p>
          </div>
          <nav
            className="grid grid-cols-2 gap-x-10 gap-y-2 sm:grid-cols-3"
            aria-label={m.footer.aria}
          >
            {mainNav.map((item) =>
              item.comingSoon ? (
                <span
                  key={item.href}
                  aria-disabled="true"
                  className="flex cursor-not-allowed select-none items-center gap-1.5 text-sm text-muted-foreground/55"
                >
                  {m.navItems[item.key].label}
                  <span className="text-[0.65rem] uppercase tracking-wide text-muted-foreground/70">
                    （{m.nav.comingSoon}）
                  </span>
                </span>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {m.navItems[item.key].label}
                </Link>
              )
            )}
          </nav>
        </div>
        <p className="mt-12 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} 松壽園（SHOJUEN）{m.footer.rightsSuffix}
        </p>
      </div>
    </footer>
  )
}
