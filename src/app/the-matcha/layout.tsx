import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "THE MATCHA · 抹茶図鑑",
  description:
    "宇治・西尾・静岡。産地、品種、石臼挽き、濃緑の色味と味わいをテイスティングノート形式で。",
}

export default function TheMatchaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
