import type { Metadata } from "next"

import { getRouteMetadata } from "@/i18n/server"

export async function generateMetadata(): Promise<Metadata> {
  return getRouteMetadata("howTo")
}

export default function HowToLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
