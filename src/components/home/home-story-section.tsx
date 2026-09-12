"use client"

import { FadeIn } from "@/components/motion/fade-in"
import { useLanguage } from "@/i18n/language-context"

export function HomeStorySection() {
  const { m } = useLanguage()
  const story = m.homeStory

  if (!story.title || story.paragraphs.length === 0) {
    return null
  }

  return (
    <section className="border-t border-border/60 bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
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
