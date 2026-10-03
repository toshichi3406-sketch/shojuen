import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { articles, localize } from "@/data/articles"
import { getArticleCoverImage } from "@/data/journal-article-media"
import { buildLocalizedMetadata } from "@/i18n/seo"
import { getSeoRequestContext } from "@/i18n/server"
import { JournalArticleClient } from "./journal-article-client"

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = articles.find((a) => a.slug === slug)
  if (!article) return { title: "Article not found" }

  const { locale, publicPathname } = await getSeoRequestContext()
  const cover = getArticleCoverImage(slug)
  const title = localize(article.title, locale)
  const description = localize(article.excerpt, locale)

  return {
    ...buildLocalizedMetadata({
      locale,
      publicPathname,
      title,
      description,
      image: cover ? { url: cover, alt: title } : undefined,
    }),
    robots: article.draft ? { index: false, follow: false } : undefined,
  }
}

export default async function JournalArticlePage({ params }: Props) {
  const { slug } = await params
  const article = articles.find((a) => a.slug === slug)
  if (!article) notFound()

  return <JournalArticleClient slug={slug} article={article} />
}
