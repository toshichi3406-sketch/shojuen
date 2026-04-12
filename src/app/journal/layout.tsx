import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "JOURNAL",
  description:
    "碾茶・抹茶の産地、栽培、石臼挽き、茶道。プロの視点で綴る JOURNAL。",
}

export default function JournalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
