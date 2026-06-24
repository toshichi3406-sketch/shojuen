"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeftIcon, ChevronRightIcon, ImagesIcon, MailIcon, XIcon } from "lucide-react"

import {
  chawanCatalog,
  chawanCategories,
  type ChawanCategory,
  type ChawanItem,
} from "@/data/chawan-catalog"
import { getContactEmail } from "@/data/site-contact"
import { FadeIn, FadeInItem, FadeInStagger } from "@/components/motion/fade-in"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/i18n/language-context"

export function ChawanPageClient() {
  const { locale, m } = useLanguage()
  const [activeCategory, setActiveCategory] = useState<ChawanCategory | "all">(
    "all"
  )
  const [selected, setSelected] = useState<ChawanItem | null>(null)
  const [photoIndex, setPhotoIndex] = useState(0)

  const filtered = useMemo(
    () =>
      activeCategory === "all"
        ? chawanCatalog
        : chawanCatalog.filter((item) => item.category === activeCategory),
    [activeCategory]
  )

  const openLightbox = useCallback((item: ChawanItem) => {
    setSelected(item)
    setPhotoIndex(0)
  }, [])

  const closeLightbox = useCallback(() => setSelected(null), [])

  const photoCount = selected?.images.length ?? 0

  const showPhoto = useCallback(
    (delta: number) => {
      if (photoCount === 0) return
      setPhotoIndex((i) => (i + delta + photoCount) % photoCount)
    },
    [photoCount]
  )

  useEffect(() => {
    if (!selected) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox()
      if (e.key === "ArrowRight") showPhoto(1)
      if (e.key === "ArrowLeft") showPhoto(-1)
    }
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", onKey)
    }
  }, [selected, closeLightbox, showPhoto])

  const email = getContactEmail()
  const mailto = `mailto:${email}?subject=${encodeURIComponent(m.chawanPage.mailSubject)}`

  const categoryLabel = (cat: ChawanCategory) => m.chawanPage.categories[cat]

  return (
    <div className="bg-background">
      <header className="border-b border-border/70 bg-gradient-to-b from-stone-900/[0.06] via-background to-background">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <FadeIn>
            <p className="text-xs font-medium uppercase tracking-[0.45em] text-primary">
              {m.chawanPage.heroKicker}
            </p>
            <h1 className="font-heading mt-4 text-4xl font-medium tracking-wide text-foreground sm:text-5xl">
              {m.chawanPage.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {m.chawanPage.introBefore}
              <strong className="font-medium text-foreground">
                {m.chawanPage.introStrong}
              </strong>
              {m.chawanPage.introAfter}
            </p>
          </FadeIn>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <FadeIn>
          <div
            className="flex flex-wrap gap-2 border-b border-border/60 pb-8"
            role="group"
            aria-label={m.chawanPage.filterAria}
          >
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={cn(
                "rounded-full border px-4 py-2 text-sm transition-colors",
                activeCategory === "all"
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              {m.chawanPage.filterAll}
            </button>
            {chawanCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm transition-colors",
                  activeCategory === cat
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                )}
              >
                {categoryLabel(cat)}
              </button>
            ))}
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            {m.chawanPage.itemCount.replace("{n}", String(filtered.length))}
          </p>
        </FadeIn>

        <FadeInStagger className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((item) => (
            <FadeInItem key={item.id}>
              <button
                type="button"
                onClick={() => openLightbox(item)}
                className="group w-full text-left"
                aria-label={
                  locale === "en"
                    ? `${m.chawanPage.viewDetail}: ${item.nameEn}`
                    : `${m.chawanPage.viewDetail}：${item.nameJa}`
                }
              >
                <figure className="relative aspect-square overflow-hidden rounded-xl border border-border/80 bg-muted shadow-sm transition-shadow group-hover:border-primary/30 group-hover:shadow-md">
                  <Image
                    src={item.images[0]}
                    alt={
                      locale === "en" ? item.nameEn : item.nameJa
                    }
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                  {item.images.length > 1 && (
                    <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-1 text-[0.7rem] font-medium text-white backdrop-blur-sm">
                      <ImagesIcon className="size-3" aria-hidden />
                      {item.images.length}
                    </span>
                  )}
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent px-3 pb-3 pt-10">
                    <p className="text-xs font-medium text-white/90">
                      {categoryLabel(item.category)}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-sm font-medium leading-snug text-white">
                      {locale === "en" ? item.nameEn : item.nameJa}
                    </p>
                  </figcaption>
                </figure>
              </button>
            </FadeInItem>
          ))}
        </FadeInStagger>

        {filtered.length === 0 && (
          <p className="mt-12 text-center text-muted-foreground">
            {m.chawanPage.emptyFilter}
          </p>
        )}
      </div>

      <section className="border-t border-border/60 bg-muted/30 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <FadeIn>
            <h2 className="font-heading text-2xl font-medium text-foreground sm:text-3xl">
              {m.chawanPage.ctaTitle}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {m.chawanPage.ctaBody}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a
                href={mailto}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "inline-flex items-center gap-2 rounded-full no-underline"
                )}
              >
                <MailIcon className="size-4 shrink-0" aria-hidden />
                {m.chawanPage.ctaMail}
              </a>
              <Link
                href="/contact"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "rounded-full no-underline"
                )}
              >
                {m.chawanPage.ctaContact}
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label={
            locale === "en" ? selected.nameEn : selected.nameJa
          }
          onClick={closeLightbox}
        >
          <div
            className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border/60 bg-background shadow-2xl sm:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute right-3 top-3 z-10 rounded-full border border-border/80 bg-background/90 p-2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={m.chawanPage.closeLightbox}
            >
              <XIcon className="size-4" aria-hidden />
            </button>

            <div className="flex w-full shrink-0 flex-col bg-muted sm:w-1/2">
              <div className="relative aspect-square w-full sm:min-h-[420px] sm:flex-1">
                <Image
                  src={selected.images[photoIndex]}
                  alt={`${
                    locale === "en" ? selected.nameEn : selected.nameJa
                  } (${photoIndex + 1}/${photoCount})`}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
                {photoCount > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => showPhoto(-1)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-black/55 p-2 text-white transition-colors hover:bg-black/75"
                      aria-label={m.chawanPage.prevPhoto}
                    >
                      <ChevronLeftIcon className="size-5" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => showPhoto(1)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-black/55 p-2 text-white transition-colors hover:bg-black/75"
                      aria-label={m.chawanPage.nextPhoto}
                    >
                      <ChevronRightIcon className="size-5" aria-hidden />
                    </button>
                    <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/65 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                      {photoIndex + 1} / {photoCount}
                    </span>
                  </>
                )}
              </div>
              {photoCount > 1 && (
                <div className="flex gap-2 overflow-x-auto bg-background/95 p-3">
                  {selected.images.map((src, i) => (
                    <button
                      key={`${src}-${i}`}
                      type="button"
                      onClick={() => setPhotoIndex(i)}
                      className={cn(
                        "relative size-14 shrink-0 overflow-hidden rounded-md border transition-colors",
                        i === photoIndex
                          ? "border-primary ring-1 ring-primary"
                          : "border-border/70 opacity-70 hover:opacity-100"
                      )}
                      aria-label={`${m.chawanPage.photoLabel} ${i + 1}`}
                      aria-current={i === photoIndex}
                    >
                      <Image
                        src={src}
                        alt=""
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col justify-center p-6 sm:p-8">
              <Badge variant="secondary" className="w-fit font-normal">
                {categoryLabel(selected.category)}
              </Badge>
              <h2 className="font-heading mt-4 text-2xl font-medium text-foreground">
                {locale === "en" ? selected.nameEn : selected.nameJa}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {locale === "en" ? selected.nameJa : selected.nameEn}
              </p>

              <dl className="mt-6 space-y-4 text-sm">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {m.chawanPage.sizeLabel}
                  </dt>
                  <dd className="mt-1 text-foreground">
                    {locale === "en" ? selected.sizeEn : selected.sizeJa}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {m.chawanPage.detailLabel}
                  </dt>
                  <dd className="mt-1 leading-relaxed text-foreground/90">
                    {locale === "en" ? selected.detailEn : selected.detailJa}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {m.chawanPage.refLabel}
                  </dt>
                  <dd className="mt-1 font-mono text-xs text-muted-foreground">
                    {selected.id}
                  </dd>
                </div>
              </dl>

              <a
                href={`mailto:${email}?subject=${encodeURIComponent(
                  `${m.chawanPage.mailSubject} [${selected.id}]`
                )}`}
                className={cn(
                  buttonVariants({ size: "default" }),
                  "mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full no-underline sm:w-auto"
                )}
              >
                <MailIcon className="size-4 shrink-0" aria-hidden />
                {m.chawanPage.inquireItem}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
