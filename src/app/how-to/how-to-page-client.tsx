"use client"

import Image from "next/image"
import Link from "next/link"

import { FadeIn, FadeInStagger, FadeInItem } from "@/components/motion/fade-in"
import { buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/i18n/language-context"
import { siteImages } from "@/data/site-images"

export function HowToPageClient() {
  const { m } = useLanguage()
  const blocks = m.howToPage.blocks

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <FadeIn>
        <div className="relative mb-10 aspect-[2/1] w-full overflow-hidden rounded-2xl border border-primary/20 shadow-sm ring-1 ring-primary/10">
          <Image
            src={siteImages.howToHero}
            alt={m.howToPage.imageAlt}
            fill
            sizes="(min-width: 768px) 48rem, 100vw"
            className="object-cover object-[50%_72%]"
            priority
          />
        </div>
        <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
          {m.howToPage.kicker}
        </p>
        <h1 className="font-heading mt-4 text-4xl font-medium text-foreground">
          {m.howToPage.title}
        </h1>
        <p className="mt-6 leading-relaxed text-muted-foreground">
          {m.howToPage.introBefore}
          <strong className="font-medium text-foreground">
            {m.howToPage.introStrong}
          </strong>
          {m.howToPage.introAfter}
        </p>
      </FadeIn>

      <FadeInStagger className="mt-14 space-y-12">
        {blocks.map((block) => (
          <FadeInItem key={block.title}>
            <section>
              <h2 className="font-heading text-2xl font-medium text-foreground">
                {block.title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{block.subtitle}</p>
              <Separator className="my-6" />
              <dl className="space-y-5">
                {block.items.map((row) => (
                  <div key={row.label}>
                    <dt className="text-xs font-medium uppercase tracking-wider text-primary">
                      {row.label}
                    </dt>
                    <dd className="mt-1.5 text-sm leading-relaxed text-foreground/90">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          </FadeInItem>
        ))}
      </FadeInStagger>

      <FadeIn className="mt-14 rounded-2xl border border-border/80 bg-muted/30 p-6 sm:p-8">
        <h2 className="font-heading text-lg font-medium text-foreground">
          {m.howToPage.modernTitle}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {m.howToPage.modernBodyBefore}
          <strong className="font-medium text-foreground">
            {m.howToPage.modernBodyStrong}
          </strong>
          {m.howToPage.modernBodyAfter}
        </p>
      </FadeIn>

      <Link
        href="/"
        className={cn(
          buttonVariants({ variant: "outline" }),
          "mt-10 inline-flex rounded-full"
        )}
      >
        {m.howToPage.backHome}
      </Link>
    </div>
  )
}
