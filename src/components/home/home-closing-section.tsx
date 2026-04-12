"use client"

import { FadeIn } from "@/components/motion/fade-in"
import { useLanguage } from "@/i18n/language-context"

export function HomeClosingSection() {
  const { m } = useLanguage()

  return (
    <section className="relative overflow-hidden border-t border-border/60 bg-background py-20 sm:py-28">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent"
        aria-hidden
      />
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <FadeIn y={20}>
          <p className="font-heading text-2xl font-medium leading-relaxed text-foreground sm:text-3xl">
            {m.homeClosing.title}
          </p>
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {m.homeClosing.body}
          </p>
        </FadeIn>
      </div>
    </section>
  )
}
