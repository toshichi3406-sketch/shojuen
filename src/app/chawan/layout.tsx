import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "CHAWAN · 抹茶椀カタログ",
  description:
    "有田焼の抹茶椀の商品ラインアップ。抹茶椀・茶筅たて・木箱入り・片口・野点・夏用など、卸・取引先向けに松壽園SHOJUENがご提案します。",
}

export default function ChawanLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
