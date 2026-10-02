import { NextResponse, type NextRequest } from "next/server"

const LOCALE_COOKIE = "shojuen_locale"
const LOCALE_HEADER = "x-shojuen-locale"
const PUBLIC_PATH_HEADER = "x-shojuen-public-path"
const YEAR = 60 * 60 * 24 * 365

function localeFromPath(pathname: string): "en" | "zh" | null {
  if (pathname === "/en" || pathname.startsWith("/en/")) return "en"
  if (pathname === "/zh" || pathname.startsWith("/zh/")) return "zh"
  return null
}

function stripLocale(pathname: string, locale: "en" | "zh"): string {
  const stripped = pathname.slice(locale.length + 1)
  return stripped || "/"
}

function prefixedPath(pathname: string, locale: "en" | "zh"): string {
  if (pathname === "/") return `/${locale}`
  return `/${locale}${pathname}`
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const prefixedLocale = localeFromPath(pathname)
  const requestHeaders = new Headers(request.headers)

  requestHeaders.set(PUBLIC_PATH_HEADER, pathname)

  if (prefixedLocale) {
    requestHeaders.set(LOCALE_HEADER, prefixedLocale)

    const destination = request.nextUrl.clone()
    destination.pathname = stripLocale(pathname, prefixedLocale)

    const response = NextResponse.rewrite(destination, {
      request: { headers: requestHeaders },
    })

    response.cookies.set(LOCALE_COOKIE, prefixedLocale, {
      path: "/",
      maxAge: YEAR,
      sameSite: "lax",
    })

    return response
  }

  const savedLocale = request.cookies.get(LOCALE_COOKIE)?.value

  if (savedLocale === "en" || savedLocale === "zh") {
    const destination = request.nextUrl.clone()
    destination.pathname = prefixedPath(pathname, savedLocale)
    return NextResponse.redirect(destination)
  }

  requestHeaders.set(LOCALE_HEADER, "ja")

  return NextResponse.next({
    request: { headers: requestHeaders },
  })
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images).*)",
  ],
}
