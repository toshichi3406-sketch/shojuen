import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "CHAWAN · 抹茶椀カタログ",
  description:
    "有田焼の希少な陶器（土もの）抹茶椀。作風と種類で選び、卸・取引先向けに松壽園SHOJUENがご提案します。",
}

export default function ChawanLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
