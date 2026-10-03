"use client"

import Image from "next/image"
import Link from "next/link"

import { FadeIn } from "@/components/motion/fade-in"
import { buttonVariants } from "@/components/ui/button"
import { useLanguage } from "@/i18n/language-context"
import type { Locale } from "@/i18n/types"
import { trackLeadEvent } from "@/lib/lead-tracking"
import { cn } from "@/lib/utils"

type SingaporeCopy = {
  kicker: string
  title: string
  lead: string
  primaryCta: string
  secondaryCta: string
  note: string
  rangeKicker: string
  rangeTitle: string
  rangeLead: string
  rangeItems: readonly { title: string; body: string }[]
  briefKicker: string
  briefTitle: string
  briefLead: string
  briefItems: readonly string[]
  originKicker: string
  originTitle: string
  originBody: string
  flowKicker: string
  flowTitle: string
  flowItems: readonly { no: string; title: string; body: string }[]
  finalKicker: string
  finalTitle: string
  finalBody: string
}

const copy: Record<Locale, SingaporeCopy> = {
  ja: {
    kicker: "SINGAPORE · JAPANESE TEA WHOLESALE",
    title: "シンガポール向けの抹茶・日本茶を、用途から選ぶ。",
    lead:
      "カフェ、飲料ブランド、小売、輸入事業者向けに、抹茶・碾茶・ほうじ茶をご提案します。グレード名から選ぶのではなく、レシピ、味、色、必要量、ご予算を伺いながら候補を絞ります。",
    primaryCta: "シンガポール向けの卸売を相談する",
    secondaryCta: "卸売ページを見る",
    note:
      "サンプル、小ロット、継続供給、発送・輸出条件は商品や時期、数量、輸入体制によって異なります。",
    rangeKicker: "WHAT YOU CAN SOURCE",
    rangeTitle: "作りたい商品に合わせて、茶を選ぶ。",
    rangeLead:
      "同じ抹茶でも、ラテ、薄茶、菓子では必要な色、香り、味、価格のバランスが変わります。",
    rangeItems: [
      {
        title: "MATCHA / LATTE",
        body: "ミルクの中でも色と香りが出やすく、日々の運用で使いやすい価格とのバランスを見ます。",
      },
      {
        title: "MATCHA / STRAIGHT",
        body: "薄茶やストレート向け。旨味、香り、口当たり、余韻を重視して選びます。",
      },
      {
        title: "MATCHA / FOOD",
        body: "菓子・製菓・食品向け。加工後の色や香り、レシピ原価を含めて比較します。",
      },
      {
        title: "TENCHA / HOJICHA",
        body: "原料用途、飲料、ラテ、菓子など、商品設計と必要量に合わせてご相談いただけます。",
      },
    ],
    briefKicker: "START WITH THE BRIEF",
    briefTitle: "最初に必要なのは、細かな商品知識ではありません。",
    briefLead:
      "分かる範囲で条件を教えてください。そこから現実的な候補を整理します。",
    briefItems: [
      "用途 — ラテ、薄茶、菓子、飲料、物販など",
      "月間のおおよその使用量",
      "目標とする味・色・価格帯",
      "希望時期とシンガポールでの受け取り条件",
    ],
    originKicker: "MULTIPLE JAPANESE ORIGINS",
    originTitle: "一つの産地に決め打ちしない。",
    originBody:
      "宇治、八女、嬉野、鹿児島、宮崎など、日本各地の茶を比較しながら、用途と条件に合うものをご提案します。産地名よりも、最終商品で必要な品質と継続性を優先します。",
    flowKicker: "FROM SAMPLE TO SUPPLY",
    flowTitle: "最初の相談から、継続取引まで。",
    flowItems: [
      {
        no: "01",
        title: "用途と条件を共有",
        body: "商品用途、数量、ご予算、希望時期などを確認します。",
      },
      {
        no: "02",
        title: "候補・サンプルを確認",
        body: "対応可能な商品は、候補を比較しながらサンプルや小ロットで確認します。",
      },
      {
        no: "03",
        title: "発送・継続供給を整理",
        body: "商品、数量、梱包、輸送方法、必要事項を案件ごとに整理します。",
      },
    ],
    finalKicker: "SINGAPORE INQUIRY",
    finalTitle: "まずは、何に使う抹茶か教えてください。",
    finalBody:
      "グレードや品種が未定でも構いません。用途、必要量、ご予算から一緒に候補を絞ります。",
  },
  en: {
    kicker: "SINGAPORE · JAPANESE TEA WHOLESALE",
    title: "Japanese matcha wholesale for Singapore, selected around how you will use it.",
    lead:
      "For cafes, beverage brands, retailers and importers in Singapore. SHOJUEN sources matcha, tencha and hojicha from multiple Japanese origins and narrows the options around your recipe, flavor, color, volume and target cost.",
    primaryCta: "Discuss Singapore wholesale",
    secondaryCta: "View wholesale overview",
    note:
      "Sample, small-lot, repeat-supply, shipping and export conditions vary by product, timing, volume and the buyer's import setup.",
    rangeKicker: "WHAT YOU CAN SOURCE",
    rangeTitle: "Choose tea around the product you are building.",
    rangeLead:
      "Latte, straight matcha and food production need different balances of color, aroma, flavor and cost.",
    rangeItems: [
      {
        title: "MATCHA / LATTE",
        body: "Selected for color and aroma that still show through milk, with a practical balance of quality and cost for daily cafe use.",
      },
      {
        title: "MATCHA / STRAIGHT",
        body: "For usucha and straight serves, with more emphasis on umami, aroma, texture and finish.",
      },
      {
        title: "MATCHA / FOOD",
        body: "For bakery, confectionery and food production, considering color after processing, aroma retention and recipe cost.",
      },
      {
        title: "TENCHA / HOJICHA",
        body: "For ingredient sourcing, drinks, lattes and food applications, selected around the product brief and required volume.",
      },
    ],
    briefKicker: "START WITH THE BRIEF",
    briefTitle: "You do not need to know the grade before you contact us.",
    briefLead:
      "Share what you already know and we can narrow the range from there.",
    briefItems: [
      "Application — latte, straight tea, bakery, drinks or retail",
      "Approximate monthly volume",
      "Target flavor, color and price range",
      "Preferred timing and delivery setup in Singapore",
    ],
    originKicker: "MULTIPLE JAPANESE ORIGINS",
    originTitle: "Not locked to a single origin.",
    originBody:
      "We compare tea from regions including Uji, Yame, Ureshino, Kagoshima and Miyazaki. The priority is the quality, cost and continuity your finished product needs — not forcing every project into one origin story.",
    flowKicker: "FROM SAMPLE TO SUPPLY",
    flowTitle: "From the first brief to repeat supply.",
    flowItems: [
      {
        no: "01",
        title: "Share your use and conditions",
        body: "We confirm the application, expected volume, budget and preferred timing.",
      },
      {
        no: "02",
        title: "Compare options and samples",
        body: "Where available, we narrow candidates and confirm them through samples or a small test order.",
      },
      {
        no: "03",
        title: "Plan shipping and continuity",
        body: "Product, volume, packing, shipping method and import-side requirements are organized case by case.",
      },
    ],
    finalKicker: "SINGAPORE INQUIRY",
    finalTitle: "Tell us what you want the matcha to do.",
    finalBody:
      "You do not need to have the cultivar or grade decided. Start with the application, volume and target price, and we will narrow the options with you.",
  },
  zh: {
    kicker: "SINGAPORE · JAPANESE TEA WHOLESALE",
    title: "面向新加坡的日本抹茶批發，從實際用途開始選。",
    lead:
      "服務新加坡的咖啡館、飲品品牌、零售商與進口商。松壽園從日本多個產地挑選抹茶、碾茶與焙茶，依配方、風味、色澤、採購量與目標成本縮小選擇範圍。",
    primaryCta: "洽詢新加坡批發",
    secondaryCta: "查看批發服務",
    note:
      "樣品、小量採購、持續供貨、運送與出口條件，會依商品、時期、數量及買方的進口安排而異。",
    rangeKicker: "WHAT YOU CAN SOURCE",
    rangeTitle: "依你要做的商品，選擇合適的茶。",
    rangeLead:
      "拿鐵、直接品飲與食品加工，所需要的色澤、香氣、風味與成本平衡並不相同。",
    rangeItems: [
      {
        title: "MATCHA / LATTE",
        body: "重視加入牛奶後仍能呈現色澤與香氣，同時兼顧咖啡館日常使用所需的成本平衡。",
      },
      {
        title: "MATCHA / STRAIGHT",
        body: "適合薄茶與直接品飲，更重視鮮味、香氣、口感與尾韻。",
      },
      {
        title: "MATCHA / FOOD",
        body: "適合烘焙、甜點與食品加工，考量加工後的色澤、香氣保留與配方成本。",
      },
      {
        title: "TENCHA / HOJICHA",
        body: "適合原料、飲品、拿鐵與食品用途，依商品企劃與需求量協助選擇。",
      },
    ],
    briefKicker: "START WITH THE BRIEF",
    briefTitle: "聯絡我們之前，不需要先懂所有等級與品種。",
    briefLead:
      "提供目前已知的條件即可，我們會從這些資訊開始縮小適合的選項。",
    briefItems: [
      "用途 — 拿鐵、直接品飲、烘焙、飲品或零售",
      "每月大約使用量",
      "目標風味、色澤與價格帶",
      "希望時程與新加坡端的收貨安排",
    ],
    originKicker: "MULTIPLE JAPANESE ORIGINS",
    originTitle: "不限定單一產地。",
    originBody:
      "我們比較宇治、八女、嬉野、鹿兒島、宮崎等日本各地的茶。重點是成品需要的品質、成本與持續供貨條件，而不是把所有案件都套入同一個產地故事。",
    flowKicker: "FROM SAMPLE TO SUPPLY",
    flowTitle: "從第一次洽詢，到持續供貨。",
    flowItems: [
      {
        no: "01",
        title: "分享用途與條件",
        body: "確認商品用途、預估用量、預算與希望時程。",
      },
      {
        no: "02",
        title: "比較候選與樣品",
        body: "可提供的商品會先縮小候選範圍，再透過樣品或小量測試確認。",
      },
      {
        no: "03",
        title: "整理運送與持續供貨",
        body: "依個別案件確認商品、數量、包裝、運送方式及進口端需要確認的事項。",
      },
    ],
    finalKicker: "SINGAPORE INQUIRY",
    finalTitle: "先告訴我們，你希望這款抹茶完成什麼任務。",
    finalBody:
      "即使品種與等級尚未決定也沒問題。從用途、採購量與目標價格開始，我們會一起縮小選項。",
  },
}

export function SingaporePageClient() {
  const { locale, hrefForLocale } = useLanguage()
  const t = copy[locale]
  const contactHref = hrefForLocale(
    "/contact?from=wholesale&country=Singapore"
  )

  return (
    <div className="bg-background">
      <section className="relative isolate overflow-hidden bg-stone-950 text-white">
        <Image
          src="/images/wholesale/otsuka-hero.jpg"
          alt={t.title}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/95 via-stone-950/76 to-emerald-950/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-transparent to-stone-950/30" />

        <div className="relative mx-auto flex min-h-[72vh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 sm:pb-24">
          <FadeIn>
            <p className="text-xs font-medium uppercase tracking-[0.4em] text-emerald-100/90">
              {t.kicker}
            </p>
            <h1 className="mt-5 max-w-4xl font-heading text-4xl font-medium leading-[1.08] tracking-wide sm:text-6xl lg:text-7xl">
              {t.title}
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-relaxed text-stone-200 sm:text-lg">
              {t.lead}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href={contactHref}
                onClick={() =>
                  trackLeadEvent("singapore_cta_click", {
                    location: "singapore_hero",
                    locale,
                  })
                }
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "rounded-full px-7 no-underline"
                )}
              >
                {t.primaryCta}
              </Link>
              <Link
                href={hrefForLocale("/wholesale")}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "rounded-full border-white/35 bg-white/10 px-7 text-white no-underline backdrop-blur-sm hover:bg-white/20"
                )}
              >
                {t.secondaryCta}
              </Link>
            </div>
            <p className="mt-5 max-w-2xl text-xs leading-relaxed text-stone-300 sm:text-sm">
              {t.note}
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="border-b border-border/70 bg-muted/25">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
          <FadeIn>
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
              {t.rangeKicker}
            </p>
            <h2 className="mt-5 max-w-4xl font-heading text-3xl font-medium leading-tight tracking-wide text-foreground sm:text-5xl">
              {t.rangeTitle}
            </h2>
            <p className="mt-6 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t.rangeLead}
            </p>
          </FadeIn>

          <div className="mt-12 grid gap-x-8 gap-y-9 sm:grid-cols-2">
            {t.rangeItems.map((item, i) => (
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

      <section className="border-b border-border/70">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:py-28">
          <FadeIn>
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
              {t.briefKicker}
            </p>
            <h2 className="mt-5 font-heading text-3xl font-medium leading-tight tracking-wide text-foreground sm:text-5xl">
              {t.briefTitle}
            </h2>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              {t.briefLead}
            </p>
          </FadeIn>

          <FadeIn delay={0.08}>
            <div className="space-y-5">
              {t.briefItems.map((item, i) => (
                <div key={item} className="border-t border-border pt-5">
                  <div className="flex gap-4">
                    <span className="font-mono text-xs text-primary">
                      0{i + 1}
                    </span>
                    <p className="text-sm leading-relaxed text-foreground sm:text-base">
                      {item}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-border/70 bg-stone-950 text-white">
        <Image
          src="/images/journal/ureshino_20260620/01-tea-field-mist.png"
          alt={t.originTitle}
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-stone-950/82" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
          <FadeIn>
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-emerald-200/85">
              {t.originKicker}
            </p>
            <h2 className="mt-5 max-w-3xl font-heading text-3xl font-medium leading-tight tracking-wide sm:text-5xl">
              {t.originTitle}
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-stone-300 sm:text-lg">
              {t.originBody}
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
            <h2 className="mt-5 max-w-4xl font-heading text-3xl font-medium leading-tight tracking-wide text-foreground sm:text-5xl">
              {t.flowTitle}
            </h2>
          </FadeIn>

          <div className="mt-12 grid gap-7 md:grid-cols-3">
            {t.flowItems.map((item, i) => (
              <FadeIn key={item.no} delay={i * 0.05}>
                <div className="border-t border-border pt-5">
                  <p className="font-mono text-xs tracking-[0.2em] text-primary">
                    {item.no}
                  </p>
                  <h3 className="mt-4 font-heading text-xl font-medium text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {item.body}
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
            <div className="rounded-[2.5rem] border border-border bg-primary/[0.045] p-7 sm:p-10 lg:p-12">
              <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
                {t.finalKicker}
              </p>
              <h2 className="mt-5 max-w-3xl font-heading text-3xl font-medium leading-tight tracking-wide text-foreground sm:text-5xl">
                {t.finalTitle}
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
                {t.finalBody}
              </p>
              <div className="mt-9">
                <Link
                  href={contactHref}
                  onClick={() =>
                    trackLeadEvent("singapore_cta_click", {
                      location: "singapore_bottom",
                      locale,
                    })
                  }
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "rounded-full px-8 no-underline"
                  )}
                >
                  {t.primaryCta}
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  )
}
