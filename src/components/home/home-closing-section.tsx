"use client"

import Image from "next/image"
import Link from "next/link"

import { FadeIn } from "@/components/motion/fade-in"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/i18n/language-context"

export function HomeClosingSection() {
  const { m, locale, hrefForLocale } = useLanguage()

  return (
    <section className="relative overflow-hidden border-t border-border/60 bg-background py-20 sm:py-28">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent"
        aria-hidden
      />
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <FadeIn y={20} className="text-center lg:text-left">
          <p className="font-heading text-2xl font-medium leading-relaxed text-foreground sm:text-3xl">
            {m.homeClosing.title}
          </p>
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {m.homeClosing.body}
          </p>
          <p className="mt-8 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {m.homeClosing.contactLine}
          </p>
          <div className="mt-6 flex justify-center lg:justify-start">
            <Link
              href={hrefForLocale("/contact")}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "rounded-full border-primary/30 no-underline"
              )}
            >
              {m.homeClosing.contactCta}
            </Link>
          </div>
        </FadeIn>
        <FadeIn delay={0.08}>
          <div className="relative aspect-[2/3] max-h-[640px] overflow-hidden rounded-2xl bg-muted">
            <Image src="/images/matcha-swatch-deep.jpg" alt={{ ja: "和紙の上に広げた深緑色の抹茶粉", en: "Deep green matcha powder spread across textured paper", zh: "鋪在和紙上的深綠色抹茶粉" }[locale]} fill sizes="(min-width: 1024px) 42vw, 100vw" className="object-cover" />
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
