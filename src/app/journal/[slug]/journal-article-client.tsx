"use client"

import Link from "next/link"
import { useMemo } from "react"
import { ClockIcon } from "lucide-react"

import type { Article } from "@/data/articles"
import { journalArticleBodies } from "@/data/journal-article-bodies"
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
  const { m } = useLanguage()

  const paragraphs = useMemo(() => {
    return (
      journalArticleBodies[slug] ?? [
        article.excerpt,
        m.journalArticle.draftNote,
      ]
    )
  }, [slug, article.excerpt, m.journalArticle.draftNote])

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <FadeIn>
        <Link
          href="/journal"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {m.journalArticle.back}
        </Link>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Badge variant="secondary">{article.category}</Badge>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <ClockIcon className="size-4" aria-hidden />
            {article.readMinutes} {m.journalArticle.min} · {article.publishedAt}
          </span>
        </div>
        <h1 className="font-heading mt-6 text-3xl font-medium leading-snug text-foreground sm:text-4xl">
          {article.title}
        </h1>
        <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
          {article.excerpt}
        </p>
        <Separator className="my-12" />
        <div className="space-y-8 text-base leading-[1.95] text-foreground/90">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </FadeIn>
    </article>
  )
}
