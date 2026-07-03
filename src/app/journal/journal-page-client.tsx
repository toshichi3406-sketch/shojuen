"use client"

import Image from "next/image"
import Link from "next/link"
import { BookOpenIcon, ClockIcon } from "lucide-react"

import { getPublishedArticles, localize } from "@/data/articles"
import { getArticleCoverImage } from "@/data/journal-article-media"
import { homeMatchaVisualGallery } from "@/data/site-images"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FadeIn, FadeInItem, FadeInStagger } from "@/components/motion/fade-in"
import { useLanguage } from "@/i18n/language-context"

export function JournalPageClient() {
  const { locale, m } = useLanguage()
  const published = getPublishedArticles()
  const countLabel = m.journalPage.articleCount.replace(
    "{n}",
    String(published.length)
  )

  return (
    <div className="bg-background">
      <div className="relative border-b border-border/70 bg-muted/25">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,_rgba(22,90,55,0.06),_transparent_55%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <FadeIn>
            <p className="text-xs font-medium uppercase tracking-[0.45em] text-primary">
              Journal
            </p>
            <h1 className="font-heading mt-4 text-4xl font-medium tracking-wide text-foreground sm:text-5xl">
              JOURNAL
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {m.journalPage.introLead}
              <strong className="font-medium text-foreground">
                {m.journalPage.introStrong}
              </strong>
              {m.journalPage.introRest}
            </p>
            <div className="mt-10 grid grid-cols-3 gap-2 sm:mt-12 sm:gap-3">
              {homeMatchaVisualGallery.slice(6, 9).map((item, i) => (
                <div
                  key={item.src}
                  className="relative aspect-[5/3] overflow-hidden rounded-md border border-border/50 bg-muted shadow-sm"
                >
                  <Image
                    src={item.src}
                    alt={
                      m.homeMatchaGallery.imageAlts[i + 6] ??
                      m.homeMatchaGallery.fallbackAlt
                    }
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 33vw, 240px"
                  />
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <FadeIn className="mb-10 flex items-center gap-2 text-sm text-muted-foreground">
          <BookOpenIcon className="size-4 text-primary" aria-hidden />
          <span>{countLabel}</span>
        </FadeIn>

        <FadeInStagger className="grid gap-6 md:grid-cols-2">
          {published.map((article) => {
            const cover = getArticleCoverImage(article.slug)
            return (
              <FadeInItem key={article.slug}>
                <Card className="group h-full overflow-hidden border-border/80 bg-card/90 transition-all duration-300 hover:border-primary/30 hover:shadow-md">
                  {cover && (
                    <Link
                      href={`/journal/${article.slug}`}
                      className="relative block aspect-[16/10] overflow-hidden bg-muted"
                    >
                      <Image
                        src={cover}
                        alt={localize(article.title, locale)}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-[1.03]"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </Link>
                  )}
                  <CardHeader className="gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="font-normal">
                        {localize(article.category, locale)}
                      </Badge>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <ClockIcon className="size-3.5" aria-hidden />
                        {article.readMinutes} {m.journalPage.min} ·{" "}
                        {article.publishedAt}
                      </span>
                    </div>
                    <CardTitle className="font-heading text-xl leading-snug sm:text-2xl">
                      <Link
                        href={`/journal/${article.slug}`}
                        className="text-foreground no-underline transition-colors group-hover:text-primary"
                      >
                        {localize(article.title, locale)}
                      </Link>
                    </CardTitle>
                    <CardDescription className="text-[0.95rem] leading-relaxed">
                      {localize(article.excerpt, locale)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link
                      href={`/journal/${article.slug}`}
                      className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                    >
                      {m.journalPage.readArticle}
                    </Link>
                  </CardContent>
                </Card>
              </FadeInItem>
            )
          })}
        </FadeInStagger>
      </div>
    </div>
  )
}
