import type { MetadataRoute } from "next"

import { getPublishedArticles } from "@/data/articles"
import { absoluteUrl, languageAlternates } from "@/i18n/seo"
import { localizePath } from "@/i18n/routing"
import type { Locale } from "@/i18n/types"

const locales: Locale[] = ["ja", "en", "zh"]

const staticRoutes = [
  "/",
  "/the-matcha",
  "/chawan",
  "/producers",
  "/journal",
  "/how-to",
  "/wholesale",
  "/contact",
]

export default function sitemap(): MetadataRoute.Sitemap {
  const articleRoutes = getPublishedArticles().map(
    (article) => `/journal/${article.slug}`
  )

  return [...staticRoutes, ...articleRoutes].flatMap((basePath) =>
    locales.map((locale) => ({
      url: absoluteUrl(localizePath(basePath, locale)),
      alternates: {
        languages: languageAlternates(basePath),
      },
      changeFrequency: basePath.startsWith("/journal") ? "weekly" : "monthly",
      priority:
        basePath === "/"
          ? 1
          : basePath === "/wholesale"
            ? 0.9
            : basePath.startsWith("/journal/")
              ? 0.6
              : 0.7,
    }))
  )
}
