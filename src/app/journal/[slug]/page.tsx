import type { Metadata } from "next"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"

import { articles, localize } from "@/data/articles"
import { getArticleCoverImage } from "@/data/journal-article-media"
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
  const cover = getArticleCoverImage(slug)
  const title = localize(article.title, locale)
  const description = localize(article.excerpt, locale)
  return {
    title,
    description,
    robots: article.draft ? { index: false, follow: false } : undefined,
    openGraph: cover
      ? {
          title,
          description,
          images: [{ url: cover, alt: title }],
        }
      : undefined,
    twitter: cover
      ? {
          card: "summary_large_image",
          title,
          description,
          images: [cover],
        }
      : undefined,
  }
}

export default async function JournalArticlePage({ params }: Props) {
  const { slug } = await params
  const article = articles.find((a) => a.slug === slug)
  if (!article) notFound()

  return <JournalArticleClient slug={slug} article={article} />
}
