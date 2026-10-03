import type { Locale } from "@/i18n/types"

const LOCALE_PREFIXES = ["en", "zh"] as const

export function localeFromPathname(pathname: string): Locale | null {
  if (pathname === "/en" || pathname.startsWith("/en/")) return "en"
  if (pathname === "/zh" || pathname.startsWith("/zh/")) return "zh"
  return null
}

export function stripLocalePrefix(pathname: string): string {
  for (const locale of LOCALE_PREFIXES) {
    if (pathname === `/${locale}`) return "/"
    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(locale.length + 1) || "/"
    }
  }

  return pathname || "/"
}

export function localizePath(href: string, locale: Locale): string {
  const url = new URL(href, "https://shojuen.local")
  const basePath = stripLocalePrefix(url.pathname)

  const localizedPath =
    locale === "ja"
      ? basePath
      : basePath === "/"
        ? `/${locale}`
        : `/${locale}${basePath}`

  return `${localizedPath}${url.search}${url.hash}`
}
