import Link from "next/link"
import { ArrowUpRightIcon, ClockIcon } from "lucide-react"

import { articles } from "@/data/articles"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FadeIn, FadeInItem, FadeInStagger } from "@/components/motion/fade-in"

export function LatestArticles() {
  const latest = articles.slice(0, 3)

  return (
    <section className="relative border-b border-border/60 bg-background py-24 sm:py-32">
      <div className="bg-grain pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <FadeIn className="mb-14 max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
            Journal
          </p>
          <h2 className="font-heading mt-3 text-3xl font-medium tracking-wide text-foreground sm:text-4xl">
            JOURNAL · 最新記事
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            覆下栽培の光環境、石臼の粒度、濃茶と薄茶の作法——碾茶と抹茶の専門的な記録をお届けします。
          </p>
        </FadeIn>

        <FadeInStagger className="grid gap-6 md:grid-cols-3">
          {latest.map((article) => (
            <FadeInItem key={article.slug}>
              <Card className="group h-full overflow-hidden border-border/80 bg-card/80 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-primary/25 hover:shadow-md">
                <CardHeader className="gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="font-normal">
                      {article.category}
                    </Badge>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ClockIcon className="size-3.5" aria-hidden />
                      {article.readMinutes} 分
                    </span>
                  </div>
                  <CardTitle className="font-heading text-lg leading-snug transition-colors group-hover:text-primary">
                    <Link
                      href={`/journal/${article.slug}`}
                      className="inline-flex items-start gap-1 no-underline outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {article.title}
                      <ArrowUpRightIcon
                        className="mt-0.5 size-4 shrink-0 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                        aria-hidden
                      />
                    </Link>
                  </CardTitle>
                  <CardDescription className="line-clamp-3 text-sm leading-relaxed">
                    {article.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">
                    {article.publishedAt}
                  </p>
                </CardContent>
              </Card>
            </FadeInItem>
          ))}
        </FadeInStagger>

        <FadeIn className="mt-12 flex justify-center" delay={0.15}>
          <Link
            href="/journal"
            className="text-sm font-medium text-primary underline-offset-4 transition-colors hover:underline"
          >
            JOURNAL 一覧へ
          </Link>
        </FadeIn>
      </div>
    </section>
  )
}
