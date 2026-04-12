/**
 * Matcha-themed photography (verified subjects — not generic stock IDs).
 * Pexels: 8004567 — Darina Belonogova, "Matcha Powder on the Table".
 * Unsplash: standard-license stills from /s/photos/matcha (powder, bowl, cup).
 */
const pexels = (id: string) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=2400`

/** Unsplash `images.unsplash.com/photo-*` — width-cropped for hero/banners */
const unsplash = (photoId: string) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=2400&q=85`

/** Pexels 8004567 — matcha powder & chasen still life */
const matchaPowderTable = pexels("8004567")

/** Jason Leung — white cup of matcha */
const matchaCup = unsplash("photo-1515823064-d6e0c04616a7")
/** Matcha & CO — green powder + spoon on board */
const matchaPowderSpoon = unsplash("photo-1566373049939-704ea187ef98")
/** Alice Pasqual — green powder in white bowl */
const matchaPowderBowl = unsplash("photo-1565117661210-fd54898de423")
/** charlesdeluvio — green powder on white surface */
const matchaPowderSurface = unsplash("photo-1605729988263-7752475299e5")

export const siteImages = {
  /** Full-bleed home hero */
  hero: matchaCup,
  /** Producers page header + first producer card */
  producersHeader: matchaPowderTable,
  producersCardPrimary: matchaPowderBowl,
  producersCardSecondary: matchaPowderSurface,
  /** Home producers preview cards (same order as producers) */
  previewCardPrimary: matchaPowderBowl,
  previewCardSecondary: matchaPowderSurface,
  /** THE MATCHA intro wide image */
  matchaCatalogBanner: matchaPowderSpoon,
  /** HOW TO top image */
  howToHero: matchaPowderTable,
} as const
