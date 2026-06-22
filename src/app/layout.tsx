import type { Metadata } from "next"
import { cookies } from "next/headers"
import { Geist_Mono, Noto_Sans_JP, Noto_Serif_JP } from "next/font/google"

import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { Providers } from "@/app/providers"
import { LOCALE_COOKIE, htmlLang, parseLocale } from "@/i18n/types"

import "./globals.css"

const notoSans = Noto_Sans_JP({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
})

const notoSerif = Noto_Serif_JP({
  variable: "--font-heading-jp",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://ochanoshojuen.com"),
  title: {
    default:
      "松壽園｜茶農家のこだわりとともに。抹茶・碾茶 卸・輸出",
    template: "%s | 松壽園",
  },
  description:
    "こだわった農家の抹茶・碾茶・ほうじ茶を、Journal を通じて国内外へ卸。職人のこだわりが伝わる一杯を、お手伝いします。info@ochanoshojuen.com",
  openGraph: {
    type: "website",
    url: "https://ochanoshojuen.com",
    siteName: "松壽園",
    title: "松壽園｜茶農家のこだわりとともに。抹茶・碾茶 卸・輸出",
    description:
      "こだわった農家の抹茶・碾茶・ほうじ茶を、Journal を通じて国内外へ卸。職人のこだわりが伝わる一杯を、お手伝いします。",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "松壽園｜茶農家のこだわりとともに。抹茶・碾茶 卸・輸出",
    description:
      "こだわった農家の抹茶・碾茶・ほうじ茶を、Journal を通じて国内外へ卸。",
  },
  alternates: {
    canonical: "https://ochanoshojuen.com",
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const initialLocale = parseLocale(cookieStore.get(LOCALE_COOKIE)?.value)

  return (
    <html
      lang={htmlLang(initialLocale)}
      suppressHydrationWarning
      className={`${notoSans.variable} ${notoSerif.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <Providers initialLocale={initialLocale}>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  )
}
