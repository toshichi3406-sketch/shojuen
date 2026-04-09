import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { FadeIn, FadeInStagger, FadeInItem } from "@/components/motion/fade-in"
import { buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "HOW TO · 点て方・楽しみ方",
  description:
    "濃茶・薄茶の基本。湯温、抹茶量、茶筅の動きと、モダンな楽しみ方のヒント。",
}

const blocks = [
  {
    title: "薄茶（うすちゃ）",
    subtitle: "碗の中で「きめ」を立てる",
    items: [
      { label: "湯温", value: "約 75〜85℃（沸かしすぎない。軟水が理想）" },
      { label: "抹茶量", value: "目安 2 ちゃしき（約 2g）／水 70ml 前後" },
      { label: "茶筅", value: "穗が細かいもの。W 字型で腕を素早く前後に動かし、泡立ちを確認" },
      { label: "待ち", value: "立てすぎない。表面に細かな泡が均一に乗れば完了" },
    ],
  },
  {
    title: "濃茶（こいちゃ）",
    subtitle: "粘度と旨味の塊を「解す」",
    items: [
      { label: "湯温", value: "やや低め 60〜70℃ 帯が多い（流派・銘柄で差あり）" },
      { label: "抹茶量", value: "目安 3.5〜4g 以上／少量の湯から開始し足すことも" },
      { label: "茶筅", value: "泡を立てない。碗底を這わせるようにゆっくり均一に" },
      { label: "待ち", value: "澱が出ないよう、一気にかき回しすぎない" },
    ],
  },
]

export default function HowToPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <FadeIn>
        <div className="relative mb-10 aspect-[2/1] w-full overflow-hidden rounded-2xl border border-primary/20 shadow-sm ring-1 ring-primary/10">
          <Image
            src="/images/tea-varieties-collage.png"
            alt="抹茶を点てる所作と茶器のイメージ"
            fill
            sizes="(min-width: 768px) 48rem, 100vw"
            className="object-cover object-[50%_72%]"
            priority
          />
        </div>
        <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
          How to
        </p>
        <h1 className="font-heading mt-4 text-4xl font-medium text-foreground">
          点て方・楽しみ方
        </h1>
        <p className="mt-6 leading-relaxed text-muted-foreground">
          濃茶と薄茶では、湯の量・温度・茶筅の動きの目的がまったく異なります。以下は稽古とカフェ双方で再現しやすい
          <strong className="font-medium text-foreground">ベースライン</strong>
          です。流派・茶会の礼法がある場合は、そちらを優先してください。
        </p>
      </FadeIn>

      <FadeInStagger className="mt-14 space-y-12">
        {blocks.map((block) => (
          <FadeInItem key={block.title}>
            <section>
              <h2 className="font-heading text-2xl font-medium text-foreground">
                {block.title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{block.subtitle}</p>
              <Separator className="my-6" />
              <dl className="space-y-5">
                {block.items.map((row) => (
                  <div key={row.label}>
                    <dt className="text-xs font-medium uppercase tracking-wider text-primary">
                      {row.label}
                    </dt>
                    <dd className="mt-1.5 text-sm leading-relaxed text-foreground/90">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          </FadeInItem>
        ))}
      </FadeInStagger>

      <FadeIn className="mt-14 rounded-2xl border border-border/80 bg-muted/30 p-6 sm:p-8">
        <h2 className="font-heading text-lg font-medium text-foreground">
          モダンな楽しみ方
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          抹茶ラテでは、牛乳の脂肪が香気を包み込みやすいため、
          <strong className="font-medium text-foreground">濃いめの碾茶</strong>
          か、泡立て器で軽くエアレーションして香気を抜くとバランスが取りやすいです。ソーダ割りでは、微粉が沈殿しやすいのでよく混ぜ、氷の溶解で薄まる分を最初から濃い目にするのがコツです。
        </p>
      </FadeIn>

      <Link
        href="/"
        className={cn(
          buttonVariants({ variant: "outline" }),
          "mt-10 inline-flex rounded-full"
        )}
      >
        トップへ戻る
      </Link>
    </div>
  )
}
