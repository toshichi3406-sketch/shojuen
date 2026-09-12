import { HeroSection } from "@/components/home/hero-section"
import { HomeStorySection } from "@/components/home/home-story-section"
import { WholesaleBanner } from "@/components/home/wholesale-banner"
import { HomeClosingSection } from "@/components/home/home-closing-section"
import { LatestArticles } from "@/components/home/latest-articles"
import { MatchaVisualGallery } from "@/components/home/matcha-visual-gallery"
import { ProducersPreview } from "@/components/home/producers-preview"

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <HomeStorySection />
      <WholesaleBanner />
      <MatchaVisualGallery />
      <LatestArticles />
      <ProducersPreview />
      <HomeClosingSection />
    </>
  )
}
