export type NavItem = {
  href: string
  label: string
  labelEn?: string
  description?: string
}

export const mainNav: NavItem[] = [
  { href: "/", label: "トップ", description: "濃緑と一期一会" },
  {
    href: "/the-matcha",
    label: "抹茶図鑑",
    labelEn: "THE MATCHA",
    description: "産地・品種・挽き・味わい",
  },
  {
    href: "/producers",
    label: "生産者紹介",
    labelEn: "PRODUCERS",
    description: "茶農家・茶師のこだわり",
  },
  {
    href: "/journal",
    label: "JOURNAL",
    labelEn: "JOURNAL",
    description: "碾茶と茶道の記録",
  },
  {
    href: "/how-to",
    label: "点て方",
    labelEn: "HOW TO",
    description: "濃茶・薄茶・モダンな楽しみ方",
  },
]
