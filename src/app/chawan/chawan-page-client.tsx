"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  MailIcon,
  MinusIcon,
  PlusIcon,
  SearchIcon,
  XIcon,
} from "lucide-react"

import {
  chawanAtmosphere,
  chawanKinds,
  chawanStyles,
  styleImages,
  type ChawanColor,
  type ChawanKind,
  type ChawanStyle,
} from "@/data/chawan-catalog"
import { getContactEmail } from "@/data/site-contact"
import { FadeIn, FadeInItem, FadeInStagger } from "@/components/motion/fade-in"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/i18n/language-context"

const HERO_IMG = "/images/chawan/room-garden.png"
const CATALOG_IMG = "/images/chawan/bowls-crate.png"
const PHIL_IMG_L = "/images/chawan/phil-tsukubai.png"
const PHIL_IMG_R = "/images/chawan/phil-tea-tray.png"
/** リードタイム帯は横長セクション向きの写真を使う（縦写真は無理に入れない） */
const LEAD_IMG = chawanAtmosphere.dryingFoot
/** 引用帯：窯元の高台削り出し（bg-fixed でパララックス） */
const QUOTE_IMG = chawanAtmosphere.wheelTrimming
/** CTA：横向き写真（縦写真は帯で見切れるため差し替え） */
const CTA_IMG = chawanAtmosphere.katakuchiCrates

/** 釉調ごとのスウォッチ（実写がない作風のプレースホルダ表現）。すべて仮の色。 */
const glaze: Record<
  ChawanColor,
  { from: string; via?: string; to: string; dot: string }
> = {
  hakuji: { from: "#f7f3ea", via: "#eee7d8", to: "#ddd4c2", dot: "#efe9dd" },
  sometsuke: { from: "#eef2f8", via: "#93add2", to: "#2f4d78", dot: "#3b5a86" },
  seiji: { from: "#dfeae0", via: "#aecabb", to: "#7c9c8a", dot: "#a7c4b3" },
  ruri: { from: "#4360a6", via: "#22407e", to: "#10224a", dot: "#26407e" },
  kuro: { from: "#4b4744", via: "#28241f", to: "#100d0b", dot: "#2a2623" },
  kohiki: { from: "#f3eee2", via: "#e3d7c1", to: "#cdbda2", dot: "#e2d7c4" },
}

function glazeGradient(c: ChawanColor) {
  const g = glaze[c]
  return g.via
    ? `linear-gradient(150deg, ${g.from} 0%, ${g.via} 52%, ${g.to} 100%)`
    : `linear-gradient(150deg, ${g.from} 0%, ${g.to} 100%)`
}

/** 作風の視覚（実写があれば写真、なければ上から見た椀の釉スウォッチ）。 */
function StyleVisual({
  style,
  alt,
  sizes,
  priority,
  imageSrc,
}: {
  style: ChawanStyle
  alt: string
  sizes: string
  priority?: boolean
  imageSrc?: string
}) {
  const src = imageSrc ?? styleImages(style)[0] ?? style.image
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-contain transition duration-[1200ms] ease-out group-hover:scale-[1.02]"
      />
    )
  }
  return (
    <div
      className="absolute inset-0"
      style={{ background: glazeGradient(style.color) }}
      aria-hidden
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(130% 90% at 50% -18%, rgba(255,255,255,0.28), transparent 56%)",
        }}
      />
      <div
        className="absolute left-1/2 top-1/2 aspect-square w-[76%] -translate-x-1/2 -translate-y-1/2 rounded-full transition duration-[1200ms] ease-out group-hover:scale-[1.05]"
        style={{
          background: glazeGradient(style.color),
          boxShadow:
            "0 40px 70px -30px rgba(0,0,0,0.55), inset 0 2px 0 rgba(255,255,255,0.30), inset 0 0 0 1px rgba(0,0,0,0.05)",
        }}
      >
        <div
          className="absolute left-1/2 top-1/2 aspect-square w-[74%] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 50% 38%, rgba(255,255,255,0.10), rgba(0,0,0,0.14) 62%, rgba(0,0,0,0.24))",
            boxShadow:
              "inset 0 8px 22px rgba(0,0,0,0.28), inset 0 -5px 12px rgba(255,255,255,0.12)",
          }}
        />
      </div>
    </div>
  )
}

export function ChawanPageClient() {
  const { locale, m } = useLanguage()
  const [activeKind, setActiveKind] = useState<ChawanKind | "all">("all")
  const [selected, setSelected] = useState<ChawanStyle | null>(null)
  const [photoIdx, setPhotoIdx] = useState(0)
  const [zoomOpen, setZoomOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragRef = useRef<{
    x: number
    y: number
    panX: number
    panY: number
  } | null>(null)

  const filtered = useMemo(
    () =>
      activeKind === "all"
        ? chawanStyles
        : chawanStyles.filter((s) => s.kind === activeKind),
    [activeKind]
  )

  const selectedPhotos = selected ? styleImages(selected) : []

  const openStyle = useCallback((style: ChawanStyle) => {
    setSelected(style)
    setPhotoIdx(0)
    setZoomOpen(false)
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [])

  const closeZoom = useCallback(() => {
    setZoomOpen(false)
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [])

  const closeLightbox = useCallback(() => {
    setSelected(null)
    setPhotoIdx(0)
    setZoomOpen(false)
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [])

  const openZoom = useCallback(() => {
    if (!selectedPhotos.length) return
    setZoomOpen(true)
    setZoom(1.4)
    setPan({ x: 0, y: 0 })
  }, [selectedPhotos.length])

  const bumpZoom = useCallback((delta: number) => {
    setZoom((z) => Math.min(3.5, Math.max(1, Math.round((z + delta) * 10) / 10)))
  }, [])

  const showPrevPhoto = useCallback(() => {
    setPhotoIdx((i) =>
      selectedPhotos.length
        ? (i - 1 + selectedPhotos.length) % selectedPhotos.length
        : 0
    )
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [selectedPhotos.length])

  const showNextPhoto = useCallback(() => {
    setPhotoIdx((i) =>
      selectedPhotos.length ? (i + 1) % selectedPhotos.length : 0
    )
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [selectedPhotos.length])

  useEffect(() => {
    if (!selected) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (zoomOpen) closeZoom()
        else closeLightbox()
        return
      }
      if (zoomOpen) {
        if (e.key === "+" || e.key === "=") bumpZoom(0.3)
        if (e.key === "-" || e.key === "_") bumpZoom(-0.3)
        return
      }
      if (e.key === "ArrowLeft") showPrevPhoto()
      if (e.key === "ArrowRight") showNextPhoto()
    }
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", onKey)
    }
  }, [
    selected,
    zoomOpen,
    closeLightbox,
    closeZoom,
    showPrevPhoto,
    showNextPhoto,
    bumpZoom,
  ])

  const email = getContactEmail()
  const mailto = `mailto:${email}?subject=${encodeURIComponent(m.chawanPage.mailSubject)}`

  const name = (s: ChawanStyle) => (locale === "en" ? s.nameEn : s.nameJa)
  const nameSub = (s: ChawanStyle) => (locale === "en" ? s.nameJa : s.nameEn)
  const tagline = (s: ChawanStyle) =>
    locale === "en" ? s.taglineEn : s.taglineJa
  const shape = (s: ChawanStyle) => (locale === "en" ? s.shapeEn : s.shapeJa)
  const use = (s: ChawanStyle) => (locale === "en" ? s.useEn : s.useJa)
  const size = (s: ChawanStyle) => (locale === "en" ? s.sizeEn : s.sizeJa)
  const material = (s: ChawanStyle) =>
    locale === "en" ? s.materialEn : s.materialJa
  const care = (s: ChawanStyle) => (locale === "en" ? s.careEn : s.careJa)
  const kindLabel = (k: ChawanKind) => m.chawanPage.kinds[k]

  return (
    <div className="bg-[#14110e] text-stone-200">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative flex min-h-[92vh] items-end overflow-hidden">
        <Image
          src={HERO_IMG}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#14110e] via-[#14110e]/55 to-black/30" />
        <div className="absolute inset-0 bg-black/25" />
        <div className="relative mx-auto w-full max-w-6xl px-6 pb-24 sm:pb-32">
          <FadeIn>
            <p className="text-xs font-medium uppercase tracking-[0.5em] text-stone-300">
              {m.chawanPage.heroKicker}
            </p>
            <h1 className="font-heading mt-6 max-w-3xl text-5xl font-medium leading-[1.12] tracking-wide text-stone-50 drop-shadow-sm sm:text-6xl md:text-7xl">
              {m.chawanPage.title}
            </h1>
            <p className="mt-7 max-w-xl text-sm leading-relaxed text-stone-200/90 sm:text-base">
              {m.chawanPage.heroLead}
            </p>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs tracking-[0.2em] text-stone-300">
              {m.chawanPage.heroBadges.map((b, i) => (
                <li key={b} className="flex items-center gap-6">
                  {i > 0 && (
                    <span className="hidden h-3 w-px bg-stone-400/40 sm:inline-block" />
                  )}
                  {b}
                </li>
              ))}
            </ul>
          </FadeIn>
        </div>
        <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[0.65rem] uppercase tracking-[0.4em] text-stone-300/80">
          {m.chawanPage.heroScroll}
        </span>
      </section>

      {/* ── Clay / pottery thesis (draft) ────────────────────── */}
      <section className="relative overflow-hidden border-t border-stone-500/20">
        <div className="grid lg:grid-cols-12">
          <div className="relative min-h-[42vh] lg:col-span-5 lg:min-h-full">
            <Image
              src="/images/chawan/workshop-05-glaze-buckets.png"
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#14110e] via-[#14110e]/25 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-[#14110e]/20 lg:to-[#14110e]" />
          </div>
          <div className="relative lg:col-span-7">
            <div className="flex h-full flex-col justify-center px-6 py-20 sm:px-10 sm:py-24 lg:px-14 lg:py-28">
              <FadeIn>
                <p className="text-xs font-medium uppercase tracking-[0.4em] text-emerald-400/80">
                  {m.chawanPage.clayKicker}
                </p>
                <h2 className="font-heading mt-5 text-3xl font-medium tracking-wide text-stone-50 sm:text-4xl">
                  {m.chawanPage.clayTitle}
                </h2>
                <p className="mt-3 text-sm tracking-[0.12em] text-stone-400 sm:text-base">
                  {m.chawanPage.claySub}
                </p>
                <div className="mt-10 space-y-7 border-l border-emerald-400/30 pl-6">
                  {m.chawanPage.clayStanzas.map((stanza, i) => (
                    <p
                      key={i}
                      className={cn(
                        "max-w-xl leading-[1.95] tracking-wide",
                        i === 1
                          ? "text-[0.95rem] text-stone-100 sm:text-base"
                          : "text-sm text-stone-300 sm:text-[0.95rem]"
                      )}
                    >
                      {stanza}
                    </p>
                  ))}
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* ── Catalogue banner (real bowls, full-bleed) ────────── */}
      <section className="relative flex min-h-[58vh] items-end overflow-hidden sm:min-h-[64vh]">
        <Image
          src={CATALOG_IMG}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#14110e] via-black/25 to-black/70" />
        <div className="relative mx-auto w-full max-w-6xl px-6 pb-16 sm:pb-20">
          <FadeIn>
            <p className="text-xs font-medium uppercase tracking-[0.4em] text-emerald-300/90">
              {m.chawanPage.catalogKicker}
            </p>
            <h2 className="font-heading mt-4 text-3xl font-medium tracking-wide text-stone-50 sm:text-4xl md:text-5xl">
              {m.chawanPage.catalogTitle}
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-stone-200/90 sm:text-base">
              {m.chawanPage.catalogLead}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── Catalogue grid + Terms (paper chapter) ───────────── */}
      <div className="bg-[#f4efe4] text-stone-800">
        <div className="mx-auto max-w-6xl px-6 pb-24 pt-14 sm:pb-32 sm:pt-16">
          {/* editorial filter tabs */}
          <div
            className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3 border-y border-stone-300/70 py-5"
            role="group"
            aria-label={m.chawanPage.filterAria}
          >
            <button
              type="button"
              onClick={() => setActiveKind("all")}
              className={cn(
                "text-sm tracking-wide transition-colors",
                activeKind === "all"
                  ? "text-stone-900 underline decoration-emerald-600/70 decoration-1 underline-offset-8"
                  : "text-stone-500 hover:text-stone-800"
              )}
            >
              {m.chawanPage.filterAll}
            </button>
            {chawanKinds.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setActiveKind(k)}
                className={cn(
                  "text-sm tracking-wide transition-colors",
                  activeKind === k
                    ? "text-stone-900 underline decoration-emerald-600/70 decoration-1 underline-offset-8"
                    : "text-stone-500 hover:text-stone-800"
                )}
              >
                {kindLabel(k)}
              </button>
            ))}
          </div>

          <p className="mt-6 text-center text-xs uppercase tracking-[0.3em] text-stone-500">
            {m.chawanPage.itemCount.replace("{n}", String(filtered.length))}
          </p>

          <FadeInStagger
            key={activeKind}
            className="mt-12 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((style, i) => (
              <FadeInItem key={style.id}>
                <button
                  type="button"
                  onClick={() => openStyle(style)}
                  className="group block w-full text-left"
                  aria-label={`${m.chawanPage.viewDetail}: ${name(style)}`}
                >
                  <figure className="relative aspect-[4/5] overflow-hidden bg-[#ebe6dc] shadow-[0_20px_50px_-25px_rgba(60,50,40,0.4)] ring-1 ring-stone-900/5 transition duration-500 group-hover:shadow-[0_30px_60px_-25px_rgba(60,50,40,0.55)]">
                    <StyleVisual
                      style={style}
                      alt={name(style)}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    {styleImages(style).length > 1 ? (
                      <span className="absolute bottom-4 right-4 rounded-full bg-black/55 px-2.5 py-1 text-[0.65rem] tracking-wide text-white/90 backdrop-blur-sm">
                        {styleImages(style).length}{" "}
                        {m.chawanPage.photoLabel}
                      </span>
                    ) : null}
                  </figure>
                  <div className="mt-5 flex items-baseline gap-3">
                    <span className="font-heading text-sm text-emerald-700/60">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-heading text-lg font-medium leading-snug text-stone-900">
                        {name(style)}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-stone-500">
                        {tagline(style)}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs tracking-wide text-stone-400">
                        <span>{shape(style)}</span>
                        <span>·</span>
                        <span>{use(style)}</span>
                      </div>
                    </div>
                  </div>
                </button>
              </FadeInItem>
            ))}
          </FadeInStagger>

          {filtered.length === 0 && (
            <p className="mt-16 text-center text-stone-500">
              {m.chawanPage.emptyFilter}
            </p>
          )}

          <p className="mt-16 border-t border-stone-300/70 pt-8 text-center text-xs leading-relaxed text-stone-500">
            {m.chawanPage.madeToOrderNote}
          </p>

          {/* Terms */}
          <div className="mt-20">
            <FadeIn className="text-center">
              <p className="text-xs font-medium uppercase tracking-[0.4em] text-emerald-700/80">
                {m.chawanPage.condKicker}
              </p>
              <h2 className="font-heading mt-3 text-2xl font-medium tracking-wide text-stone-900 sm:text-3xl">
                {m.chawanPage.condTitle}
              </h2>
            </FadeIn>
            <dl className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-3">
              {m.chawanPage.conditions.map((cond) => (
                <div key={cond.label} className="text-center">
                  <dt className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-stone-500">
                    {cond.label}
                  </dt>
                  <dd className="font-heading mt-2 text-base text-stone-900">
                    {cond.value}
                  </dd>
                </div>
              ))}
            </dl>
            {m.chawanPage.condNote ? (
              <p className="mt-8 text-center text-xs text-stone-500">
                {m.chawanPage.condNote}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* ── Lead time (kiln shelves as atmosphere, not a gallery) */}
      <section className="relative flex min-h-[78vh] items-end overflow-hidden sm:min-h-[88vh]">
        <Image
          src={LEAD_IMG}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#14110e] via-[#14110e]/55 to-black/35" />
        <div className="relative mx-auto w-full max-w-3xl px-6 pb-20 sm:pb-28">
          <FadeIn>
            <p className="text-xs font-medium uppercase tracking-[0.4em] text-emerald-300/90">
              {m.chawanPage.leadKicker}
            </p>
            <h2 className="font-heading mt-5 text-3xl font-medium tracking-wide text-stone-50 sm:text-4xl md:text-[2.6rem]">
              {m.chawanPage.leadTitle}
            </h2>
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-stone-200/95 sm:text-base">
              {m.chawanPage.leadBody}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── How to order ─────────────────────────────────────── */}
      <section className="relative border-t border-stone-500/20 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <FadeIn>
            <p className="text-xs font-medium uppercase tracking-[0.4em] text-stone-400">
              {m.chawanPage.flowKicker}
            </p>
            <h3 className="font-heading mt-3 text-2xl font-medium tracking-wide text-stone-100 sm:text-3xl">
              {m.chawanPage.flowTitle}
            </h3>
          </FadeIn>
          <FadeInStagger className="mt-12 grid gap-px overflow-hidden rounded-sm bg-stone-500/15 sm:grid-cols-3">
            {m.chawanPage.flowSteps.map((step) => (
              <FadeInItem key={step.step}>
                <div className="flex h-full flex-col bg-[#14110e] p-8">
                  <span className="font-heading text-4xl font-medium text-emerald-400/50">
                    {step.step}
                  </span>
                  <h4 className="font-heading mt-5 text-lg font-medium text-stone-100">
                    {step.title}
                  </h4>
                  <p className="mt-3 text-sm leading-relaxed text-stone-400">
                    {step.body}
                  </p>
                </div>
              </FadeInItem>
            ))}
          </FadeInStagger>
        </div>
      </section>

      {/* ── Quote break（背景固定パララックス） ──────────────── */}
      <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden sm:min-h-[78vh]">
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{ backgroundImage: `url(${QUOTE_IMG})` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-black/60" />
        <FadeIn className="relative mx-auto max-w-3xl px-6 text-center">
          <blockquote>
            <p className="font-heading text-2xl font-medium leading-relaxed tracking-wide text-stone-50 sm:text-3xl md:text-4xl md:leading-relaxed">
              {m.chawanPage.quote}
            </p>
            <footer className="mt-8 text-xs uppercase tracking-[0.35em] text-stone-300">
              {m.chawanPage.quoteAuthor}
            </footer>
          </blockquote>
        </FadeIn>
      </section>

      {/* ── Philosophy ───────────────────────────────────────── */}
      <section className="relative overflow-hidden py-28 sm:py-36">
        {/* Dual background: garden basin | tea setting */}
        <div className="pointer-events-none absolute inset-0 grid grid-rows-2 md:grid-cols-2 md:grid-rows-1">
          <div className="relative min-h-full">
            <Image
              src={PHIL_IMG_L}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover scale-105"
            />
          </div>
          <div className="relative min-h-full">
            <Image
              src={PHIL_IMG_R}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover scale-105"
            />
          </div>
        </div>
        {/* Keep overall black tone; let photos breathe at the edges */}
        <div className="pointer-events-none absolute inset-0 bg-[#0c0a08]/50" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#14110e] via-[#14110e]/72 to-[#14110e]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,_rgba(20,17,14,0.5)_0%,_transparent_68%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-stone-500/30 to-transparent" />

        <div className="relative mx-auto max-w-3xl px-6">
          <FadeIn className="text-center">
            <p className="text-xs font-medium uppercase tracking-[0.45em] text-emerald-300/90">
              {m.chawanPage.philKicker}
            </p>
            <div className="mx-auto mt-5 h-px w-12 bg-emerald-300/50" />
            <h2 className="font-heading mt-10 text-3xl font-medium leading-snug tracking-[0.08em] text-stone-50 drop-shadow-[0_2px_24px_rgba(0,0,0,0.55)] sm:text-4xl md:text-[2.75rem]">
              {m.chawanPage.philLead}
            </h2>
          </FadeIn>

          <div className="mt-14 space-y-12 sm:mt-16 sm:space-y-14">
            {m.chawanPage.philStanzas.map((stanza, i) => (
              <FadeIn key={i}>
                {i > 0 && (
                  <div
                    className="mx-auto mb-12 h-px w-8 bg-stone-300/25 sm:mb-14"
                    aria-hidden
                  />
                )}
                <p
                  className={cn(
                    "mx-auto whitespace-pre-line text-center leading-[2.05] tracking-wide drop-shadow-[0_1px_12px_rgba(0,0,0,0.65)]",
                    i === 0
                      ? "max-w-xl text-[0.95rem] text-stone-100 sm:text-base"
                      : i === m.chawanPage.philStanzas.length - 1
                        ? "max-w-2xl text-[0.95rem] text-stone-100 sm:text-base"
                        : "max-w-2xl text-sm text-stone-200/95 sm:text-[0.95rem]"
                  )}
                >
                  {stanza}
                </p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA (full-bleed landscape) ───────────────────────── */}
      <section className="relative flex min-h-[62vh] items-center justify-center overflow-hidden sm:min-h-[68vh]">
        <Image
          src={CTA_IMG}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative mx-auto w-full max-w-2xl px-6 py-24 text-center sm:py-28">
          <FadeIn>
            <h2 className="font-heading text-3xl font-medium tracking-wide text-stone-50 sm:text-4xl">
              {m.chawanPage.ctaTitle}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-stone-300 sm:text-base">
              {m.chawanPage.ctaBody}
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
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
                  "rounded-full border-white/40 bg-transparent text-stone-100 no-underline hover:bg-white/10 hover:text-white"
                )}
              >
                {m.chawanPage.ctaContact}
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Zoom overlay ────────────────────────────────────── */}
      {selected && zoomOpen && selectedPhotos[photoIdx] ? (
        <div
          className="fixed inset-0 z-[60] flex flex-col bg-black/95"
          role="dialog"
          aria-modal="true"
          aria-label={m.chawanPage.zoomIn}
        >
          <div className="relative z-10 flex items-center justify-between gap-3 px-4 py-3 text-stone-200">
            <p className="text-xs tracking-wide text-stone-400">
              {m.chawanPage.zoomHint}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => bumpZoom(-0.3)}
                className="rounded-full border border-white/20 bg-white/5 p-2 hover:bg-white/10"
                aria-label={m.chawanPage.zoomOut}
              >
                <MinusIcon className="size-4" aria-hidden />
              </button>
              <span className="min-w-[3.5rem] text-center text-xs tabular-nums text-stone-300">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => bumpZoom(0.3)}
                className="rounded-full border border-white/20 bg-white/5 p-2 hover:bg-white/10"
                aria-label={m.chawanPage.zoomIn}
              >
                <PlusIcon className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={closeZoom}
                className="rounded-full border border-white/20 bg-white/5 p-2 hover:bg-white/10"
                aria-label={m.chawanPage.closeZoom}
              >
                <XIcon className="size-4" aria-hidden />
              </button>
            </div>
          </div>
          <div
            className={cn(
              "relative min-h-0 flex-1 overflow-hidden touch-none",
              zoom > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"
            )}
            onClick={() => {
              if (!dragging && zoom <= 1) bumpZoom(0.6)
            }}
            onWheel={(e) => {
              bumpZoom(e.deltaY > 0 ? -0.15 : 0.15)
            }}
            onPointerDown={(e) => {
              if (zoom <= 1) return
              setDragging(true)
              dragRef.current = {
                x: e.clientX,
                y: e.clientY,
                panX: pan.x,
                panY: pan.y,
              }
              ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
            }}
            onPointerMove={(e) => {
              const d = dragRef.current
              if (!d) return
              setPan({
                x: d.panX + (e.clientX - d.x),
                y: d.panY + (e.clientY - d.y),
              })
            }}
            onPointerUp={() => {
              dragRef.current = null
              setDragging(false)
            }}
            onPointerCancel={() => {
              dragRef.current = null
              setDragging(false)
            }}
          >
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transition: dragging ? undefined : "transform 160ms ease-out",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedPhotos[photoIdx]}
                alt={name(selected)}
                className="max-h-[85vh] max-w-[92vw] select-none object-contain"
                draggable={false}
              />
            </div>
          </div>
          {selectedPhotos.length > 1 ? (
            <div className="relative z-10 flex items-center justify-center gap-4 px-4 py-3">
              <button
                type="button"
                onClick={showPrevPhoto}
                className="rounded-full border border-white/20 bg-white/5 p-2 text-stone-100 hover:bg-white/10"
                aria-label={m.chawanPage.prevPhoto}
              >
                <ArrowLeftIcon className="size-4" aria-hidden />
              </button>
              <span className="text-xs tracking-wide text-stone-400">
                {photoIdx + 1} / {selectedPhotos.length}
              </span>
              <button
                type="button"
                onClick={showNextPhoto}
                className="rounded-full border border-white/20 bg-white/5 p-2 text-stone-100 hover:bg-white/10"
                aria-label={m.chawanPage.nextPhoto}
              >
                <ArrowRightIcon className="size-4" aria-hidden />
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* ── Detail modal ─────────────────────────────────────── */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/85 p-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label={name(selected)}
          onClick={closeLightbox}
        >
          <div
            className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-sm border border-white/10 bg-[#1a1613] text-stone-200 shadow-2xl sm:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute right-3 top-3 z-10 rounded-full border border-white/15 bg-black/40 p-2 text-stone-300 transition-colors hover:text-white"
              aria-label={m.chawanPage.closeLightbox}
            >
              <XIcon className="size-4" aria-hidden />
            </button>

            <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-[#1f1a16] sm:aspect-auto sm:w-1/2 sm:min-h-[460px]">
              <button
                type="button"
                onClick={openZoom}
                className="absolute inset-0 z-[1] cursor-zoom-in"
                aria-label={m.chawanPage.zoomIn}
              >
                <StyleVisual
                  style={selected}
                  alt={name(selected)}
                  sizes="(max-width: 640px) 100vw, 50vw"
                  priority
                  imageSrc={selectedPhotos[photoIdx]}
                />
              </button>
              <button
                type="button"
                onClick={openZoom}
                className="absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-2.5 py-1.5 text-[0.7rem] tracking-wide text-stone-100 transition-colors hover:bg-black/70"
              >
                <SearchIcon className="size-3.5" aria-hidden />
                {m.chawanPage.zoomIn}
              </button>
              {selectedPhotos.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={showPrevPhoto}
                    className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/45 p-2 text-stone-100 transition-colors hover:bg-black/65"
                    aria-label={m.chawanPage.prevPhoto}
                  >
                    <ArrowLeftIcon className="size-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={showNextPhoto}
                    className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/45 p-2 text-stone-100 transition-colors hover:bg-black/65"
                    aria-label={m.chawanPage.nextPhoto}
                  >
                    <ArrowRightIcon className="size-4" aria-hidden />
                  </button>
                  <p className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-[0.7rem] tracking-wide text-stone-100">
                    {photoIdx + 1} / {selectedPhotos.length}
                  </p>
                </>
              ) : null}
            </div>

            <div className="flex flex-1 flex-col overflow-y-auto p-7 sm:p-9">
              <h2 className="font-heading text-2xl font-medium text-stone-50 sm:text-3xl">
                {name(selected)}
              </h2>
              <p className="mt-1 text-sm tracking-wide text-stone-400">
                {nameSub(selected)}
              </p>
              <p className="mt-5 text-sm leading-relaxed text-stone-300">
                {tagline(selected)}
              </p>

              <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-5 text-sm">
                <div className="col-span-2">
                  <dt className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-stone-500">
                    {m.chawanPage.sizeLabel}
                  </dt>
                  <dd className="mt-1.5 text-stone-100">{size(selected)}</dd>
                </div>
                {material(selected) ? (
                  <div>
                    <dt className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-stone-500">
                      {m.chawanPage.materialLabel}
                    </dt>
                    <dd className="mt-1.5 text-stone-100">
                      {material(selected)}
                    </dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-stone-500">
                    {m.chawanPage.shapeLabel}
                  </dt>
                  <dd className="mt-1.5 text-stone-100">{shape(selected)}</dd>
                </div>
                <div>
                  <dt className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-stone-500">
                    {m.chawanPage.useLabel}
                  </dt>
                  <dd className="mt-1.5 text-stone-100">{use(selected)}</dd>
                </div>
                {care(selected) ? (
                  <div className="col-span-2">
                    <dt className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-stone-500">
                      {m.chawanPage.careLabel}
                    </dt>
                    <dd className="mt-1.5 text-stone-100">{care(selected)}</dd>
                  </div>
                ) : null}
              </dl>

              <p className="mt-7 border-l-2 border-emerald-500/40 pl-4 text-xs leading-relaxed text-stone-400">
                {m.chawanPage.madeToOrderNote}
              </p>

              <Link
                href={`/contact?from=chawan&id=${encodeURIComponent(selected.id)}&name=${encodeURIComponent(name(selected))}`}
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  buttonVariants({ size: "default" }),
                  "mt-8 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full no-underline"
                )}
              >
                <MailIcon className="size-4 shrink-0" aria-hidden />
                {m.chawanPage.inquireItem}
                <ArrowRightIcon className="size-4 shrink-0" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
