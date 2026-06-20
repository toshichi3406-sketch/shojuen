import type { Metadata } from "next"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"

import { articles, localize } from "@/data/articles"
import { LOCALE_COOKIE, parseLocale } from "@/i18n/types"
import { JournalArticleClient } from "./journal-article-client"

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = articles.find((a) => a.slug === slug)
  if (!article) return { title: "記事が見つかりません" }
  const cookieStore = await cookies()
  const locale = parseLocale(cookieStore.get(LOCALE_COOKIE)?.value)
  return {
    title: localize(article.title, locale),
    description: localize(article.excerpt, locale),
  }
}

export default async function JournalArticlePage({ params }: Props) {
  const { slug } = await params
  const article = articles.find((a) => a.slug === slug)
  if (!article) notFound()

  return <JournalArticleClient slug={slug} article={article} />
}
