import { Suspense } from "react"

import { ContactPageClient } from "./contact-page-client"

export default function ContactPage() {
  return (
    <Suspense fallback={null}>
      <ContactPageClient />
    </Suspense>
  )
}
