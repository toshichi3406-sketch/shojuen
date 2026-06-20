"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MenuIcon } from "lucide-react"

import { LanguageSwitcher } from "@/components/i18n/language-switcher"
import { mainNav } from "@/data/navigation"
import { useLanguage } from "@/i18n/language-context"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const brand = {
  name: "松壽園SHOJUEN",
  subtitle: "Matcha Journal",
}

export function SiteHeader() {
  const pathname = usePathname()
  const { m } = useLanguage()

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="group flex min-w-0 flex-col gap-0 leading-none">
          <span className="font-heading text-lg tracking-wide text-foreground transition-colors group-hover:text-primary">
            {brand.name}
          </span>
          <span className="text-[0.65rem] font-medium uppercase tracking-[0.35em] text-muted-foreground">
            {brand.subtitle}
          </span>
        </Link>

        <div className="flex flex-1 items-center justify-end gap-2 md:gap-3">
          <LanguageSwitcher className="shrink-0" />

          <nav className="hidden items-center gap-1 md:flex" aria-label={m.nav.ariaMain}>
            {mainNav.map((item) => {
              const itemMsg = m.navItems[item.key]

              if (item.comingSoon) {
                return (
                  <div key={item.href} className="group relative">
                    <span
                      aria-disabled="true"
                      className="flex cursor-not-allowed select-none items-center gap-1 rounded-lg px-3 py-2 text-sm text-muted-foreground/55"
                    >
                      {itemMsg.label}
                    </span>
                    <span
                      role="tooltip"
                      className="pointer-events-none absolute left-1/2 top-full z-50 mt-1 -translate-x-1/2 whitespace-nowrap rounded-md border border-border/70 bg-popover px-2.5 py-1 text-xs font-medium text-popover-foreground opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100"
                    >
                      {m.nav.comingSoon}
                    </span>
                  </div>
                )
              }

              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {itemMsg.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center md:hidden">
            <Sheet>
              <SheetTrigger
                render={
                  <Button variant="ghost" size="icon" aria-label={m.nav.openMenu}>
                    <MenuIcon className="size-5" />
                  </Button>
                }
              />
              <SheetContent side="right" className="gap-6">
                <SheetHeader>
                  <SheetTitle className="font-heading text-left">
                    {brand.name}
                  </SheetTitle>
                </SheetHeader>
                <div className="px-2 pb-4">
                  <LanguageSwitcher />
                </div>
                <nav className="flex flex-col gap-1" aria-label={m.nav.ariaMobile}>
                  {mainNav.map((item) => {
                    const itemMsg = m.navItems[item.key]

                    if (item.comingSoon) {
                      return (
                        <div
                          key={item.href}
                          aria-disabled="true"
                          className="cursor-not-allowed select-none rounded-lg px-3 py-3 text-base opacity-60"
                        >
                          <span className="flex items-center gap-2 font-medium text-foreground">
                            {itemMsg.label}
                            <span className="rounded-full border border-border/70 px-2 py-0.5 text-[0.65rem] font-normal uppercase tracking-wide text-muted-foreground">
                              {m.nav.comingSoon}
                            </span>
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {itemMsg.description}
                          </span>
                        </div>
                      )
                    }

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="rounded-lg px-3 py-3 text-base text-foreground hover:bg-muted"
                      >
                        <span className="block font-medium">{itemMsg.label}</span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {itemMsg.description}
                        </span>
                      </Link>
                    )
                  })}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
