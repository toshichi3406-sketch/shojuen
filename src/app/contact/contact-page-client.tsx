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
import { qualificationCopy } from "@/data/wholesale-inquiry"
import { trackLeadEvent } from "@/lib/lead-tracking"


const contactCopy = {
  ja: { type: "お問い合わせの種類", wholesale: "卸売・仕入れの相談", general: "その他のお問い合わせ", name: "お名前・会社名", intro: "ご質問やご相談内容をお聞かせください。", messageRequired: "ご相談内容をご入力ください。" },
  en: { type: "Inquiry type", wholesale: "Wholesale / sourcing", general: "Other inquiries", name: "Name / company", intro: "Please tell us your question or how we can help.", messageRequired: "Please enter your message." },
  zh: { type: "諮詢類型", wholesale: "批發・採購諮詢", general: "其他諮詢", name: "姓名・公司名稱", intro: "請告訴我們您的問題或需求。", messageRequired: "請填寫諮詢內容。" },
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
  const c = contactCopy[locale]
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
  const isGeneral = !fromChawan && !fromWholesale
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
    const lines = isGeneral ? [
      `${c.name}: ${form.company || "-"}`,
      "",
      `${m.contactPage.form.message}:`,
      form.message || "-",
    ] : [
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
    isGeneral,
    c.name,
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
        {!fromChawan && (
          <nav aria-label={c.type} className="mt-7 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {[
              { href: "/contact?from=wholesale", label: c.wholesale, active: fromWholesale },
              { href: "/contact", label: c.general, active: isGeneral },
            ].map(item => (
              <Link key={item.href} href={hrefForLocale(item.href)} aria-current={item.active ? "page" : undefined}
                className={cn("rounded-xl border px-4 py-3 text-center text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", item.active ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/50")}>
                {item.label}
              </Link>
            ))}
          </nav>
        )}
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
          {isGeneral ? c.intro : fromChawan ? m.contactPage.wholesaleIntro : q.intro}
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
            {isGeneral ? c.name : m.contactPage.form.company}{fromWholesale ? <span className="ml-2 text-xs text-primary">{q.required}</span> : <span className="ml-2 text-xs font-normal text-muted-foreground">{m.contactPage.form.optional}</span>}
            <input
              value={form.company}
              required={fromWholesale}
              onChange={updateField("company")}
              className={fieldClass}
              autoComplete="organization"
            />
          </label>

          {!isGeneral && <>
          <label className="text-sm font-medium text-foreground">
            {m.contactPage.form.country}{fromWholesale && <span className="ml-2 text-xs text-primary">{q.required}</span>}
            <input
              value={form.country}
              required={fromWholesale}
              onChange={updateField("country")}
              className={fieldClass}
              autoComplete="country-name"
            />
          </label>

          <label className="text-sm font-medium text-foreground">
            {m.contactPage.form.useCase}{fromWholesale && <span className="ml-2 text-xs text-primary">{q.required}</span>}
            <select
              value={form.useCase}
              required={fromWholesale}
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
            {m.contactPage.form.product}{fromWholesale && <span className="ml-2 text-xs text-primary">{q.required}</span>}
            <select
              value={form.product}
              required={fromWholesale}
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

          </>}

          <label className="text-sm font-medium text-foreground sm:col-span-2">
            {m.contactPage.form.message}
            {isGeneral ? <span className="ml-2 text-xs text-primary">{q.required}</span> : (
              <span className="ml-2 text-xs font-normal text-muted-foreground">{m.contactPage.form.optional}</span>
            )}
            <textarea
              required={isGeneral}
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
