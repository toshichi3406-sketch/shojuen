import { AwardIcon, SparklesIcon } from "lucide-react"

import { ceo } from "@/data/ceo"
import { FadeIn, FadeInItem, FadeInStagger } from "@/components/motion/fade-in"

export function CeoSection() {
  return (
    <section className="relative border-t border-border/60 bg-muted/25 py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,_rgba(22,90,55,0.06),_transparent_50%)]" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <FadeIn className="mb-14 max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.4em] text-primary">
            Editorial
          </p>
          <h2 className="font-heading mt-3 text-3xl font-medium tracking-wide text-foreground sm:text-4xl">
            CEO · 編集長
          </h2>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            松樹園の編集方針と取材の根幹を担う代表のプロフィールと、これまでの主な実績（武勇伝）です。
          </p>
        </FadeIn>

        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <FadeIn className="lg:col-span-5">
            <div className="rounded-2xl border border-border/80 bg-card p-8 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-primary">
                {ceo.title}
              </p>
              <p className="font-heading mt-3 text-3xl font-medium text-foreground">
                {ceo.nameJa}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{ceo.nameKana}</p>
              <p className="mt-6 text-sm font-medium text-foreground/90">
                {ceo.tagline}
              </p>
              <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
                {ceo.bio.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          </FadeIn>

          <div className="lg:col-span-7">
            <FadeIn className="mb-8 flex items-center gap-2">
              <SparklesIcon className="size-5 text-primary" aria-hidden />
              <h3 className="font-heading text-xl font-medium text-foreground">
                武勇伝
              </h3>
              <span className="text-xs text-muted-foreground">
                — 取材・編集・茶道にまつわる実績
              </span>
            </FadeIn>
            <FadeInStagger className="space-y-5" stagger={0.06}>
              {ceo.legends.map((item) => (
                <FadeInItem key={item.headline}>
                  <article className="rounded-xl border border-border/70 bg-background/80 p-5 transition-colors hover:border-primary/25">
                    <div className="flex gap-3">
                      <AwardIcon
                        className="mt-0.5 size-4 shrink-0 text-primary"
                        aria-hidden
                      />
                      <div>
                        <h4 className="text-sm font-medium leading-snug text-foreground">
                          {item.headline}
                        </h4>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {item.body}
                        </p>
                      </div>
                    </div>
                  </article>
                </FadeInItem>
              ))}
            </FadeInStagger>
          </div>
        </div>
      </div>
    </section>
  )
}
