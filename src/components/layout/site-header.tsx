"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MenuIcon } from "lucide-react"

import { mainNav } from "@/data/navigation"
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
  name: "松樹園",
  subtitle: "Matcha Journal",
}

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="group flex flex-col gap-0 leading-none">
          <span className="font-heading text-lg tracking-wide text-foreground transition-colors group-hover:text-primary">
            {brand.name}
          </span>
          <span className="text-[0.65rem] font-medium uppercase tracking-[0.35em] text-muted-foreground">
            {brand.subtitle}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="メイン">
          {mainNav.map((item) => {
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
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center md:hidden">
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="メニューを開く">
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
              <nav className="flex flex-col gap-1" aria-label="モバイルメイン">
                {mainNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-lg px-3 py-3 text-base text-foreground hover:bg-muted"
                  >
                    <span className="block font-medium">{item.label}</span>
                    {item.description ? (
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    ) : null}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
