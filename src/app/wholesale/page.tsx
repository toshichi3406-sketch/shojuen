import type { Metadata } from "next"

import { getRouteMetadata } from "@/i18n/server"
import { WholesalePageClient } from "./wholesale-page-client"

export async function generateMetadata(): Promise<Metadata> {
  return getRouteMetadata("wholesale")
}

export default function WholesalePage() {
  return <WholesalePageClient />
}
