"use client"

import Link from "next/link"

import { FadeIn } from "@/components/motion/fade-in"
import { buttonVariants } from "@/components/ui/button"
import { getContactEmail } from "@/data/site-contact"
import { useLanguage } from "@/i18n/language-context"
import { cn } from "@/lib/utils"

export function WholesaleBanner() {
  const { m } = useLanguage()
  const email = getContactEmail()

  return (
    <section className="border-b border-border/70 bg-primary/[0.04]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
        <FadeIn>
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
            {m.wholesaleBanner.kicker}
          </p>
          <p className="mt-4 max-w-4xl text-base leading-relaxed text-foreground sm:text-lg">
            {m.wholesaleBanner.body}
          </p>
          <p className="mt-3 max-w-4xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {m.wholesaleBanner.lines}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            {m.wholesaleBanner.replyNote}{" "}
            <a
              href={`mailto:${email}`}
              className="font-mono text-foreground underline-offset-4 hover:underline"
            >
              {email}
            </a>
          </p>
          <div className="mt-8">
            <Link
              href="/contact"
              className={cn(
                buttonVariants({ size: "lg" }),
                "rounded-full no-underline"
              )}
            >
              {m.wholesaleBanner.cta}
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
