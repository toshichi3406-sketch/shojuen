import type { Locale } from "@/i18n/types"

export function stripLocalePrefix(pathname: string): string {
  if (pathname === "/en" || pathname === "/zh") return "/"
  if (pathname.startsWith("/en/")) return pathname.slice(3) || "/"
  if (pathname.startsWith("/zh/")) return pathname.slice(3) || "/"
  return pathname || "/"
}

export function localizePath(pathname: string, locale: Locale): string {
  const base = stripLocalePrefix(pathname)

  if (locale === "ja") return base
  if (base === "/") return `/${locale}`

  return `/${locale}${base}`
}
