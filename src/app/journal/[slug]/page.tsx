import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { articles, localize } from "@/data/articles"
import { getArticleCoverImage } from "@/data/journal-article-media"
import { buildLocalizedMetadata } from "@/i18n/seo"
import { getSeoRequestContext } from "@/i18n/server"
import { JournalArticleClient } from "./journal-article-client"

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ lang?: string }>
}

export async function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = articles.find((a) => a.slug === slug)
  if (!article) return { title: "Article not found" }

  const { locale, publicPathname } = await getSeoRequestContext()
  const cover = getArticleCoverImage(slug)
  const lang = (await searchParams).lang
  const articleLanguage = article.title.ko && (lang === "ko" || lang === "ja" || lang === "en") ? lang : undefined
  const title = localize(article.title, articleLanguage ?? locale)
  const description = localize(article.excerpt, articleLanguage ?? locale)

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

export default async function JournalArticlePage({ params, searchParams }: Props) {
  const { slug } = await params
  const article = articles.find((a) => a.slug === slug)
  if (!article) notFound()

  const lang = (await searchParams).lang
  const articleLanguage = article.title.ko && (lang === "ko" || lang === "ja" || lang === "en") ? lang : undefined
  return <JournalArticleClient slug={slug} article={article} articleLanguage={articleLanguage} />
}
