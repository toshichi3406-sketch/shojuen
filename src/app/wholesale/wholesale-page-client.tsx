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
  originOtsukaCaption: string
  originUreshinoCaption: string
  otsukaKicker: string
  otsukaTitle: string
  otsukaLead: string
  otsukaPoints: readonly string[]
  otsukaPhotoCaption: string
  ureshinoKicker: string
  ureshinoTitle: string
  ureshinoLead: string
  ureshinoNotes: readonly string[]
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
    heroTitle: "日本の産地から、あなたの一杯へ。",
    heroLead:
      "抹茶・碾茶・ほうじ茶を、カフェ、ブランド、輸入業者、ディストリビューターへ。産地や銘柄ありきではなく、用途・味・色・数量・価格から一緒に選びます。",
    heroCta: "卸売・輸出を相談する",
    journalCta: "産地の記録を見る",
    heroNote: "小ロットのテストから、大口の継続取引までご相談ください。",
    trustLabels: ["MATCHA", "TENCHA", "HOJICHA", "SMALL LOT", "EXPORT"],
    originKicker: "ORIGIN FIRST",
    originTitle: "売る前に、産地を見る。",
    originBody:
      "松壽園は、ひとつの産地だけを正解にしません。現地で畑や製茶を見て、飲み比べ、用途に合うものを探します。宮崎の茶園の仕事も、嬉野で自分たちが見た風景も、その判断材料です。",
    originOtsukaCaption: "宮崎県川南町 · 大塚園",
    originUreshinoCaption: "佐賀県嬉野 · 松壽園の現地記録",
    otsukaKicker: "MIYAZAKI · OTSUKA-EN",
    otsukaTitle: "畑から碾茶製造まで、一つの現場で。",
    otsukaLead:
      "宮崎県川南町の大塚園。茶畑の管理から製茶・加工・販売まで自社で行い、2025年には有機認証の碾茶工場を整備。産地の仕事が見える写真を、許可をいただいて紹介しています。",
    otsukaPoints: [
      "茶畑・工場ともに有機JAS認証",
      "土づくりから栽培、製造、粉末化まで一貫",
      "用途に合わせて、味・香り・色を見ながら仕上げる",
    ],
    otsukaPhotoCaption: "Photography from Otsuka-en official website · used with permission",
    ureshinoKicker: "URESHINO · FIELD NOTES",
    ureshinoTitle: "嬉野で、実際に見て、飲んだ記録。",
    ureshinoLead:
      "霧の茶畑、雨に濡れた新芽、碾茶の質感、飲み比べ。仕入れはスペック表だけでは決めません。現地の空気と、実際に茶碗にしたときの色・香り・味を重ねて判断します。",
    ureshinoNotes: [
      "現地で茶園と製造背景を確認",
      "粉の色だけでなく、飲用時の香りと余韻も比較",
      "カフェ用途なら、ミルクやレシピとの相性まで考える",
    ],
    useKicker: "CHOOSE BY USE",
    useTitle: "「何級の抹茶？」より、「何に使う？」から。",
    useLead:
      "ラテ、薄茶、菓子、再販では、必要な抹茶が違います。最初に用途を教えてもらえれば、候補を絞りやすくなります。",
    uses: [
      {
        title: "Cafe / Latte",
        body: "ミルクに負けない香り、色、コストのバランス。毎日の運用を前提に選びます。",
      },
      {
        title: "Straight tea",
        body: "薄茶やストレートで、旨味・香り・余韻を楽しむための提案。",
      },
      {
        title: "Retail / Brand",
        body: "再販や自社ブランド向け。価格帯、ストーリー、継続供給も含めて相談。",
      },
      {
        title: "Bakery / Food",
        body: "焼成後の色や香り、レシピ原価まで含めて業務用として考えます。",
      },
    ],
    originsKicker: "MULTIPLE ORIGINS",
    originsTitle: "一つの産地に縛られない。",
    originsBody:
      "宇治、八女、嬉野、鹿児島、宮崎など。時期・用途・予算・必要量によって、比較しながら提案します。",
    flowKicker: "HOW WHOLESALE WORKS",
    flowTitle: "取引は、難しくしない。",
    steps: [
      { no: "01", title: "用途を教える", body: "国、用途、月間量、希望価格が分かる範囲で。" },
      { no: "02", title: "候補を絞る", body: "産地やグレードを用途に合わせて比較。" },
      { no: "03", title: "試す", body: "可能な商品は小ロットやサンプルから。" },
      { no: "04", title: "輸出・継続取引", body: "梱包、数量、納期、輸入側の必要事項を確認。" },
    ],
    inquiryKicker: "START A CONVERSATION",
    inquiryTitle: "まず、作りたい一杯を教えてください。",
    inquiryBody:
      "品種名やグレードが分からなくても大丈夫です。こちらで候補を整理します。",
    inquiryFields: ["会社・ブランド名", "納品国", "用途", "月間のおおよその数量", "希望価格帯（あれば）"],
    inquiryCta: "メールで相談する",
  },
  en: {
    heroKicker: "SHOJUEN · WHOLESALE / EXPORT",
    heroTitle: "Japanese tea, closer to origin.",
    heroLead:
      "Matcha, tencha and hojicha for cafes, brands, importers and distributors. We do not start with a grade name. We start with your use, flavor, color, volume and target price.",
    heroCta: "Start a wholesale inquiry",
    journalCta: "See our field notes",
    heroNote: "From small test orders to ongoing wholesale supply.",
    trustLabels: ["MATCHA", "TENCHA", "HOJICHA", "SMALL LOT", "EXPORT"],
    originKicker: "ORIGIN FIRST",
    originTitle: "Before we sell tea, we look at where it comes from.",
    originBody:
      "SHOJUEN does not treat one origin as the only answer. We visit, taste and compare. The work of producers in Miyazaki and our own field notes from Ureshino are part of how we judge fit for each buyer.",
    originOtsukaCaption: "Kawaminami, Miyazaki · Otsuka-en",
    originUreshinoCaption: "Ureshino, Saga · SHOJUEN field notes",
    otsukaKicker: "MIYAZAKI · OTSUKA-EN",
    otsukaTitle: "From tea garden to tencha production.",
    otsukaLead:
      "Otsuka-en in Kawaminami, Miyazaki manages tea gardens, processing and sales in-house. Its organic-certified tencha factory was established in 2025. These photographs are shown with permission to make the work at origin visible.",
    otsukaPoints: [
      "Organic JAS-certified tea gardens and factory",
      "Soil, cultivation, processing and powder production handled as one chain",
      "Flavor, aroma and color adjusted with the final use in mind",
    ],
    otsukaPhotoCaption: "Photography from Otsuka-en official website · used with permission",
    ureshinoKicker: "URESHINO · FIELD NOTES",
    ureshinoTitle: "What we saw and tasted in Ureshino.",
    ureshinoLead:
      "Misty fields, rain-wet buds, the texture of tencha, and side-by-side tastings. We do not buy from a specification sheet alone. We look at the field and then at what happens in the bowl.",
    ureshinoNotes: [
      "See the garden and production context in person",
      "Compare aroma and finish, not only powder color",
      "For cafe use, test how the tea behaves with milk and recipes",
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
    heroTitle: "從日本產地，走進你的每一杯。",
    heroLead:
      "為咖啡館、品牌、進口商與經銷商提供抹茶、碾茶與焙茶。不是先從等級名稱出發，而是從用途、風味、色澤、數量與目標價格一起找答案。",
    heroCta: "洽詢批發・出口",
    journalCta: "查看產地紀錄",
    heroNote: "從小量測試，到長期批發供應皆可洽談。",
    trustLabels: ["MATCHA", "TENCHA", "HOJICHA", "SMALL LOT", "EXPORT"],
    originKicker: "ORIGIN FIRST",
    originTitle: "先看產地，再談銷售。",
    originBody:
      "松壽園不把單一產地當成唯一答案。我們到現場、品飲、比較。宮崎生產者的工作，以及我們在嬉野親自記錄的風景，都是判斷是否適合客戶的重要依據。",
    originOtsukaCaption: "宮崎縣川南町 · 大塚園",
    originUreshinoCaption: "佐賀縣嬉野 · 松壽園現地紀錄",
    otsukaKicker: "MIYAZAKI · OTSUKA-EN",
    otsukaTitle: "從茶園，到碾茶製造。",
    otsukaLead:
      "位於宮崎縣川南町的大塚園，從茶園管理、製茶加工到銷售皆由自家團隊進行，並於2025年建置取得有機認證的碾茶工廠。以下照片經許可使用，讓產地的工作真正被看見。",
    otsukaPoints: [
      "茶園與工廠皆取得有機JAS認證",
      "從土壤、栽培、製造到粉末化形成一條完整鏈",
      "依最終用途觀察風味、香氣與色澤",
    ],
    otsukaPhotoCaption: "大塚園官方網站照片 · 經許可使用",
    ureshinoKicker: "URESHINO · FIELD NOTES",
    ureshinoTitle: "在嬉野，親眼看、親自喝的紀錄。",
    ureshinoLead:
      "霧中的茶園、雨後的新芽、碾茶的質地，以及並排品飲比較。我們不只看規格表，也看產地，最後再看一碗茶裡呈現的色、香與味。",
    ureshinoNotes: [
      "親自確認茶園與製造背景",
      "不只比較粉色，也比較香氣與尾韻",
      "若用於咖啡館，也會考慮與牛奶和配方的相性",
    ],
    useKicker: "CHOOSE BY USE",
    useTitle: "與其先問「什麼等級」，不如先問「要做什麼」。",
    useLead:
      "拿鐵、薄茶、烘焙與零售商品需要的茶不同。先告訴我們用途，就能更快縮小選擇。",
    uses: [
      {
        title: "Cafe / Latte",
        body: "兼顧香氣、綠色表現與成本，並考慮在牛奶中的存在感。",
      },
      {
        title: "Straight tea",
        body: "適合薄茶與純飲，重視旨味、香氣與尾韻。",
      },
      {
        title: "Retail / Brand",
        body: "適合零售與自有品牌，連同價格定位、故事與穩定供應一起討論。",
      },
      {
        title: "Bakery / Food",
        body: "考慮烘烤後色澤、香氣保留與配方成本。",
      },
    ],
    originsKicker: "MULTIPLE ORIGINS",
    originsTitle: "不被單一產地綁住。",
    originsBody:
      "宇治、八女、嬉野、鹿兒島、宮崎等地。依季節、用途、預算與需求量比較後提案。",
    flowKicker: "HOW WHOLESALE WORKS",
    flowTitle: "第一次洽談，不需要很複雜。",
    steps: [
      { no: "01", title: "告訴我們用途", body: "國家、用途、月用量、目標價格，知道多少說多少即可。" },
      { no: "02", title: "縮小候選", body: "依用途比較產地與選項。" },
      { no: "03", title: "實際測試", body: "可提供時，從樣品或小量開始。" },
      { no: "04", title: "出口與持續供貨", body: "確認包裝、數量、交期與進口端需求。" },
    ],
    inquiryKicker: "START A CONVERSATION",
    inquiryTitle: "先告訴我們，你想做出怎樣的一杯。",
    inquiryBody:
      "不需要事先知道品種或等級。我們會和你一起整理候選。",
    inquiryFields: ["公司 / 品牌名稱", "目的國", "用途", "每月大約使用量", "目標價格帶（如有）"],
    inquiryCta: "以 Email 洽詢",
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
          alt={t.originOtsukaCaption}
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
                  alt={t.originOtsukaCaption}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.025]"
                />
              </div>
              <PhotoCaption>{t.originOtsukaCaption}</PhotoCaption>
            </FadeIn>

            <FadeIn delay={0.08}>
              <div className="group relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-muted">
                <Image
                  src={ureshino.field}
                  alt={t.originUreshinoCaption}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.025]"
                />
              </div>
              <PhotoCaption>{t.originUreshinoCaption}</PhotoCaption>
            </FadeIn>
          </div>
        </div>
      </section>

      <section className="border-b border-border/70 bg-stone-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
            <FadeIn>
              <p className="text-xs font-medium uppercase tracking-[0.35em] text-emerald-200/85">
                {t.otsukaKicker}
              </p>
              <h2 className="mt-5 font-heading text-3xl font-medium leading-tight tracking-wide sm:text-5xl">
                {t.otsukaTitle}
              </h2>
              <p className="mt-6 text-base leading-relaxed text-stone-300">
                {t.otsukaLead}
              </p>
              <div className="mt-8 space-y-4">
                {t.otsukaPoints.map((point, i) => (
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
                    alt={t.otsukaTitle}
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
                    alt={t.otsukaTitle}
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
                    alt={t.otsukaTitle}
                    fill
                    sizes="(min-width: 1024px) 55vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <p className="mt-3 text-xs leading-relaxed text-stone-400">
                  {t.otsukaPhotoCaption}
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
              {t.ureshinoKicker}
            </p>
            <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-end">
              <h2 className="font-heading text-3xl font-medium leading-tight tracking-wide text-foreground sm:text-5xl">
                {t.ureshinoTitle}
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
                {t.ureshinoLead}
              </p>
            </div>
          </FadeIn>

          <div className="mt-12 grid gap-4 lg:grid-cols-12">
            <FadeIn className="lg:col-span-7">
              <div className="relative aspect-[16/10] overflow-hidden rounded-[2rem] bg-muted">
                <Image
                  src={ureshino.rows}
                  alt={t.originUreshinoCaption}
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
                    alt={t.ureshinoTitle}
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
                    alt={t.ureshinoTitle}
                    fill
                    sizes="(min-width: 1024px) 40vw, 50vw"
                    className="object-cover"
                  />
                </div>
              </FadeIn>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {t.ureshinoNotes.map((note, i) => (
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
            alt={t.originUreshinoCaption}
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
                      ? "知道多少，告訴我們多少即可"
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
