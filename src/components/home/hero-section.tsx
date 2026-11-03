"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { ArrowDownIcon } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/i18n/language-context"
import { siteImages } from "@/data/site-images"
import { trackLeadEvent } from "@/lib/lead-tracking"

export function HeroSection() {
  const { locale, m, hrefForLocale } = useLanguage()
  const reduceMotion = useReducedMotion()

  return (
    <div className="bg-stone-950">
      <section
        aria-label="SHOJUEN"
        className="relative h-[min(92svh,880px)] overflow-hidden bg-black"
      >
          {/* Muted, looping in-house footage. `playsInline` keeps iOS Safari
              from taking it full screen; `autoPlay` is dropped when the
              viewer asks for reduced motion, leaving the poster frame. */}
          <video
            className="absolute inset-0 h-full w-full object-contain object-center"
            poster={siteImages.hero}
            autoPlay={!reduceMotion}
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden
          >
            <source src={siteImages.heroVideo} type="video/mp4" />
          </video>
        <div className="pointer-events-none absolute inset-0 bg-black/20" aria-hidden />
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <p className="font-heading text-center text-4xl font-medium tracking-[0.18em] text-white drop-shadow-lg sm:text-6xl md:text-7xl">
            SHOJUEN
          </p>
        </div>
      </section>

      <div className="relative mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="mb-4 max-w-xl text-xs font-medium uppercase tracking-[0.45em] text-emerald-100/90">
          {m.hero.subtagline}
        </p>
        <motion.h1
          className="font-heading max-w-3xl text-4xl font-medium leading-[1.15] tracking-wide text-white drop-shadow-sm sm:text-5xl md:text-6xl"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
        >
          {m.hero.title}
        </motion.h1>
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
        <motion.div
          className="mt-16 flex items-center gap-2 text-xs text-stone-300/90"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDownIcon className="size-4" aria-hidden />
          <span className="tracking-widest">{m.hero.scroll}</span>
        </motion.div>
      </div>
    </div>
  )
}
