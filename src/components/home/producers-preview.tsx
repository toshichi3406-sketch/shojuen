import Image from "next/image"
import Link from "next/link"
import { MapPinIcon, MountainIcon } from "lucide-react"

import { producers } from "@/data/producers"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { FadeIn } from "@/components/motion/fade-in"

export function ProducersPreview() {
  const featured = producers.slice(0, 2)

  return (
    <section className="relative overflow-hidden bg-muted/40 py-24 sm:py-32">
      <div className="pointer-events-none absolute -right-24 top-0 h-96 w-96 rounded-full bg-primary/8 blur-3xl" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <FadeIn className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
              Producers
            </p>
            <h2 className="font-heading mt-3 text-3xl font-medium tracking-wide text-foreground sm:text-4xl">
              厳選した碾茶の生産者
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              覆下の日数、蒸しの通熱、石臼の回転に宿る個性。松壽園SHOJUENが長く紹介したい生産者だけを載せています。
            </p>
          </div>
          <Link
            href="/producers"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "w-fit shrink-0 rounded-full border-primary/30 bg-background/80"
            )}
          >
            PRODUCERS 一覧へ
          </Link>
        </FadeIn>

        <div className="grid gap-8 lg:grid-cols-2">
          {featured.map((p, i) => (
            <FadeIn key={p.id} delay={i * 0.08} className="h-full">
              <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-all duration-500 hover:border-primary/30 hover:shadow-lg">
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  <Image
                    src={
                      i === 0
                        ? "/images/tea-varieties-collage.png"
                        : "/images/tea-collage.png"
                    }
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className={cn(
                      "object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.04]",
                      i === 0 && "object-[24%_20%]",
                      i === 1 && "object-[72%_75%]"
                    )}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-900/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 text-white">
                    <span className="inline-flex items-center gap-1 rounded-full bg-black/35 px-3 py-1 text-xs backdrop-blur-sm">
                      <MapPinIcon className="size-3.5" aria-hidden />
                      {p.region}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-black/35 px-3 py-1 text-xs backdrop-blur-sm">
                      <MountainIcon className="size-3.5" aria-hidden />
                      {p.elevationM}
                    </span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6 sm:p-8">
                  <h3 className="font-heading text-xl font-medium text-foreground">
                    <Link
                      href={`/producers#${p.id}`}
                      className="no-underline transition-colors hover:text-primary"
                    >
                      {p.name}
                    </Link>
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-4">
                    {p.soil.slice(0, 120)}…
                  </p>
                  <p className="mt-4 text-xs font-medium uppercase tracking-[0.2em] text-primary/90">
                    {p.heroTagline}
                  </p>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
