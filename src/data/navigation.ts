export type NavKey =
  | "home"
  | "matcha"
  | "chawan"
  | "producers"
  | "journal"
  | "howTo"
  | "contact"

export type NavRoute = {
  href: string
  key: NavKey
  /** 準備中の場合は true。ヘッダーではクリック不可＋「近日公開」表示にする。 */
  comingSoon?: boolean
}

export const mainNav: NavRoute[] = [
  { href: "/", key: "home" },
  { href: "/the-matcha", key: "matcha" },
  { href: "/chawan", key: "chawan", comingSoon: true },
  { href: "/producers", key: "producers" },
  { href: "/journal", key: "journal" },
  { href: "/how-to", key: "howTo" },
  { href: "/contact", key: "contact" },
]
