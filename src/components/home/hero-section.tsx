"use client"

import Link from "next/link"
import { useReducedMotion } from "framer-motion"
import Image from "next/image"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/i18n/language-context"
import { siteImages } from "@/data/site-images"
import { trackLeadEvent } from "@/lib/lead-tracking"

type HeroVariant = "ambient" | "split"

export function HeroSection({ variant = "ambient", preview = false }: { variant?: HeroVariant; preview?: boolean }) {
  const { locale, m, hrefForLocale } = useLanguage()
  const reduceMotion = useReducedMotion()
  const split = variant === "split"
  const logo = (className: string) => (
    <Image src="/images/shojuen-logo.png" alt="SHOJUEN MATCHA" width={1536} height={1024} priority className={className} />
  )
  const video = (background = false, className?: string) => (
    <video
      className={cn(background
        ? "absolute inset-0 h-full w-full scale-110 object-cover blur-[48px] brightness-[0.4]"
        : "absolute inset-0 h-full w-full object-contain object-center", className)}
      poster={siteImages.hero}
      autoPlay={!reduceMotion}
      muted loop playsInline preload="metadata" aria-hidden
    >
      <source src={siteImages.heroVideo} type="video/mp4" />
    </video>
  )
  const copy = (
    <div>
        <p className="mb-4 max-w-xl text-xs font-medium uppercase tracking-[0.45em] text-emerald-100/90">
          {m.hero.subtagline}
        </p>
        <h1
          className="font-heading max-w-3xl text-4xl font-medium leading-[1.15] tracking-wide text-white drop-shadow-sm sm:text-5xl md:text-6xl"
        >
          {m.hero.title}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-stone-200/95 sm:text-lg">
          {m.hero.lead}
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            href={hrefForLocale("/wholesale")}
            onClick={() =>
              trackLeadEvent("wholesale_cta_click", {
                location: "home_hero",
                locale,
              })
            }
            className={cn(
              buttonVariants({ size: "lg" }),
              "rounded-full bg-primary px-7 text-primary-foreground shadow-lg shadow-emerald-950/50 no-underline"
            )}
          >
            {m.hero.ctaWholesale}
          </Link>
          <Link
            href={hrefForLocale("/journal")}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "rounded-full border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 no-underline"
            )}
          >
            {m.hero.ctaJournal}
          </Link>
        </div>
    </div>
  )

  return (
    <div className="bg-stone-950">
      {preview && (
        <nav aria-label="ヒーロー比較" className="flex flex-wrap justify-center gap-2 border-b border-white/10 bg-stone-950 px-4 py-2 text-xs text-white">
          <Link href={hrefForLocale("/?hero=ambient")} aria-current={!split ? "page" : undefined} className={cn("rounded-full px-4 py-2", !split ? "bg-white text-stone-950" : "bg-white/10")}>A：ぼかし背景</Link>
          <Link href={hrefForLocale("/?hero=split")} aria-current={split ? "page" : undefined} className={cn("rounded-full px-4 py-2", split ? "bg-white text-stone-950" : "bg-white/10")}>B：左右分割</Link>
        </nav>
      )}
      {split ? (
        <section aria-label="SHOJUEN" className="relative isolate overflow-hidden lg:flex lg:h-[clamp(640px,calc(100svh-120px),880px)]">
          {video(true, "blur-[32px] brightness-[0.6]")}
          <div className="pointer-events-none absolute inset-0 bg-black/55" aria-hidden />
          <div className="relative z-10 flex min-w-0 flex-1 flex-col justify-center px-6 py-10 sm:px-12 lg:px-16 lg:py-8">
            {logo("mb-6 h-auto w-36 self-center sm:w-44 lg:self-start")}
            {copy}
          </div>
          <div className="relative z-10 h-[65svh] w-full lg:aspect-[9/16] lg:h-full lg:w-auto lg:shrink-0">
            {video(false, "object-right")}
          </div>
        </section>
      ) : (
        <>
          <section aria-label="SHOJUEN" className="relative h-[min(calc(100svh-120px),880px)] min-h-80 overflow-hidden bg-stone-950">
            {video(true)}
            {video()}
            <div className="pointer-events-none absolute inset-0 bg-black/15" aria-hidden />
            <div className="absolute inset-0 flex items-center justify-center px-6">
              {logo("h-auto w-[min(65vw,340px)] drop-shadow-xl")}
            </div>
          </section>
          <div className="relative mx-auto w-full max-w-6xl px-6 py-14 sm:px-12 sm:py-20">{copy}</div>
        </>
      )}
    </div>
  )
}
