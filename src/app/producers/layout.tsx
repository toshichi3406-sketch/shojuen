import type { Metadata } from "next"

import { getRouteMetadata } from "@/i18n/server"

export async function generateMetadata(): Promise<Metadata> {
  return getRouteMetadata("producers")
}

export default function ProducersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
