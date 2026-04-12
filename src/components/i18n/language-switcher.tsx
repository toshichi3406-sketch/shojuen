"use client"

import { useLanguage } from "@/i18n/language-context"
import type { Locale } from "@/i18n/types"
import { cn } from "@/lib/utils"

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, m } = useLanguage()

  return (
    <label
      className={cn(
        "flex items-center gap-2 text-sm text-muted-foreground",
        className
      )}
    >
      <span className="sr-only md:not-sr-only md:whitespace-nowrap">
        {m.languageSwitcher.label}
      </span>
      <select
        aria-label={m.languageSwitcher.label}
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        className="h-9 min-w-[7.5rem] rounded-md border border-border/80 bg-background px-2 text-sm text-foreground shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="ja">{m.languageSwitcher.ja}</option>
        <option value="en">{m.languageSwitcher.en}</option>
      </select>
    </label>
  )
}
