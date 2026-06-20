export type Locale = "ja" | "en" | "zh"

export const LOCALE_COOKIE = "shojuen_locale"

export function parseLocale(value: string | undefined): Locale {
  if (value === "en") return "en"
  if (value === "zh") return "zh"
  return "ja"
}

/** HTML lang attribute value for a locale. */
export function htmlLang(locale: Locale): string {
  if (locale === "en") return "en"
  if (locale === "zh") return "zh-Hant"
  return "ja"
}
