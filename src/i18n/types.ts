export type Locale = "ja" | "en"

export const LOCALE_COOKIE = "shojuen_locale"

export function parseLocale(value: string | undefined): Locale {
  return value === "en" ? "en" : "ja"
}
