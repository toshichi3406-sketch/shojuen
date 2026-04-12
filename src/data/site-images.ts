/**
 * AI-generated ceremonial matcha imagery. Each path is used in at most one
 * layout role so the same photo is not repeated across hero, pages, and strips.
 */
const img = (name: string) => `/images/${name}` as const

export const siteImages = {
  /** Full-bleed home hero only */
  hero: img("hero-ceremonial-matcha.png"),
  producersHeader: img("slot-producers-header.png"),
  producersCardPrimary: img("slot-producer-card-1.png"),
  producersCardSecondary: img("slot-producer-card-2.png"),
  previewCardPrimary: img("slot-preview-1.png"),
  previewCardSecondary: img("slot-preview-2.png"),
  matchaCatalogBanner: img("slot-matcha-catalog.png"),
  howToHero: img("slot-howto-hero.png"),
} as const

/**
 * Home gallery + journal/latest strips — six images, disjoint from `siteImages`
 * (except hero, which is not listed here so the home hero stays unique).
 */
export const homeMatchaVisualGallery = [
  { src: img("gallery-strip-1.png") },
  { src: img("gallery-strip-2.png") },
  { src: img("gallery-strip-3.png") },
  { src: img("gallery-strip-4.png") },
  { src: img("gallery-strip-5.png") },
  { src: img("gallery-strip-6.png") },
] as const
