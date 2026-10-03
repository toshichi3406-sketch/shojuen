import type { Metadata } from "next"

import type { Locale } from "@/i18n/types"
import { localizePath, stripLocalePrefix } from "@/i18n/routing"

export const SITE_ORIGIN = "https://ochanoshojuen.com"

type SeoText = {
  title: string
  description: string
}

export type SeoRoute =
  | "wholesale"
  | "matcha"
  | "chawan"
  | "producers"
  | "journal"
  | "howTo"
  | "contact"

export const siteSeo: Record<Locale, SeoText> = {
  ja: {
    title: "松壽園｜抹茶・碾茶・ほうじ茶の卸売・輸出",
    description:
      "日本各地の抹茶・碾茶・ほうじ茶を、カフェ・ブランド・輸入事業者向けにご提案。用途、味、色、数量、ご予算に合わせて卸売・輸出をサポートします。",
  },
  en: {
    title: "SHOJUEN | Japanese Matcha, Tencha & Hojicha Wholesale",
    description:
      "Japanese matcha, tencha and hojicha for cafes, brands, importers and distributors. Wholesale and export consultation based on use, flavor, color, volume and budget.",
  },
  zh: {
    title: "松壽園 SHOJUEN｜日本抹茶・碾茶・焙茶批發與出口",
    description:
      "提供日本抹茶、碾茶與焙茶的批發與出口洽詢，服務咖啡館、品牌商、進口商與經銷商，並依用途、風味、色澤、採購量與預算協助選品。",
  },
}

const routeSeo: Record<SeoRoute, Record<Locale, SeoText>> = {
  wholesale: {
    ja: {
      title: "WHOLESALE · 抹茶・日本茶の卸売・輸出",
      description:
        "カフェ、ブランド、輸入・卸売事業者向けに、抹茶・碾茶・ほうじ茶をご提案。小ロットのお試しから継続供給、輸出までご相談いただけます。",
    },
    en: {
      title: "WHOLESALE · Japanese Matcha & Tea Wholesale",
      description:
        "Japanese matcha, tencha and hojicha wholesale for cafes, brands, importers and distributors. From small test orders to ongoing export supply.",
    },
    zh: {
      title: "WHOLESALE · 日本抹茶與茶葉批發・出口",
      description:
        "提供咖啡館、品牌商、進口商與經銷商日本抹茶、碾茶與焙茶批發服務，可從小量測試開始，並洽談長期供貨與出口。",
    },
  },
  matcha: {
    ja: {
      title: "THE MATCHA · 抹茶図鑑",
      description:
        "抹茶の産地、品種、製法、色、香り、味わいを紹介。用途に合う抹茶選びの参考になる情報を松壽園SHOJUENがまとめています。",
    },
    en: {
      title: "THE MATCHA · Japanese Matcha Guide",
      description:
        "A practical guide to Japanese matcha origins, cultivars, production, color, aroma and flavor by SHOJUEN.",
    },
    zh: {
      title: "THE MATCHA · 日本抹茶指南",
      description:
        "介紹日本抹茶的產地、品種、製法、色澤、香氣與風味，作為挑選適合用途之抹茶的參考。",
    },
  },
  chawan: {
    ja: {
      title: "CHAWAN · 抹茶椀カタログ",
      description:
        "抹茶を楽しむための茶碗を紹介。作風や形、使い方を見ながら、松壽園SHOJUENが選んだ器をご覧いただけます。",
    },
    en: {
      title: "CHAWAN · Japanese Matcha Bowls",
      description:
        "A curated selection of Japanese matcha bowls, with notes on form, character and use.",
    },
    zh: {
      title: "CHAWAN · 日本抹茶碗",
      description:
        "精選日本抹茶碗，從器形、風格與實際使用方式介紹每件器物的特色。",
    },
  },
  producers: {
    ja: {
      title: "PRODUCERS · 生産者と産地",
      description:
        "茶づくりに向き合う生産者や産地の背景を紹介。畑、品種、製茶など、現地で見たことを松壽園SHOJUENが記録します。",
    },
    en: {
      title: "PRODUCERS · Tea Makers & Origins",
      description:
        "Stories and field notes from Japanese tea producers and growing regions, covering gardens, cultivars and processing.",
    },
    zh: {
      title: "PRODUCERS · 茶農與產地",
      description:
        "記錄日本茶農與產地的故事，從茶園、品種到製茶方式，分享現地所見與背景。",
    },
  },
  journal: {
    ja: {
      title: "JOURNAL",
      description:
        "日本茶の産地、栽培、製茶、抹茶、茶道を、現地取材と実際の飲み比べを交えながら記録する松壽園SHOJUENのJournal。",
    },
    en: {
      title: "JOURNAL",
      description:
        "SHOJUEN field notes on Japanese tea origins, cultivation, processing, matcha and tea culture.",
    },
    zh: {
      title: "JOURNAL",
      description:
        "松壽園 SHOJUEN 的日本茶產地紀錄，分享栽培、製茶、抹茶與茶文化的現地觀察。",
    },
  },
  howTo: {
    ja: {
      title: "HOW TO · 抹茶の点て方・楽しみ方",
      description:
        "薄茶・濃茶の基本から、湯温、抹茶量、茶筅の使い方まで。抹茶をおいしく楽しむための実践的なガイドです。",
    },
    en: {
      title: "HOW TO · Prepare & Enjoy Matcha",
      description:
        "Practical guidance for preparing matcha, including usucha, koicha, water temperature, matcha quantity and whisking.",
    },
    zh: {
      title: "HOW TO · 抹茶沖泡與品飲",
      description:
        "從薄茶、濃茶到水溫、抹茶用量與茶筅使用方式，提供實用的抹茶沖泡指南。",
    },
  },
  contact: {
    ja: {
      title: "CONTACT · お問い合わせ",
      description:
        "松壽園SHOJUENへのお問い合わせ。卸売、輸出、商品、取引についてご相談ください。",
    },
    en: {
      title: "CONTACT · SHOJUEN",
      description:
        "Contact SHOJUEN about wholesale, export, products and business inquiries.",
    },
    zh: {
      title: "CONTACT · 聯絡松壽園",
      description:
        "聯絡松壽園 SHOJUEN，洽詢批發、出口、商品與商務合作。",
    },
  },
}

const brand: Record<Locale, string> = {
  ja: "松壽園",
  en: "SHOJUEN",
  zh: "松壽園 SHOJUEN",
}

const ogLocale: Record<Locale, string> = {
  ja: "ja_JP",
  en: "en_US",
  zh: "zh_TW",
}

export function getRouteSeo(route: SeoRoute, locale: Locale): SeoText {
  return routeSeo[route][locale]
}

export function absoluteUrl(pathname: string): string {
  return new URL(pathname || "/", SITE_ORIGIN).toString()
}

export function languageAlternates(pathname: string) {
  const basePath = stripLocalePrefix(pathname)

  return {
    ja: absoluteUrl(localizePath(basePath, "ja")),
    en: absoluteUrl(localizePath(basePath, "en")),
    "zh-Hant": absoluteUrl(localizePath(basePath, "zh")),
    "x-default": absoluteUrl(localizePath(basePath, "ja")),
  }
}

export function buildLocalizedMetadata({
  locale,
  publicPathname,
  title,
  description,
  root = false,
  image,
}: {
  locale: Locale
  publicPathname: string
  title: string
  description: string
  root?: boolean
  image?: { url: string; alt: string }
}): Metadata {
  const canonical = absoluteUrl(publicPathname)
  const fullTitle = root ? title : `${title} | ${brand[locale]}`
  const alternateLocale = Object.values(ogLocale).filter(
    (value) => value !== ogLocale[locale]
  )

  return {
    metadataBase: new URL(SITE_ORIGIN),
    title: root
      ? {
          default: title,
          template: `%s | ${brand[locale]}`,
        }
      : title,
    description,
    alternates: {
      canonical,
      languages: languageAlternates(publicPathname),
    },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: brand[locale],
      title: fullTitle,
      description,
      locale: ogLocale[locale],
      alternateLocale,
      images: image ? [{ url: image.url, alt: image.alt }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: image ? [image.url] : undefined,
    },
  }
}
