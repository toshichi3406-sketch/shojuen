/**
 * AI-generated ceremonial matcha imagery (dark slate, chasen, powder, froth).
 * Stored under /public/images — no remote hosts.
 */
const img = (name: string) => `/images/${name}` as const

export const siteImages = {
  /** Full-bleed home hero — wide ceremonial scene */
  hero: img("hero-ceremonial-matcha.png"),
  /** Producers page header */
  producersHeader: img("slate-powder-chasen.png"),
  producersCardPrimary: img("chawan-powder-chasen.png"),
  producersCardSecondary: img("frothy-matcha-macro.png"),
  previewCardPrimary: img("chawan-powder-chasen.png"),
  previewCardSecondary: img("frothy-matcha-macro.png"),
  /** THE MATCHA intro */
  matchaCatalogBanner: img("matcha-flatlay-slate.png"),
  /** HOW TO top */
  howToHero: img("powder-cascade-slate.png"),
} as const

/** Home gallery + optional strips elsewhere — order matches i18n `homeMatchaGallery.imageAlts` */
export const homeMatchaVisualGallery = [
  { src: img("slate-powder-chasen.png") },
  { src: img("frothy-matcha-macro.png") },
  { src: img("matcha-flatlay-slate.png") },
  { src: img("chawan-powder-chasen.png") },
  { src: img("powder-cascade-slate.png") },
  { src: img("hero-ceremonial-matcha.png") },
] as const
