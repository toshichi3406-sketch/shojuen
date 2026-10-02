import type { Metadata } from "next"

import { WholesalePageClient } from "./wholesale-page-client"

export const metadata: Metadata = {
  title: "Wholesale & Export · Japanese Matcha, Tencha & Hojicha",
  description:
    "SHOJUEN wholesale and export consultation for Japanese matcha, tencha and hojicha. For cafes, brands, importers, distributors and retailers.",
  alternates: {
    canonical: "https://ochanoshojuen.com/wholesale",
  },
  openGraph: {
    title: "Wholesale & Export | SHOJUEN",
    description:
      "Japanese matcha, tencha and hojicha for cafes, brands, importers and distributors.",
    url: "https://ochanoshojuen.com/wholesale",
    type: "website",
  },
}

export default function WholesalePage() {
  return <WholesalePageClient />
}
