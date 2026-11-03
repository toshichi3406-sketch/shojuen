/**
 * Site imagery. Each path is used in at most one layout role so the same
 * photo is not repeated across hero, pages, and strips.
 * Entries marked "in-house" are our own photographs; the rest are
 * AI-generated placeholders still awaiting replacement.
 */
const img = (name: string) => `/images/${name}` as const

export const siteImages = {
  /** Full-bleed home hero — poster frame for `heroVideo` (in-house) */
  hero: img("hero-matcha-poster.jpg"),
  /** Full-bleed home hero loop, muted (in-house) */
  heroVideo: img("hero-matcha.mp4"),
  producersHeader: img("slot-producers-header.png"),
  producersCardPrimary: img("slot-producer-card-1.png"),
  producersCardSecondary: img("slot-producer-card-2.png"),
  previewCardPrimary: img("slot-preview-1.png"),
  previewCardSecondary: img("slot-preview-2-v2.png"),
  /** in-house */
  matchaCatalogBanner: img("matcha-swatches-three.jpg"),
  /** in-house */
  howToHero: img("koicha-whisking.jpg"),
} as const

/**
 * Home gallery + journal/latest strips. Nine images, disjoint from `siteImages`
 * (the hero is not listed here so the home hero stays unique).
 * 1–6 = home main visual gallery only; 7–9 = journal index + latest-articles strip.
 */
export const homeMatchaVisualGallery = [
  { src: img("gallery-strip-1.png") },
  { src: img("gallery-strip-2.png") },
  { src: img("gallery-strip-3.png") },
  { src: img("gallery-strip-4.png") },
  { src: img("gallery-strip-5.png") },
  { src: img("gallery-strip-6.png") },
  { src: img("gallery-strip-7.png") },
  { src: img("gallery-strip-8.png") },
  { src: img("gallery-strip-9.png") },
] as const
