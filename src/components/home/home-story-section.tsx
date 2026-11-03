"use client"

import Image from "next/image"

import { FadeIn } from "@/components/motion/fade-in"
import { useLanguage } from "@/i18n/language-context"

export function HomeStorySection() {
  const { m, locale } = useLanguage()
  const story = m.homeStory

  if (!story.title || story.paragraphs.length === 0) {
    return null
  }

  return (
    <section className="border-t border-border/60 bg-background py-16 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-muted lg:sticky lg:top-24">
            <Image src="/images/matcha-powder-detail.jpg" alt={{ ja: "白い器に盛った抹茶粉のきめ細かな質感", en: "Fine matcha powder piled in a white dish", zh: "白色容器中細緻的抹茶粉" }[locale]} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
          </div>
        </div>
        <FadeIn y={18}>
          <h2 className="font-heading text-2xl font-medium leading-snug tracking-tight text-foreground sm:text-3xl">
            {story.title}
          </h2>
          <div className="mt-8 space-y-5 text-sm leading-relaxed text-muted-foreground sm:text-base sm:leading-relaxed">
            {story.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
