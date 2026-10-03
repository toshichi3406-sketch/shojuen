"use client"

import { LeadAttributionCapture } from "@/components/analytics/lead-attribution-capture"
import { LanguageProvider } from "@/i18n/language-context"
import type { Locale } from "@/i18n/types"

export function Providers({
  initialLocale,
  children,
}: {
  initialLocale: Locale
  children: React.ReactNode
}) {
  return (
    <LanguageProvider initialLocale={initialLocale}>
      <LeadAttributionCapture />
      {children}
    </LanguageProvider>
  )
}
