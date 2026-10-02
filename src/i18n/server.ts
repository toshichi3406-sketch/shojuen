import type { Metadata } from "next"
import { cookies, headers } from "next/headers"

import { LOCALE_COOKIE, parseLocale, type Locale } from "@/i18n/types"
import {
  buildLocalizedMetadata,
  getRouteSeo,
  siteSeo,
  type SeoRoute,
} from "@/i18n/seo"

const LOCALE_HEADER = "x-shojuen-locale"
const PUBLIC_PATH_HEADER = "x-shojuen-public-path"

function parseHeaderLocale(value: string | null): Locale | null {
  if (value === "ja" || value === "en" || value === "zh") return value
  return null
}

export async function getSeoRequestContext(): Promise<{
  locale: Locale
  publicPathname: string
}> {
  const requestHeaders = await headers()
  const headerLocale = parseHeaderLocale(requestHeaders.get(LOCALE_HEADER))
  const publicPathname = requestHeaders.get(PUBLIC_PATH_HEADER) || "/"

  if (headerLocale) {
    return { locale: headerLocale, publicPathname }
  }

  const cookieStore = await cookies()
  const locale = parseLocale(cookieStore.get(LOCALE_COOKIE)?.value)

  return { locale, publicPathname }
}

export async function getSiteMetadata(): Promise<Metadata> {
  const { locale, publicPathname } = await getSeoRequestContext()
  const copy = siteSeo[locale]

  return buildLocalizedMetadata({
    locale,
    publicPathname,
    title: copy.title,
    description: copy.description,
    root: true,
  })
}

export async function getRouteMetadata(route: SeoRoute): Promise<Metadata> {
  const { locale, publicPathname } = await getSeoRequestContext()
  const copy = getRouteSeo(route, locale)

  return buildLocalizedMetadata({
    locale,
    publicPathname,
    title: copy.title,
    description: copy.description,
  })
}
