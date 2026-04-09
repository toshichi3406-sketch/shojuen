import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { LeafIcon, SproutIcon, LayersIcon, SparklesIcon } from "lucide-react"

import { producers } from "@/data/producers"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FadeIn } from "@/components/motion/fade-in"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "PRODUCERS · 生産者紹介",
  description:
    "碾茶・抹茶づくりに情熱を注ぐ茶農家・茶師。土壌、品種、石臼挽きを松樹園が記録します。",
}

export default function ProducersPage() {
  return (
    <div className="bg-background">
      <header className="relative overflow-hidden border-b border-border/70">
        <div className="absolute inset-0">
          <Image
            src="/images/tea-varieties-collage.png"
            alt=""
            fill
            priority
            className="object-cover object-[50%_30%]"
            sizes="100vw"
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/75 via-background/90 to-background" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
          <FadeIn>
            <p className="text-xs font-medium uppercase tracking-[0.4em] text-primary">
              Producers
            </p>
            <h1 className="font-heading mt-4 text-4xl font-medium tracking-wide text-foreground sm:text-5xl">
              生産者紹介
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              碾茶の香りは、覆下の日数と蒸しの一秒、石臼の回転に宿る。茶樹が根を下ろす土の履歴、品種選びの意図、そして碾茶工房のこだわりを、現地で何度も点て直しながら記録しています。
            </p>
          </FadeIn>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <nav
          className="flex flex-wrap gap-3 border-b border-border/60 pb-8"
          aria-label="生産者セクションへジャンプ"
        >
          {producers.map((p) => (
            <Link
              key={p.id}
              href={`#${p.id}`}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              {p.name}
            </Link>
          ))}
        </nav>

        <div className="space-y-28 py-16 sm:space-y-36 sm:py-24">
          {producers.map((p, index) => (
            <article key={p.id} id={p.id} className="scroll-mt-28">
              <FadeIn>
                <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
                  <div className="lg:col-span-5">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border/80 shadow-md">
                      <Image
                        src={
                          index === 0
                            ? "/images/tea-varieties-collage.png"
                            : "/images/tea-collage.png"
                        }
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 38vw, 100vw"
                        className={cn(
                          "object-cover transition-transform duration-[2s] hover:scale-[1.02]",
                          index === 0 && "object-[26%_22%]",
                          index === 1 && "object-[70%_70%]"
                        )}
                      />
                    </div>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {p.cultivars.map((c) => (
                        <Badge
                          key={c}
                          variant="secondary"
                          className="font-normal"
                        >
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-7">
                    <p className="text-xs font-medium uppercase tracking-[0.25em] text-primary">
                      {p.region} · {p.elevationM}
                    </p>
                    <h2 className="font-heading mt-3 text-3xl font-medium text-foreground sm:text-4xl">
                      {p.name}
                    </h2>
                    <p className="mt-4 text-lg font-medium leading-relaxed text-foreground/90">
                      {p.heroTagline}
                    </p>

                    <Separator className="my-10 bg-border/80" />

                    <section className="space-y-4">
                      <h3 className="flex items-center gap-2 font-heading text-lg font-medium text-foreground">
                        <SproutIcon className="size-5 text-primary" aria-hidden />
                        土壌とテロワール
                      </h3>
                      <p className="leading-[1.9] text-muted-foreground">
                        {p.soil}
                      </p>
                    </section>

                    <section className="mt-10 space-y-4">
                      <h3 className="flex items-center gap-2 font-heading text-lg font-medium text-foreground">
                        <LayersIcon className="size-5 text-primary" aria-hidden />
                        碾茶・挽きの芯
                      </h3>
                      <p className="leading-[1.9] text-muted-foreground">
                        {p.processNotes}
                      </p>
                    </section>

                    <section className="relative mt-12 overflow-hidden rounded-2xl border border-primary/20 bg-primary/[0.04] p-6 sm:p-8">
                      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
                      <h3 className="flex items-center gap-2 font-heading text-lg font-medium text-foreground">
                        <SparklesIcon className="size-5 text-primary" aria-hidden />
                        目利きの視点
                      </h3>
                      <p className="relative mt-4 leading-[1.95] text-foreground/90">
                        {p.curatorNote}
                      </p>
                      <p className="relative mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                        <LeafIcon className="size-3.5 text-primary" aria-hidden />
                        松樹園編集部 · 碾茶試飲と点茶ログに基づくコメント
                      </p>
                    </section>
                  </div>
                </div>
              </FadeIn>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
