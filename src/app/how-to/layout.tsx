import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "HOW TO · 点て方・楽しみ方",
  description:
    "濃茶・薄茶の基本。湯温、抹茶量、茶筅の動きと、モダンな楽しみ方のヒント。",
}

export default function HowToLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
