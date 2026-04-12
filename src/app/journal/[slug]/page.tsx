import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { articles } from "@/data/articles"
import { JournalArticleClient } from "./journal-article-client"

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = articles.find((a) => a.slug === slug)
  if (!article) return { title: "記事が見つかりません" }
  return {
    title: article.title,
    description: article.excerpt,
  }
}

export default async function JournalArticlePage({ params }: Props) {
  const { slug } = await params
  const article = articles.find((a) => a.slug === slug)
  if (!article) notFound()

  return <JournalArticleClient slug={slug} article={article} />
}
