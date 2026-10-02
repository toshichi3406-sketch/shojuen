"use client"

import Image from "next/image"
import Link from "next/link"

import { FadeIn } from "@/components/motion/fade-in"
import { buttonVariants } from "@/components/ui/button"
import { getContactEmail } from "@/data/site-contact"
import { useLanguage } from "@/i18n/language-context"
import type { Locale } from "@/i18n/types"
import { cn } from "@/lib/utils"

const otsuka = {
  hero: "/images/wholesale/otsuka-hero.jpg",
  cultivation: "/images/wholesale/otsuka-cultivation.jpg",
  process: "/images/wholesale/otsuka-process.jpg",
  grinding: "/images/wholesale/otsuka-grinding.jpg",
} as const

const ureshino = {
  field: "/images/journal/ureshino_20260620/01-tea-field-mist.png",
  rows: "/images/journal/ureshino_20260620/03-tea-garden-rows.png",
  powder: "/images/journal/ureshino_20260620/06-matcha-powder-bowl.png",
  tasting: "/images/journal/ureshino_20260620/04-matcha-bowl-whisk.png",
} as const

type WholesaleCopy = {
  heroKicker: string
  heroTitle: string
  heroLead: string
  heroCta: string
  journalCta: string
  heroNote: string
  trustLabels: readonly string[]
  originKicker: string
  originTitle: string
  originBody: string
  originPhotoCaption: string
  fieldPhotoCaption: string
  processKicker: string
  processTitle: string
  processLead: string
  processPoints: readonly string[]
  processPhotoCaption: string
  fieldKicker: string
  fieldTitle: string
  fieldLead: string
  fieldNotes: readonly string[]
  useKicker: string
  useTitle: string
  useLead: string
  uses: readonly { title: string; body: string }[]
  originsKicker: string
  originsTitle: string
  originsBody: string
  flowKicker: string
  flowTitle: string
  steps: readonly { no: string; title: string; body: string }[]
  inquiryKicker: string
  inquiryTitle: string
  inquiryBody: string
  inquiryFields: readonly string[]
  inquiryCta: string
}

const copy: Record<Locale, WholesaleCopy> = {
  ja: {
    heroKicker: "SHOJUEN · 卸売 / 輸出",
    heroTitle: "用途に合う日本茶を、産地から。",
    heroLead:
      "カフェ、ブランド、輸入・卸売事業者向けに、抹茶・碾茶・ほうじ茶をご提案します。産地や銘柄を先に決めるのではなく、用途、味、色、必要量、ご予算を伺いながら最適な選択肢を一緒に探します。",
    heroCta: "卸売・輸出について相談する",
    journalCta: "産地の記録を見る",
    heroNote: "小ロットでのお試しから、継続的なお取引までご相談いただけます。",
    trustLabels: ["MATCHA", "TENCHA", "HOJICHA", "SMALL LOT", "EXPORT"],
    originKicker: "WHOLESALE APPROACH",
    originTitle: "用途に合わせて、選ぶ。",
    originBody:
      "松壽園では、特定の農園や一つの産地に限定せず、現地での確認や飲み比べを重ねながら、用途と条件に合う茶をご提案しています。味や色だけでなく、必要量や価格、継続供給のしやすさまで含めて選びます。",
    originPhotoCaption: "日本の茶産地",
    fieldPhotoCaption: "産地での記録",
    processKicker: "FROM FIELD TO PRODUCT",
    processTitle: "畑から製茶まで、品質の背景を確かめる。",
    processLead:
      "茶畑の状態や製造工程を知ることは、最終的な色・香り・味を見極めるうえで大切です。栽培から製茶、研磨までの流れを踏まえたうえで、実際の用途に合うものを選定します。",
    processPoints: [
      "ラテ、薄茶、菓子、物販など、用途ごとに必要な特性を整理",
      "味と色に加え、価格と必要量も合わせて比較",
      "輸出先や継続供給の条件まで含めて候補を絞る",
    ],
    processPhotoCaption: "日本の茶産地・製茶風景",
    fieldKicker: "HOW WE SELECT",
    fieldTitle: "実際に飲んで、用途との相性を確かめる。",
    fieldLead:
      "粉の色やスペックだけで判断せず、実際に点てたり抽出したりしながら、香り、味、余韻を確認します。カフェ用途では、ミルクやレシピとの相性まで見てご提案します。",
    fieldNotes: [
      "見た目だけでなく、抽出後の香りと味を確認",
      "カフェ用途では、ミルクやレシピとの相性もチェック",
      "商品化に必要な価格、数量、供給の安定性まで考慮",
    ],
    useKicker: "CHOOSE BY USE",
    useTitle: "用途が違えば、選ぶ抹茶も変わります。",
    useLead:
      "ラテ、薄茶、菓子、物販では、求められる色、香り、味、価格のバランスが異なります。まず用途をお聞かせいただければ、条件に合う候補を絞り込みます。",
    uses: [
      {
        title: "Cafe / Latte",
        body: "ミルクに合わせたときの香り・色・価格のバランスを重視して選びます。",
      },
      {
        title: "Straight tea",
        body: "薄茶やストレートで楽しむ場合は、旨味、香り、余韻を重視します。",
      },
      {
        title: "Retail / Brand",
        body: "小売・自社ブランド向け。価格帯やストーリー性、継続供給まで含めてご相談いただけます。",
      },
      {
        title: "Bakery / Food",
        body: "焼成後の色残りや香り、原価とのバランスを見ながら選定します。",
      },
    ],
    originsKicker: "MULTIPLE ORIGINS",
    originsTitle: "産地を限定せず、条件に合うものを。",
    originsBody:
      "宇治、八女、嬉野、鹿児島、宮崎など、各地の茶を比較しながら、時期、用途、ご予算、必要量に合わせてご提案します。",
    flowKicker: "HOW WHOLESALE WORKS",
    flowTitle: "ご相談からお取引まで。",
    steps: [
      {
        no: "01",
        title: "用途・条件を伺う",
        body: "納品国、用途、月間使用量、ご予算など、分かる範囲でお知らせください。",
      },
      {
        no: "02",
        title: "候補をご提案",
        body: "用途と条件に合わせて、産地やグレードを比較しながら候補を絞ります。",
      },
      {
        no: "03",
        title: "サンプルで確認",
        body: "対応可能な商品は、サンプルや小ロットからお試しいただけます。",
      },
      {
        no: "04",
        title: "輸出・継続供給",
        body: "梱包、数量、納期、輸入時の必要事項を確認し、継続取引へつなげます。",
      },
    ],
    inquiryKicker: "START A CONVERSATION",
    inquiryTitle: "お探しの用途を、まずはお聞かせください。",
    inquiryBody:
      "品種名やグレードが分からなくても問題ありません。用途と条件を伺いながら、候補を整理してご提案します。",
    inquiryFields: [
      "会社・ブランド名",
      "納品国",
      "用途",
      "月間のおおよその使用量",
      "ご希望の価格帯（あれば）",
    ],
    inquiryCta: "卸売について問い合わせる",
  },
  en: {
    heroKicker: "SHOJUEN · WHOLESALE / EXPORT",
    heroTitle: "Japanese matcha & tea for your business.",
    heroLead:
      "Matcha, tencha and hojicha for cafes, brands, importers and distributors. We do not start with a grade name. We start with your use, flavor, color, volume and target price.",
    heroCta: "Start a wholesale inquiry",
    journalCta: "See our field notes",
    heroNote: "From small test orders to ongoing wholesale supply.",
    trustLabels: ["MATCHA", "TENCHA", "HOJICHA", "SMALL LOT", "EXPORT"],
    originKicker: "WHOLESALE APPROACH",
    originTitle: "Choose tea by the job it needs to do.",
    originBody:
      "SHOJUEN is not a wholesale page for promoting one farm or one origin. We visit, taste and compare, then propose options around your use, flavor, color, volume and target price. The photography is here to show the background behind that work.",
    originPhotoCaption: "Tea fields in Japan",
    fieldPhotoCaption: "Field notes from tea country",
    processKicker: "FROM FIELD TO PRODUCT",
    processTitle: "The photos are context. Your product is the focus.",
    processLead:
      "We look across cultivation, processing and powder production to understand color, aroma, flavor and handling. The goal is not to feature one producer, but to find tea that fits a cafe, brand, importer or distributor.",
    processPoints: [
      "Define the right traits for latte, usucha, bakery or resale",
      "Compare flavor and color together with price and required volume",
      "Narrow options with destination and continuity of supply in mind",
    ],
    processPhotoCaption: "Tea fields and production in Japan",
    fieldKicker: "HOW WE SELECT",
    fieldTitle: "We look beyond the specification sheet.",
    fieldLead:
      "What we see at origin matters, but so does what happens in the cup. We compare color, aroma and taste, then translate those differences into practical choices for wholesale buyers.",
    fieldNotes: [
      "Compare aroma and finish, not only powder color",
      "For cafe use, check how the tea behaves with milk and recipes",
      "Consider price, volume and continuity before proposing an option",
    ],
    useKicker: "CHOOSE BY USE",
    useTitle: "Not just “what grade?” — what are you making?",
    useLead:
      "A latte, usucha, pastry and retail tin need different tea. Tell us the job first and we can narrow the options faster.",
    uses: [
      {
        title: "Cafe / Latte",
        body: "A practical balance of aroma, green color and cost that holds up in milk.",
      },
      {
        title: "Straight tea",
        body: "For usucha and straight serves where umami, aroma and finish matter.",
      },
      {
        title: "Retail / Brand",
        body: "For resale and branded products, including price positioning, story and continuity.",
      },
      {
        title: "Bakery / Food",
        body: "Selected with baked color, aroma retention and recipe cost in mind.",
      },
    ],
    originsKicker: "MULTIPLE ORIGINS",
    originsTitle: "One origin is not the only answer.",
    originsBody:
      "Uji, Yame, Ureshino, Kagoshima, Miyazaki and more. We compare by season, use, budget and required volume.",
    flowKicker: "HOW WHOLESALE WORKS",
    flowTitle: "Keep the first conversation simple.",
    steps: [
      { no: "01", title: "Tell us the use", body: "Country, use, monthly volume and target price — whatever you know." },
      { no: "02", title: "We shortlist", body: "We compare origins and options against the job." },
      { no: "03", title: "Test", body: "Where available, begin with samples or a small lot." },
      { no: "04", title: "Export & supply", body: "We align packing, quantity, timing and importer requirements." },
    ],
    inquiryKicker: "START A CONVERSATION",
    inquiryTitle: "Tell us the cup you want to make.",
    inquiryBody:
      "You do not need to know the cultivar or grade in advance. We can narrow the options with you.",
    inquiryFields: ["Company / brand", "Destination country", "Use", "Approx. monthly volume", "Target price, if any"],
    inquiryCta: "Email wholesale inquiry",
  },
  zh: {
    heroKicker: "SHOJUEN · 批發 / 出口",
    heroTitle: "從產地出發，找到適合您商品的日本茶。",
    heroLead:
      "我們提供抹茶、碾茶與焙茶的批發與出口洽詢，服務咖啡館、品牌商、進口商與經銷商。不是先套用固定等級，而是依用途、風味、色澤、採購量與預算，一起篩選合適的選項。",
    heroCta: "洽詢批發與出口",
    journalCta: "查看產地紀錄",
    heroNote: "可從小量測試開始，也歡迎洽談長期穩定供應。",
    trustLabels: ["MATCHA", "TENCHA", "HOJICHA", "SMALL LOT", "EXPORT"],
    originKicker: "WHOLESALE APPROACH",
    originTitle: "依用途，挑選真正合適的茶。",
    originBody:
      "松壽園不侷限於單一茶園或產地。我們會實際了解產地與製茶現場，並透過品飲比較，依用途、風味、色澤、採購量、預算與供貨條件，提供適合的選擇。",
    originPhotoCaption: "日本茶產地",
    fieldPhotoCaption: "產地紀錄",
    processKicker: "FROM FIELD TO PRODUCT",
    processTitle: "從茶園到製茶，了解影響品質的每個環節。",
    processLead:
      "除了成品本身，我們也重視栽培與製程。透過了解茶葉如何被種植、加工與研磨，判斷色澤、香氣、風味與實際使用時的表現，再選出符合需求的茶。",
    processPoints: [
      "依拿鐵、薄茶、烘焙、零售等用途整理需求",
      "同時比較風味、色澤、價格與採購量",
      "將出口目的地與穩定供貨條件一併納入考量",
    ],
    processPhotoCaption: "日本茶園與製茶風景",
    fieldKicker: "HOW WE SELECT",
    fieldTitle: "實際沖泡與品飲，確認是否適合您的用途。",
    fieldLead:
      "我們不只看粉末顏色和規格，也會實際沖泡、品飲，確認香氣、口感與尾韻。若是咖啡館用途，也會一併考量搭配牛奶或配方後的表現。",
    fieldNotes: [
      "不只看外觀，也確認沖泡後的香氣與風味",
      "咖啡館用途會確認與牛奶、配方的搭配表現",
      "提案時同時考量價格、採購量與供貨穩定性",
    ],
    useKicker: "CHOOSE BY USE",
    useTitle: "用途不同，適合的抹茶也不同。",
    useLead:
      "拿鐵、薄茶、烘焙與零售商品，各自需要不同的色澤、香氣、風味與成本條件。先告訴我們用途，就能更快縮小適合的選擇。",
    uses: [
      {
        title: "Cafe / Latte",
        body: "重視與牛奶搭配後仍能保有香氣、色澤，以及整體成本的平衡。",
      },
      {
        title: "Straight tea",
        body: "適合薄茶或直接品飲，著重鮮味、香氣與尾韻。",
      },
      {
        title: "Retail / Brand",
        body: "適合零售與自有品牌，也可一併討論價格帶、產品故事與穩定供貨。",
      },
      {
        title: "Bakery / Food",
        body: "考量烘焙後的色澤、香氣保留與配方成本。",
      },
    ],
    originsKicker: "MULTIPLE ORIGINS",
    originsTitle: "不綁定單一產地，依條件選擇。",
    originsBody:
      "宇治、八女、嬉野、鹿兒島、宮崎等地皆可納入比較，並依季節、用途、預算與需求量提供建議。",
    flowKicker: "HOW WHOLESALE WORKS",
    flowTitle: "從洽詢到長期供應。",
    steps: [
      {
        no: "01",
        title: "提供用途與條件",
        body: "告訴我們出貨國家、用途、每月用量與預算，提供目前已知的資訊即可。",
      },
      {
        no: "02",
        title: "提出合適選項",
        body: "依用途與條件，比較不同產地與等級，協助縮小範圍。",
      },
      {
        no: "03",
        title: "先以樣品確認",
        body: "可提供的商品，可先從樣品或小量測試開始。",
      },
      {
        no: "04",
        title: "出口與持續供貨",
        body: "確認包裝、數量、交期與進口端所需資訊後，銜接後續供貨。",
      },
    ],
    inquiryKicker: "START A CONVERSATION",
    inquiryTitle: "先告訴我們，您想做什麼樣的產品。",
    inquiryBody:
      "不需要先知道品種或等級。我們會依用途與條件，協助整理並提出適合的選項。",
    inquiryFields: [
      "公司 / 品牌名稱",
      "出貨目的地",
      "用途",
      "預估每月用量",
      "預算或目標價格（如有）",
    ],
    inquiryCta: "洽詢批發與出口",
  },

}

function PhotoCaption({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
      {children}
    </p>
  )
}

export function WholesalePageClient() {
  const { locale } = useLanguage()
  const t = copy[locale]
  const email = getContactEmail()
  const subject = encodeURIComponent(
    locale === "ja"
      ? "【松壽園SHOJUEN】卸売・輸出のお問い合わせ"
      : locale === "zh"
        ? "【松壽園SHOJUEN】批發・出口諮詢"
        : "[SHOJUEN] Wholesale & export inquiry"
  )
  const mailto = `mailto:${email}?subject=${subject}`

  return (
    <div className="bg-background">
      <section className="relative min-h-[76vh] overflow-hidden border-b border-border/70 bg-stone-950">
        <Image
          src={otsuka.hero}
          alt={t.originPhotoCaption}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-stone-950/95 via-stone-950/70 to-emerald-950/25"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-transparent to-stone-950/25"
          aria-hidden
        />

        <div className="relative mx-auto flex min-h-[76vh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 sm:pb-24">
          <FadeIn>
            <p className="text-xs font-medium uppercase tracking-[0.42em] text-emerald-100/90">
              {t.heroKicker}
            </p>
            <h1 className="mt-5 max-w-4xl font-heading text-4xl font-medium leading-[1.08] tracking-wide text-white sm:text-6xl lg:text-7xl">
              {t.heroTitle}
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-relaxed text-stone-200 sm:text-lg">
              {t.heroLead}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href={mailto}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "rounded-full px-7 no-underline"
                )}
              >
                {t.heroCta}
              </a>
              <Link
                href="/journal"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "rounded-full border-white/35 bg-white/10 px-7 text-white no-underline backdrop-blur-sm hover:bg-white/20"
                )}
              >
                {t.journalCta}
              </Link>
            </div>
            <p className="mt-5 text-sm text-stone-300">{t.heroNote}</p>
          </FadeIn>

          <div className="mt-12 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/15 pt-5">
            {t.trustLabels.map((label) => (
              <span
                key={label}
                className="font-mono text-[0.68rem] tracking-[0.22em] text-stone-300"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border/70">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
          <FadeIn>
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
              {t.originKicker}
            </p>
            <div className="mt-5 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <h2 className="font-heading text-3xl font-medium leading-tight tracking-wide text-foreground sm:text-5xl">
                {t.originTitle}
              </h2>
              <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {t.originBody}
              </p>
            </div>
          </FadeIn>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            <FadeIn>
              <div className="group relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-muted">
                <Image
                  src={otsuka.hero}
                  alt={t.originPhotoCaption}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.025]"
                />
              </div>
              <PhotoCaption>{t.originPhotoCaption}</PhotoCaption>
            </FadeIn>

            <FadeIn delay={0.08}>
              <div className="group relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-muted">
                <Image
                  src={ureshino.field}
                  alt={t.fieldPhotoCaption}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.025]"
                />
              </div>
              <PhotoCaption>{t.fieldPhotoCaption}</PhotoCaption>
            </FadeIn>
          </div>
        </div>
      </section>

      <section className="border-b border-border/70 bg-stone-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
            <FadeIn>
              <p className="text-xs font-medium uppercase tracking-[0.35em] text-emerald-200/85">
                {t.processKicker}
              </p>
              <h2 className="mt-5 font-heading text-3xl font-medium leading-tight tracking-wide sm:text-5xl">
                {t.processTitle}
              </h2>
              <p className="mt-6 text-base leading-relaxed text-stone-300">
                {t.processLead}
              </p>
              <div className="mt-8 space-y-4">
                {t.processPoints.map((point, i) => (
                  <div
                    key={point}
                    className="flex gap-4 border-t border-white/12 pt-4"
                  >
                    <span className="font-mono text-xs text-emerald-200/70">
                      0{i + 1}
                    </span>
                    <p className="text-sm leading-relaxed text-stone-200">
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            </FadeIn>

            <div className="grid gap-4 sm:grid-cols-2">
              <FadeIn>
                <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-stone-900">
                  <Image
                    src={otsuka.cultivation}
                    alt={t.processTitle}
                    fill
                    sizes="(min-width: 640px) 30vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </FadeIn>
              <FadeIn delay={0.08} className="sm:pt-12">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-stone-900">
                  <Image
                    src={otsuka.process}
                    alt={t.processTitle}
                    fill
                    sizes="(min-width: 640px) 30vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </FadeIn>
              <FadeIn className="sm:col-span-2">
                <div className="relative aspect-[16/7] overflow-hidden rounded-[2rem] bg-stone-900">
                  <Image
                    src={otsuka.grinding}
                    alt={t.processTitle}
                    fill
                    sizes="(min-width: 1024px) 55vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <p className="mt-3 text-xs leading-relaxed text-stone-400">
                  {t.processPhotoCaption}
                </p>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border/70">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
          <FadeIn>
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
              {t.fieldKicker}
            </p>
            <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-end">
              <h2 className="font-heading text-3xl font-medium leading-tight tracking-wide text-foreground sm:text-5xl">
                {t.fieldTitle}
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
                {t.fieldLead}
              </p>
            </div>
          </FadeIn>

          <div className="mt-12 grid gap-4 lg:grid-cols-12">
            <FadeIn className="lg:col-span-7">
              <div className="relative aspect-[16/10] overflow-hidden rounded-[2rem] bg-muted">
                <Image
                  src={ureshino.rows}
                  alt={t.fieldPhotoCaption}
                  fill
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  className="object-cover"
                />
              </div>
            </FadeIn>
            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
              <FadeIn delay={0.06}>
                <div className="relative aspect-[16/9] overflow-hidden rounded-[2rem] bg-muted">
                  <Image
                    src={ureshino.powder}
                    alt={t.fieldTitle}
                    fill
                    sizes="(min-width: 1024px) 40vw, 50vw"
                    className="object-cover"
                  />
                </div>
              </FadeIn>
              <FadeIn delay={0.1}>
                <div className="relative aspect-[16/9] overflow-hidden rounded-[2rem] bg-muted">
                  <Image
                    src={ureshino.tasting}
                    alt={t.fieldTitle}
                    fill
                    sizes="(min-width: 1024px) 40vw, 50vw"
                    className="object-cover"
                  />
                </div>
              </FadeIn>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {t.fieldNotes.map((note, i) => (
              <FadeIn key={note} delay={i * 0.05}>
                <div className="border-t border-border pt-4">
                  <span className="font-mono text-xs text-primary">0{i + 1}</span>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {note}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border/70 bg-muted/25">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
          <FadeIn>
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
              {t.useKicker}
            </p>
            <h2 className="mt-5 max-w-4xl font-heading text-3xl font-medium leading-tight tracking-wide text-foreground sm:text-5xl">
              {t.useTitle}
            </h2>
            <p className="mt-6 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t.useLead}
            </p>
          </FadeIn>

          <div className="mt-12 grid gap-x-8 gap-y-9 sm:grid-cols-2">
            {t.uses.map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.04}>
                <div className="border-t border-border pt-5">
                  <h3 className="font-heading text-2xl font-medium text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-border/70">
        <div className="absolute inset-0">
          <Image
            src={ureshino.field}
            alt={t.fieldPhotoCaption}
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-stone-950/78" aria-hidden />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-white sm:px-6 lg:py-28">
          <FadeIn>
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-emerald-200/85">
              {t.originsKicker}
            </p>
            <h2 className="mt-5 max-w-3xl font-heading text-3xl font-medium leading-tight tracking-wide sm:text-5xl">
              {t.originsTitle}
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-stone-300 sm:text-lg">
              {t.originsBody}
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              {["UJI", "YAME", "URESHINO", "KAGOSHIMA", "MIYAZAKI"].map(
                (origin) => (
                  <span
                    key={origin}
                    className="rounded-full border border-white/20 bg-white/[0.06] px-4 py-2 font-mono text-xs tracking-[0.18em] text-stone-200"
                  >
                    {origin}
                  </span>
                )
              )}
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="border-b border-border/70">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
          <FadeIn>
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
              {t.flowKicker}
            </p>
            <h2 className="mt-5 font-heading text-3xl font-medium tracking-wide text-foreground sm:text-5xl">
              {t.flowTitle}
            </h2>
          </FadeIn>

          <div className="mt-12 grid gap-7 md:grid-cols-2 lg:grid-cols-4">
            {t.steps.map((step, i) => (
              <FadeIn key={step.no} delay={i * 0.05}>
                <div className="border-t border-border pt-5">
                  <p className="font-mono text-xs tracking-[0.2em] text-primary">
                    {step.no}
                  </p>
                  <h3 className="mt-4 font-heading text-xl font-medium text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28">
          <FadeIn>
            <div className="grid gap-10 rounded-[2.5rem] border border-border bg-primary/[0.045] p-7 sm:p-10 lg:grid-cols-[1fr_0.8fr] lg:p-12">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
                  {t.inquiryKicker}
                </p>
                <h2 className="mt-5 font-heading text-3xl font-medium leading-tight tracking-wide text-foreground sm:text-5xl">
                  {t.inquiryTitle}
                </h2>
                <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
                  {t.inquiryBody}
                </p>
                <div className="mt-9">
                  <a
                    href={mailto}
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "rounded-full px-8 no-underline"
                    )}
                  >
                    {t.inquiryCta}
                  </a>
                </div>
                <p className="mt-4 font-mono text-xs text-muted-foreground">
                  {email}
                </p>
              </div>

              <div className="border-t border-border pt-6 lg:border-l lg:border-t-0 lg:pl-9 lg:pt-0">
                <p className="text-sm font-medium text-foreground">
                  {locale === "ja"
                    ? "分かる範囲で教えてください"
                    : locale === "zh"
                      ? "提供目前已知的資訊即可"
                      : "Share what you know"}
                </p>
                <div className="mt-5 space-y-4">
                  {t.inquiryFields.map((field, i) => (
                    <div key={field} className="flex gap-3 text-sm">
                      <span className="font-mono text-xs text-primary">
                        0{i + 1}
                      </span>
                      <span className="text-muted-foreground">{field}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  )
}
