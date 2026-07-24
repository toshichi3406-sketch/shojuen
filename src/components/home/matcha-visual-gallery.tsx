"use client"

import Image from "next/image"

import { homeMatchaVisualGallery } from "@/data/site-images"
import { useLanguage } from "@/i18n/language-context"
import { FadeInItem, FadeInStagger } from "@/components/motion/fade-in"

export function MatchaVisualGallery() {
  const { m } = useLanguage()
  const alts = m.homeMatchaGallery.imageAlts

  return (
    <section
      className="relative border-b border-border/60 bg-stone-950 py-20 sm:py-28"
      aria-labelledby="matcha-visual-gallery-heading"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,_rgba(34,120,80,0.12),_transparent_50%)]" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <h2 id="matcha-visual-gallery-heading" className="sr-only">
          {m.homeMatchaGallery.heading}
        </h2>

        <FadeInStagger className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
          {homeMatchaVisualGallery.slice(0, 6).map((item, i) => (
            <FadeInItem key={item.src}>
              <figure className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-white/10 bg-stone-900 shadow-lg shadow-black/40">
                <Image
                  src={item.src}
                  alt={alts[i] ?? m.homeMatchaGallery.fallbackAlt}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover transition duration-700 ease-out group-hover:scale-[1.03]"
                />
                <figcaption className="sr-only">
                  {alts[i] ?? m.homeMatchaGallery.fallbackAlt}
                </figcaption>
              </figure>
            </FadeInItem>
          ))}
        </FadeInStagger>
      </div>
    </section>
  )
}
