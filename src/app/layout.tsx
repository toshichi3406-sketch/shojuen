import type { Metadata } from "next"
import { cookies } from "next/headers"
import { Geist_Mono, Noto_Sans_JP, Noto_Serif_JP } from "next/font/google"

import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { Providers } from "@/app/providers"
import { LOCALE_COOKIE, parseLocale } from "@/i18n/types"

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
  title: {
    default: "松壽園SHOJUEN | 抹茶のテロワールと濃緑を綴るメディア",
    template: "%s | 松壽園SHOJUEN",
  },
  description:
    "産地の碾茶、品種、石臼挽き、濃茶と薄茶の作法。宇治・西尾をはじめ、抹茶の専門的な記録をお届けします。",
  openGraph: {
    title: "松壽園SHOJUEN",
    description:
      "抹茶の碾茶・茶道・文化。濃緑の一杯とともに読み解く独立メディア。",
    locale: "ja_JP",
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
      lang={initialLocale === "en" ? "en" : "ja"}
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
