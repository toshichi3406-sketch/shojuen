import type { Metadata } from "next"

import { getRouteMetadata } from "@/i18n/server"

export async function generateMetadata(): Promise<Metadata> {
  return getRouteMetadata("journal")
}

export default function JournalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
