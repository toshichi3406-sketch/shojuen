import type { Metadata } from "next"

import { getRouteMetadata } from "@/i18n/server"

export async function generateMetadata(): Promise<Metadata> {
  return getRouteMetadata("contact")
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
