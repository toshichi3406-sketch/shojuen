import type { Metadata } from "next"

import { getRouteMetadata } from "@/i18n/server"

export async function generateMetadata(): Promise<Metadata> {
  return getRouteMetadata("matcha")
}

export default function TheMatchaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
