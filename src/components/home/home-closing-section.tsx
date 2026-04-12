"use client"

import Link from "next/link"

import { FadeIn } from "@/components/motion/fade-in"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
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
          <p className="mt-8 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {m.homeClosing.contactLine}
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              href="/contact"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "rounded-full border-primary/30 no-underline"
              )}
            >
              {m.homeClosing.contactCta}
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
