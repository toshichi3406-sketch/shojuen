import type { Metadata } from "next"

import { getRouteMetadata } from "@/i18n/server"

export async function generateMetadata(): Promise<Metadata> {
  return getRouteMetadata("chawan")
}

export default function ChawanLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
