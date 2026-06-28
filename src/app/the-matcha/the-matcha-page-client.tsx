"use client"

import Image from "next/image"

import { MatchaEncyclopediaCh0 } from "@/components/the-matcha/matcha-encyclopedia-ch0"
import { FadeIn } from "@/components/motion/fade-in"
import { useLanguage } from "@/i18n/language-context"
import { siteImages } from "@/data/site-images"

export function TheMatchaPageClient() {
  const { m } = useLanguage()

  return (
    <div className="bg-background">
      <div className="border-b border-border/70 bg-gradient-to-b from-emerald-950/10 via-emerald-950/[0.04] to-background">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <FadeIn>
            <p className="text-xs font-medium uppercase tracking-[0.45em] text-primary">
              {m.theMatchaPage.heroKicker}
            </p>
            <h1 className="font-heading mt-4 text-4xl font-medium tracking-wide text-foreground sm:text-5xl">
              {m.theMatchaPage.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {m.theMatchaPage.introBefore}
              <strong className="font-medium text-foreground">
                {m.theMatchaPage.introStrong}
              </strong>
              {m.theMatchaPage.introAfter}
            </p>
          </FadeIn>
          <FadeIn className="mt-10" delay={0.08}>
            <div className="relative aspect-[2.1/1] max-h-[min(48vh,400px)] w-full overflow-hidden rounded-2xl border border-primary/20 shadow-md ring-1 ring-primary/10">
              <Image
                src={siteImages.matchaCatalogBanner}
                alt={m.theMatchaPage.imageAlt}
                fill
                sizes="(min-width: 1024px) 72rem, 100vw"
                className="object-cover object-[50%_35%]"
                priority
              />
            </div>
          </FadeIn>
        </div>
      </div>

      <MatchaEncyclopediaCh0 />
    </div>
  )
}
