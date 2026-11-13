"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { MailIcon } from "lucide-react"
import { useMemo, useState } from "react"

import { FadeIn } from "@/components/motion/fade-in"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/i18n/language-context"
import { getContactEmail } from "@/data/site-contact"
import { trackLeadEvent } from "@/lib/lead-tracking"


const qualificationCopy = {
  ja: {
    intro: "商品をご提案するため、必須項目をご回答ください。決まっていない項目は「未定」を選べます。",
    required: "必須", purpose: "今回のご希望", stage: "事業の状況",
    initialOrder: "採用する場合の初回仕入れ予定量（サンプルを除く）",
    initialHelp: "サンプルの量ではなく、評価後に購入を検討している数量です。",
    timing: "購入・導入の希望時期", sample: "サンプルのご希望", budget: "希望価格帯（通貨・単位）",
    samplePlaceholder: "例：ラテ用を3種類、各30g／おすすめを相談したい",
    budgetPlaceholder: "例：15,000円/kg以下（送料別）",
    purposes: ["サンプルを評価したい", "初回の仕入れを相談したい", "仕入先を切り替え・追加したい", "情報収集・その他"],
    stages: ["営業・販売中", "開業・商品発売の準備中", "構想・調査中"],
    quantities: ["1kg未満", "1kg以上〜5kg未満", "5kg以上〜20kg未満", "20kg以上〜50kg未満", "50kg以上", "未定"],
    timings: ["1か月以内", "1〜3か月以内", "3〜6か月以内", "6か月より先", "未定"],
  },
  en: {
    intro: "Please complete the required fields so we can recommend suitable products. Select ‘Not decided yet’ where applicable.",
    required: "Required", purpose: "What would you like to do?", stage: "Business stage",
    initialOrder: "Expected first order if approved (excluding samples)",
    initialHelp: "The quantity you may purchase after evaluation, not the sample quantity.",
    timing: "When would you like to purchase or start using the tea?", sample: "Sample preferences", budget: "Target price (currency and unit)",
    samplePlaceholder: "e.g. 3 latte grades, 30g each / please recommend a selection",
    budgetPlaceholder: "e.g. under JPY 15,000/kg, excluding shipping",
    purposes: ["Evaluate samples", "Discuss a first wholesale order", "Replace or add a supplier", "Research / other"],
    stages: ["Already operating / selling", "Preparing to open / launch", "Planning / researching"],
    quantities: ["Under 1kg", "1kg to under 5kg", "5kg to under 20kg", "20kg to under 50kg", "50kg or more", "Not decided yet"],
    timings: ["Within 1 month", "In 1–3 months", "In 3–6 months", "More than 6 months away", "Not decided yet"],
  },
  zh: {
    intro: "為了推薦合適的商品，請填寫必填項目。尚未確定的項目可選擇「尚未決定」。",
    required: "必填", purpose: "本次諮詢目的", stage: "事業階段",
    initialOrder: "評估採用後的首次採購量（不含樣品）",
    initialHelp: "請填寫樣品評估後預計採購的數量，而非樣品數量。",
    timing: "希望採購・開始使用的時間", sample: "樣品需求", budget: "目標價格（幣別及單位）",
    samplePlaceholder: "例：拿鐵用3款，各30g／希望由我們推薦",
    budgetPlaceholder: "例：每公斤15,000日圓以下（不含運費）",
    purposes: ["評估樣品", "洽詢首次批發採購", "更換或增加供應商", "資料蒐集・其他"],
    stages: ["已營業・銷售中", "籌備開業・商品上市", "構想・調查階段"],
    quantities: ["未滿1kg", "1kg以上、未滿5kg", "5kg以上、未滿20kg", "20kg以上、未滿50kg", "50kg以上", "尚未決定"],
    timings: ["1個月內", "1〜3個月內", "3〜6個月內", "6個月以後", "尚未決定"],
  },
} as const

type InquiryForm = {
  purpose: string
  stage: string
  initialOrder: string
  sample: string
  budget: string
  company: string
  country: string
  useCase: string
  product: string
  volume: string
  timing: string
  message: string
}

const emptyForm: InquiryForm = {
  purpose: "",
  stage: "",
  initialOrder: "",
  sample: "",
  budget: "",
  company: "",
  country: "",
  useCase: "",
  product: "",
  volume: "",
  timing: "",
  message: "",
}

export function ContactPageClient() {
  const { locale, m, hrefForLocale } = useLanguage()
  const q = qualificationCopy[locale]
  const email = getContactEmail()
  const searchParams = useSearchParams()
  const [form, setForm] = useState<InquiryForm>(() => ({
    ...emptyForm,
    country: searchParams.get("country")?.trim() || "",
    useCase: ({ "MATCHA / LATTE": 0, "MATCHA / STRAIGHT": 1, "MATCHA / FOOD": 2, "RETAIL / PRIVATE LABEL": 3 } as Record<string, number>)[searchParams.get("interest") || ""] !== undefined
      ? m.contactPage.form.useOptions[({ "MATCHA / LATTE": 0, "MATCHA / STRAIGHT": 1, "MATCHA / FOOD": 2, "RETAIL / PRIVATE LABEL": 3 } as Record<string, number>)[searchParams.get("interest") || ""]] : "",
    product: searchParams.get("interest")?.startsWith("MATCHA") ? m.contactPage.form.productOptions[0]
      : searchParams.get("interest") === "TENCHA" ? m.contactPage.form.productOptions[1]
      : searchParams.get("interest") === "HOJICHA" ? m.contactPage.form.productOptions[2] : "",
  }))

  const chawanName = searchParams.get("name")?.trim() || ""
  const chawanId = searchParams.get("id")?.trim() || ""
  const fromChawan = searchParams.get("from") === "chawan"
  const fromWholesale = searchParams.get("from") === "wholesale"
  const wholesaleInterest = searchParams.get("interest")?.trim() || ""
  const presetCountry = searchParams.get("country")?.trim() || ""

  const mailSubject = useMemo(() => {
    if (fromChawan && chawanName) {
      return `${m.chawanPage.mailSubject}「${chawanName}」${chawanId ? `[${chawanId}]` : ""}`
    }

    if (fromWholesale) {
      return m.contactPage.wholesaleTitle.replace(/^■\s*/, "")
    }

    return m.contactPage.mailSubject
  }, [
    fromChawan,
    fromWholesale,
    chawanName,
    chawanId,
    m.chawanPage.mailSubject,
    m.contactPage.mailSubject,
    m.contactPage.wholesaleTitle,
  ])

  const basicMailto = `mailto:${email}?subject=${encodeURIComponent(mailSubject)}`

  const formMailto = useMemo(() => {
    const lines = [
      `${m.contactPage.form.company}: ${form.company || "-"}`,
      `${m.contactPage.form.country}: ${form.country || "-"}`,
      `${m.contactPage.form.useCase}: ${form.useCase || "-"}`,
      `${m.contactPage.form.product}: ${form.product || "-"}`,
      `${m.contactPage.form.volume}: ${form.volume || "-"}`,
      `${fromChawan ? m.contactPage.form.timing : q.timing}: ${form.timing || "-"}`,
      ...(!fromChawan ? [
        `${q.purpose}: ${form.purpose || "-"}`,
        `${q.stage}: ${form.stage || "-"}`,
        `${q.initialOrder}: ${form.initialOrder || "-"}`,
        `${q.sample}: ${form.sample || "-"}`,
        `${q.budget}: ${form.budget || "-"}`,
      ] : []),
      "",
      `${m.contactPage.form.message}:`,
      form.message || "-",
    ]

    if (fromChawan && chawanName) {
      lines.unshift(
        `${m.chawanPage.inquireItem}: ${chawanName}${chawanId ? ` [${chawanId}]` : ""}`,
        ""
      )
    }

    if (fromWholesale && wholesaleInterest) {
      lines.unshift(
        `${m.contactPage.form.product}: ${wholesaleInterest}`,
        ""
      )
    }

    return `mailto:${email}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(lines.join("\n"))}`
  }, [
    email,
    form,
    fromChawan,
    fromWholesale,
    wholesaleInterest,
    presetCountry,
    chawanId,
    chawanName,
    m.chawanPage.inquireItem,
    m.contactPage.form,
    mailSubject,
    q,
  ])

  const updateField =
    (key: keyof InquiryForm) =>
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      setForm((current) => ({ ...current, [key]: event.target.value }))
    }

  const fieldClass =
    "mt-2 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
      <FadeIn>
        <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
          SHOJUEN
        </p>
        <h1 className="mt-3 font-heading text-3xl font-medium tracking-wide text-foreground sm:text-4xl">
          {m.contactPage.title}
        </h1>
        {fromChawan && chawanName ? (
          <p className="mt-6 rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm leading-relaxed text-foreground">
            {m.chawanPage.inquireItem}
            <span className="mt-1 block font-heading text-base font-medium">
              {chawanName}
            </span>
          </p>
        ) : null}

        {fromWholesale && wholesaleInterest ? (
          <p className="mt-6 rounded-2xl border border-border bg-primary/[0.04] px-4 py-3 text-sm leading-relaxed text-foreground">
            {m.contactPage.form.product}
            <span className="mt-1 block font-heading text-base font-medium">
              {wholesaleInterest}
            </span>
          </p>
        ) : null}

        <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
          {fromChawan ? m.contactPage.wholesaleIntro : q.intro}
        </p>
      </FadeIn>

      <FadeIn className="mt-10" delay={0.05}>
        <form
          className="grid gap-5 rounded-[2rem] border border-border bg-muted/20 p-5 sm:grid-cols-2 sm:p-7"
          onSubmit={(event) => {
            event.preventDefault()
            trackLeadEvent("inquiry_mail_open", {
              location: fromWholesale
                ? "contact_wholesale_form"
                : fromChawan
                  ? "contact_chawan_form"
                  : "contact_form",
              locale,
            })
            window.location.href = formMailto
          }}
        >
          <label className="text-sm font-medium text-foreground">
            {m.contactPage.form.company}{!fromChawan && <span className="ml-2 text-xs text-primary">{q.required}</span>}
            <input
              value={form.company}
              required={!fromChawan}
              onChange={updateField("company")}
              className={fieldClass}
              autoComplete="organization"
            />
          </label>

          <label className="text-sm font-medium text-foreground">
            {m.contactPage.form.country}{!fromChawan && <span className="ml-2 text-xs text-primary">{q.required}</span>}
            <input
              value={form.country}
              required={!fromChawan}
              onChange={updateField("country")}
              className={fieldClass}
              autoComplete="country-name"
            />
          </label>

          <label className="text-sm font-medium text-foreground">
            {m.contactPage.form.useCase}{!fromChawan && <span className="ml-2 text-xs text-primary">{q.required}</span>}
            <select
              value={form.useCase}
              required={!fromChawan}
              onChange={updateField("useCase")}
              className={fieldClass}
            >
              <option value="">{m.contactPage.form.selectPlaceholder}</option>
              {m.contactPage.form.useOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-foreground">
            {m.contactPage.form.product}{!fromChawan && <span className="ml-2 text-xs text-primary">{q.required}</span>}
            <select
              value={form.product}
              required={!fromChawan}
              onChange={updateField("product")}
              className={fieldClass}
            >
              <option value="">{m.contactPage.form.selectPlaceholder}</option>
              {m.contactPage.form.productOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-foreground">
            {m.contactPage.form.volume}
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              {m.contactPage.form.optional}
            </span>
            <input
              value={form.volume}
              onChange={updateField("volume")}
              className={fieldClass}
              placeholder="e.g. 5 kg / month"
            />
          </label>

          {fromChawan ? (
            <label className="text-sm font-medium text-foreground">
              {m.contactPage.form.timing}
              <span className="ml-2 text-xs font-normal text-muted-foreground">{m.contactPage.form.optional}</span>
              <input value={form.timing} onChange={updateField("timing")} className={fieldClass} />
            </label>
          ) : (
            <>
              {([
                ["purpose", q.purpose, q.purposes],
                ["stage", q.stage, q.stages],
                ["initialOrder", q.initialOrder, q.quantities],
                ["timing", q.timing, q.timings],
              ] as const).map(([key, label, options]) => (
                <label key={key} className="text-sm font-medium text-foreground">
                  {label}<span className="ml-2 text-xs text-primary">{q.required}</span>
                  <select required name={key} value={form[key]} onChange={updateField(key)} className={fieldClass}
                    aria-describedby={key === "initialOrder" ? "initial-order-help" : undefined}>
                    <option value="">{m.contactPage.form.selectPlaceholder}</option>
                    {options.map(option => <option key={option} value={option}>{option}</option>)}
                  </select>
                  {key === "initialOrder" && <span id="initial-order-help" className="mt-2 block text-xs font-normal text-muted-foreground">{q.initialHelp}</span>}
                </label>
              ))}
              {([
                ["sample", q.sample, q.samplePlaceholder],
                ["budget", q.budget, q.budgetPlaceholder],
              ] as const).map(([key, label, placeholder]) => (
                <label key={key} className="text-sm font-medium text-foreground">
                  {label}<span className="ml-2 text-xs font-normal text-muted-foreground">{m.contactPage.form.optional}</span>
                  <input name={key} value={form[key]} onChange={updateField(key)} placeholder={placeholder} className={fieldClass} />
                </label>
              ))}
            </>
          )}

          <label className="text-sm font-medium text-foreground sm:col-span-2">
            {m.contactPage.form.message}
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              {m.contactPage.form.optional}
            </span>
            <textarea
              value={form.message}
              onChange={updateField("message")}
              className={cn(fieldClass, "min-h-32 resize-y")}
            />
          </label>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className={cn(
                buttonVariants({ size: "lg" }),
                "w-full rounded-full sm:w-auto"
              )}
            >
              <MailIcon className="size-4 shrink-0" aria-hidden />
              {m.contactPage.form.submit}
            </button>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              {m.contactPage.form.note}
            </p>
          </div>
        </form>
      </FadeIn>

      <FadeIn className="mt-10" delay={0.08}>
        <div className="border-t border-border pt-7">
          <p className="text-sm text-muted-foreground">{email}</p>
          <a
            href={basicMailto}
            onClick={() =>
              trackLeadEvent("direct_email_click", {
                location: "contact_page",
                locale,
              })
            }
            className="mt-3 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            {m.contactPage.mailCta}
          </a>
        </div>
      </FadeIn>

      <FadeIn className="mt-12" delay={0.1}>
        <Link
          href={hrefForLocale(fromChawan ? "/chawan" : fromWholesale ? "/wholesale" : "/")}
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          {fromChawan
            ? m.chawanPage.title
            : fromWholesale
              ? m.contactPage.wholesaleTitle.replace(/^■\s*/, "")
              : m.contactPage.backHome}
        </Link>
      </FadeIn>
    </div>
  )
}
