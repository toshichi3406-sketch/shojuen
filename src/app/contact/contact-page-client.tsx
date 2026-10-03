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

type InquiryForm = {
  company: string
  country: string
  useCase: string
  product: string
  volume: string
  timing: string
  message: string
}

const emptyForm: InquiryForm = {
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
  const email = getContactEmail()
  const searchParams = useSearchParams()
  const [form, setForm] = useState<InquiryForm>(() => ({
    ...emptyForm,
    country: searchParams.get("country")?.trim() || "",
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
      `${m.contactPage.form.timing}: ${form.timing || "-"}`,
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
          {m.contactPage.wholesaleIntro}
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
            {m.contactPage.form.company}
            <input
              value={form.company}
              onChange={updateField("company")}
              className={fieldClass}
              autoComplete="organization"
            />
          </label>

          <label className="text-sm font-medium text-foreground">
            {m.contactPage.form.country}
            <input
              value={form.country}
              onChange={updateField("country")}
              className={fieldClass}
              autoComplete="country-name"
            />
          </label>

          <label className="text-sm font-medium text-foreground">
            {m.contactPage.form.useCase}
            <select
              value={form.useCase}
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
            {m.contactPage.form.product}
            <select
              value={form.product}
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

          <label className="text-sm font-medium text-foreground">
            {m.contactPage.form.timing}
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              {m.contactPage.form.optional}
            </span>
            <input
              value={form.timing}
              onChange={updateField("timing")}
              className={fieldClass}
            />
          </label>

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
