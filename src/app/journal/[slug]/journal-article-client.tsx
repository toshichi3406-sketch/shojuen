"use client"

import Image from "next/image"
import Link from "next/link"
import { Fragment, useMemo } from "react"
import { ClockIcon } from "lucide-react"

import { type Article, localize } from "@/data/articles"
import { journalArticleBodies } from "@/data/journal-article-bodies"
import {
  journalArticleMedia,
  type JournalFigure,
} from "@/data/journal-article-media"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FadeIn } from "@/components/motion/fade-in"
import { useLanguage } from "@/i18n/language-context"

export function JournalArticleClient({
  slug,
  article,
}: {
  slug: string
  article: Article
}) {
  const { locale, m } = useLanguage()

  const paragraphs = useMemo(() => {
    const body = journalArticleBodies[slug]
    return (
      body?.[locale] ??
      body?.ja ?? [localize(article.excerpt, locale), m.journalArticle.draftNote]
    )
  }, [slug, locale, article.excerpt, m.journalArticle.draftNote])

  const media = journalArticleMedia[slug]
  const figures = media?.figures ?? []

  const caption = (f: JournalFigure) =>
    locale === "en" ? f.captionEn : locale === "zh" ? f.captionZh : f.captionJa

  const renderFigure = (f: JournalFigure, priority = false) => (
    <figure className="my-10 overflow-hidden">
      <div className="relative aspect-[3/2] w-full overflow-hidden rounded-xl border border-border/70 bg-muted shadow-sm">
        <Image
          src={f.src}
          alt={caption(f)}
          fill
          priority={priority}
          sizes="(min-width: 768px) 48rem, 100vw"
          className="object-cover"
        />
      </div>
      <figcaption className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {caption(f)}
      </figcaption>
    </figure>
  )

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <FadeIn>
        <Link
          href="/journal"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {m.journalArticle.back}
        </Link>
        {article.draft && (
          <p
            role="status"
            className="mt-6 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm leading-relaxed text-amber-950 dark:text-amber-100"
          >
            {m.journalArticle.draftPreviewBanner}
          </p>
        )}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Badge variant="secondary">{localize(article.category, locale)}</Badge>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <ClockIcon className="size-4" aria-hidden />
            {article.readMinutes} {m.journalArticle.min} · {article.publishedAt}
          </span>
        </div>
        <h1 className="font-heading mt-6 text-3xl font-medium leading-snug text-foreground sm:text-4xl">
          {localize(article.title, locale)}
        </h1>
        <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
          {localize(article.excerpt, locale)}
        </p>

        {media?.hero && (
          <div className="mt-10">{renderFigure(media.hero, true)}</div>
        )}

        <Separator className="my-12" />
        <div className="text-base leading-[1.95] text-foreground/90">
          {paragraphs.map((p, i) => (
            <Fragment key={i}>
              <p className={i > 0 ? "mt-8" : undefined}>{p}</p>
              {figures[i] && renderFigure(figures[i])}
            </Fragment>
          ))}
          {figures.slice(paragraphs.length).map((f, i) => (
            <Fragment key={`extra-${i}`}>{renderFigure(f)}</Fragment>
          ))}
        </div>
      </FadeIn>
    </article>
  )
}
