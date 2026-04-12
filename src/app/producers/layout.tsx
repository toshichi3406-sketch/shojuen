import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "PRODUCERS · 生産者紹介",
  description:
    "碾茶・抹茶づくりに情熱を注ぐ茶農家・茶師。土壌、品種、石臼挽きを松壽園SHOJUENが記録します。",
}

export default function ProducersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
