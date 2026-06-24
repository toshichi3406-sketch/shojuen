import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "CHAWAN · 抹茶椀カタログ",
  description:
    "抹茶椀（茶碗）の商品ラインアップ。楽焼・萩・唐津ほか、卸・取引先向けに松壽園SHOJUENがご提案します。",
}

export default function ChawanLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
