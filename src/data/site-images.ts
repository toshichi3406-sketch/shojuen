/**
 * Matcha / tencha / chasen themed photography (Pexels — free use).
 * Centralized so you can swap URLs or move to self-hosted /images later.
 */
const q = "?auto=compress&cs=tinysrgb&w=2400"

/** 8004567 — matcha powder & tea tools (table still life) */
const matchaPowderTools = `https://images.pexels.com/photos/8004567/pexels-photo-8004567.jpeg${q}`

/** 4052381 — matcha / green tea preparation mood */
const matchaPrepA = `https://images.pexels.com/photos/4052381/pexels-photo-4052381.jpeg${q}`

/** 5945562 — matcha / Japanese green tea scene */
const matchaPrepB = `https://images.pexels.com/photos/5945562/pexels-photo-5945562.jpeg${q}`

/** 8117435 — close matcha / tea craft still life */
const matchaCraft = `https://images.pexels.com/photos/8117435/pexels-photo-8117435.jpeg${q}`

export const siteImages = {
  /** Full-bleed home hero */
  hero: matchaCraft,
  /** Producers page header + first producer card */
  producersHeader: matchaPowderTools,
  producersCardPrimary: matchaPrepA,
  producersCardSecondary: matchaPrepB,
  /** Home producers preview cards (same order as producers) */
  previewCardPrimary: matchaPrepA,
  previewCardSecondary: matchaPrepB,
  /** THE MATCHA intro wide image */
  matchaCatalogBanner: matchaPowderTools,
  /** HOW TO top image */
  howToHero: matchaPrepA,
} as const
