import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ClockIcon } from "lucide-react"

import { articles } from "@/data/articles"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FadeIn } from "@/components/motion/fade-in"

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

const bodyParagraphs: Record<string, string[]> = {
  "uji-tencha-shade-structure": [
    "宇治南山城では、覆下の「何日目にどの遮光率をかけるか」が、テアニンとフラボノイドのバランスを決める。一斉に真っ暗にするのではなく、最初の数日は透過光を残して青味を抜き、その後に重ね幕で光量子束密度を落とす——この段階設計が、碾茶の香気の芯に直結する。",
    "現場のログでは、南側の斜面ほど午前の直射が強く、同じ遮光幕でも葉温のピークが高い。北東向きの圃場では、葉の厚みが均一になり、蒸し工程での通熱ムラが少ない傾向が観察された。",
  ],
  "nishio-gokou-nitrogen": [
    "ごこうは、窒素同化の賜物とも言われる品種だが、覆下後の蒸しで「芯まで通す」熱の入り方が、花芯様の香気を引き出す鍵になる。西尾の平地では、朝露と昼間の乾燥のリズムが葉の含水率を均一化し、蒸し後の乾燥で香気の揮発が抑えられやすい。",
    "試飲では、同じごこうでも、蒸しが長時間のロットは香気が閉じ、短時間高温のロットはトップノートが立ちすぎる。碾茶の粒子径と合わせて評価しないと、銘柄の個性は見えない。",
  ],
  "ishiusu-rpm-and-particle": [
    "石臼の回転数を上げると、微粉率は上がるが、摩擦熱で揮発成分が失われる。茶師が聴く「唸り」は、臼歯と茶の噛み合いの音であり、粒度分布の歪みを耳で補正しているとも言える。",
    "レーザー回折式の粒度計で見ると、理想的な薄茶用は、数ミクロン以下のピークと、十数ミクロンのサブピークが共存する分布が多い。一方で、ラテ向けは意図的にサブピークを抑え、舌触りのクリーミーさを優先する。",
  ],
  "koicha-usucha-foam-kinin": [
    "濃茶は茶筅で「解す」ことに近く、泡の立ちは不要とされる。粘度が高いため、茶筅の動きは碗底を這わせるようにし、かき混ぜすぎると澱が出る。",
    "薄茶では茶筅の本数と硬さが、きめの細かさに直結する。湯が硬いと泡が粗く、軟水では細かいが持続が短い——水質は茶室でも再現性の変数として記録に値する。",
  ],
  "chakai-ichigo-ichie-modern": [
    "一期一会は、同じ茶会は二度と来ないという時間の倫理の言葉だが、現代の茶会では「客人が初めての緊張を解く」ための視覚的設計も問われる。古帛紗の上に、現代作家のガラス茶碗を置くことの是非は、流派の承認を超えて、客がどこに視線を置けるかの問題でもある。",
    "濃緑の抹茶と、透明な碗の縁のコントラストは、スマートフォンに映える以前に、客の呼吸を浅くする効果がある。ただし、器の冷たさが抹茶の温度を奪う場合もあり、季節と湯の温度の設計が不可欠だ。",
  ],
}

export default async function JournalArticlePage({ params }: Props) {
  const { slug } = await params
  const article = articles.find((a) => a.slug === slug)
  if (!article) notFound()

  const paragraphs = bodyParagraphs[slug] ?? [
    article.excerpt,
    "（本文は編集中です。データソースと図版を追って公開予定です。）",
  ]

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <FadeIn>
        <Link
          href="/journal"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← JOURNAL 一覧
        </Link>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Badge variant="secondary">{article.category}</Badge>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <ClockIcon className="size-4" aria-hidden />
            {article.readMinutes} 分 · {article.publishedAt}
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
