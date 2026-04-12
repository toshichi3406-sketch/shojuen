import { HeroSection } from "@/components/home/hero-section"
import { HomeClosingSection } from "@/components/home/home-closing-section"
import { LatestArticles } from "@/components/home/latest-articles"
import { ProducersPreview } from "@/components/home/producers-preview"

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <LatestArticles />
      <ProducersPreview />
      <HomeClosingSection />
    </>
  )
}
