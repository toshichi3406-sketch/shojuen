import { HeroSection } from "@/components/home/hero-section"
import { LatestArticles } from "@/components/home/latest-articles"
import { ProducersPreview } from "@/components/home/producers-preview"
import { FadeIn } from "@/components/motion/fade-in"

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <LatestArticles />
      <ProducersPreview />
      <section className="relative overflow-hidden border-t border-border/60 bg-background py-20 sm:py-28">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent"
          aria-hidden
        />
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <FadeIn y={20}>
            <p className="font-heading text-2xl font-medium leading-relaxed text-foreground sm:text-3xl">
              一杯の濃緑に、風土と作法が宿る。
            </p>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground sm:text-base">
              碾茶は覆下栽培から蒸し、乾燥、石臼挽きまで、工程のすべてが茶碗の色と香りに刻まれます。松壽園SHOJUENでは、抹茶の多様性と文化性を、目利きの視点で記録します。
            </p>
          </FadeIn>
        </div>
      </section>
    </>
  )
}
