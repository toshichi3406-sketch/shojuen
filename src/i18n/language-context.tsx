"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { useRouter } from "next/navigation"

import { getMessages, type Messages } from "@/i18n/messages"
import { LOCALE_COOKIE, type Locale, parseLocale } from "@/i18n/types"

type LanguageContextValue = {
  locale: Locale
  setLocale: (next: Locale) => void
  m: Messages
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale
  children: React.ReactNode
}) {
  const router = useRouter()
  const [locale, setLocaleState] = useState<Locale>(initialLocale)

  useEffect(() => {
    setLocaleState(initialLocale)
  }, [initialLocale])

  useEffect(() => {
    document.documentElement.lang = locale === "en" ? "en" : "ja"
  }, [locale])

  const setLocale = useCallback(
    (next: Locale) => {
      setLocaleState(next)
      const maxAge = 60 * 60 * 24 * 365
      document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=${maxAge};SameSite=Lax`
      try {
        localStorage.setItem(LOCALE_COOKIE, next)
      } catch {
        /* ignore */
      }
      router.refresh()
    },
    [router]
  )

  const m = useMemo(() => getMessages(locale), [locale])

  const value = useMemo(
    () => ({ locale, setLocale, m }),
    [locale, setLocale, m]
  )

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return ctx
}

/** Read saved locale on client before hydration (optional sync with cookie). */
export function readStoredLocale(): Locale {
  if (typeof document === "undefined") return "ja"
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${LOCALE_COOKIE}=(ja|en)(?:;|$)`)
  )
  if (match?.[1]) return parseLocale(match[1])
  try {
    const v = localStorage.getItem(LOCALE_COOKIE)
    if (v) return parseLocale(v)
  } catch {
    /* ignore */
  }
  return "ja"
}
