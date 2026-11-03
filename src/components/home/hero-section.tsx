"use client"

import Link from "next/link"
import { useReducedMotion } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import Image from "next/image"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/i18n/language-context"
import { siteImages } from "@/data/site-images"
import { trackLeadEvent } from "@/lib/lead-tracking"

type HeroVariant = "ambient" | "split"

function HeroVideo({ background, className, reduceMotion, playLabel }: {
  background: boolean; className?: string; reduceMotion: boolean | null; playLabel: string
}) {
  const ref = useRef<HTMLVideoElement>(null)
  const [paused, setPaused] = useState(true)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element || reduceMotion) return
    element.muted = true
    element.play().catch(() => setPaused(true))
  }, [reduceMotion])

  function play() {
    const element = ref.current
    if (!element) return
    if (failed) element.load()
    setFailed(false)
    element.muted = true
    element.play().catch(() => setPaused(true))
  }

  return (
    <>
      <video
        ref={ref}
        className={cn(background
          ? "absolute inset-0 h-full w-full scale-110 object-cover blur-[48px] brightness-[0.4]"
          : "absolute inset-0 h-full w-full object-contain object-center", className)}
        poster={siteImages.hero}
        autoPlay={!reduceMotion}
        muted loop playsInline preload={background ? "metadata" : "auto"}
        aria-hidden={background || undefined}
        onPlaying={() => { setPaused(false); setFailed(false) }}
        onPause={() => setPaused(true)}
        onError={() => { setFailed(true); setPaused(true) }}
      >
        <source src={siteImages.heroVideo} type="video/mp4" />
      </video>
      {!background && paused && (
        <button type="button" onClick={play} className="absolute bottom-5 right-5 z-30 rounded-full border border-white/40 bg-black/60 px-4 py-2 text-xs text-white backdrop-blur-sm">
          <span aria-hidden>▶ </span>{playLabel}
        </button>
      )}
    </>
  )
}

export function HeroSection({ variant = "split", preview = false }: { variant?: HeroVariant; preview?: boolean }) {
  const { locale, m, hrefForLocale } = useLanguage()
  const reduceMotion = useReducedMotion()
  const split = variant === "split"
  const logo = (className: string) => (
    <Image src="/images/shojuen-logo.png" alt="SHOJUEN MATCHA" width={1536} height={1024} priority className={className} />
  )
  const video = (background = false, className?: string) => (
    <HeroVideo background={background} className={className} reduceMotion={reduceMotion}
      playLabel={{ ja: "動画を再生", en: "Play video", zh: "播放影片" }[locale]} />
  )
  const copy = (
    <div>
        <p className="whitespace-nowrap text-[10px] font-medium uppercase leading-relaxed tracking-[0.2em] text-white/85 sm:text-xs">
          MATCHA WHOLESALER, JAPAN
        </p>
        <h1 className="font-heading mt-5 max-w-3xl text-balance text-3xl font-medium leading-snug tracking-tight text-white sm:text-4xl xl:text-5xl">
          小さな店にも、産地の茶をそのまま。
        </h1>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-stone-200 sm:text-base">
          買い付けた茶は、味を見てから小分けしています。小さなお店にも、大口と同じ条件で。
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
        <nav aria-label="ヒーロー比較" className="hidden flex-wrap justify-center gap-2 border-b border-white/10 bg-stone-950 px-4 py-2 text-xs text-white lg:flex">
          <Link href={hrefForLocale("/?hero=ambient")} aria-current={!split ? "page" : undefined} className={cn("rounded-full px-4 py-2", !split ? "bg-white text-stone-950" : "bg-white/10")}>A：ぼかし背景</Link>
          <Link href={hrefForLocale("/?hero=split")} aria-current={split ? "page" : undefined} className={cn("rounded-full px-4 py-2", split ? "bg-white text-stone-950" : "bg-white/10")}>B：左右分割</Link>
        </nav>
      )}
      {split ? (
        <div>
        <section aria-label="SHOJUEN" className="relative isolate overflow-hidden lg:flex lg:h-[clamp(640px,calc(100svh-120px),880px)]">
          <div className="absolute inset-0 hidden lg:block" aria-hidden>
            {video(true, "blur-[32px] brightness-[0.6]")}
            <div className="absolute inset-0 bg-black/55" />
          </div>
          <div className="relative z-10 hidden min-w-0 flex-1 flex-col justify-center px-6 py-10 sm:px-12 lg:flex lg:px-16 lg:py-8">
            {logo("mb-6 h-auto w-36 self-center sm:w-44 lg:self-start")}
            {copy}
          </div>
          <div className="relative z-10 aspect-[9/16] max-h-[calc(100svh-64px)] w-full bg-black lg:h-full lg:max-h-none lg:w-auto lg:shrink-0">
            {video(false, "object-center lg:object-right")}
            <div className="absolute inset-0 flex items-center justify-center px-8 lg:hidden">
              {logo("h-auto w-[min(48vw,210px)] drop-shadow-xl")}
            </div>
          </div>
        </section>
        <div className="px-6 py-10 lg:hidden">{copy}</div>
        </div>
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
