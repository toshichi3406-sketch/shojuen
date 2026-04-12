export type NavKey = "home" | "matcha" | "producers" | "journal" | "howTo"

export type NavRoute = {
  href: string
  key: NavKey
}

export const mainNav: NavRoute[] = [
  { href: "/", key: "home" },
  { href: "/the-matcha", key: "matcha" },
  { href: "/producers", key: "producers" },
  { href: "/journal", key: "journal" },
  { href: "/how-to", key: "howTo" },
]
