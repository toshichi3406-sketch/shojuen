"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { MailIcon } from "lucide-react"
import { useMemo } from "react"

import { FadeIn } from "@/components/motion/fade-in"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/i18n/language-context"
import { getContactEmail } from "@/data/site-contact"

export function ContactPageClient() {
  const { m } = useLanguage()
  const email = getContactEmail()
  const searchParams = useSearchParams()

  const chawanName = searchParams.get("name")?.trim() || ""
  const chawanId = searchParams.get("id")?.trim() || ""
  const fromChawan = searchParams.get("from") === "chawan"

  const mailSubject = useMemo(() => {
    if (fromChawan && chawanName) {
      return `${m.chawanPage.mailSubject}「${chawanName}」${chawanId ? `[${chawanId}]` : ""}`
    }
    return m.contactPage.mailSubject
  }, [fromChawan, chawanName, chawanId, m.chawanPage.mailSubject, m.contactPage.mailSubject])

  const mailto = `mailto:${email}?subject=${encodeURIComponent(mailSubject)}`

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6 sm:py-24">
      <FadeIn>
        <h1 className="font-heading text-3xl font-medium tracking-wide text-foreground sm:text-4xl">
          {m.contactPage.title}
        </h1>
        {fromChawan && chawanName ? (
          <p className="mt-6 rounded-sm border border-border bg-muted/40 px-4 py-3 text-sm leading-relaxed text-foreground">
            {m.chawanPage.inquireItem}
            <span className="mt-1 block font-heading text-base font-medium">
              {chawanName}
            </span>
          </p>
        ) : null}
        <p className="mt-10 font-mono text-lg text-foreground sm:text-xl">{email}</p>
        <div className="mt-8 flex justify-center">
          <a
            href={mailto}
            className={cn(
              buttonVariants({ size: "lg" }),
              "inline-flex items-center gap-2 rounded-full no-underline"
            )}
          >
            <MailIcon className="size-4 shrink-0" aria-hidden />
            {m.contactPage.mailCta}
          </a>
        </div>
      </FadeIn>

      <FadeIn className="mt-16 text-left" delay={0.08}>
        <h2 className="font-heading text-xl font-medium text-foreground">
          {m.contactPage.wholesaleTitle}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {m.contactPage.wholesaleIntro}
        </p>
        <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-foreground/90">
          {m.contactPage.wholesaleFields}
        </p>
        <p className="mt-6 text-sm">
          <a
            href={mailto}
            className="font-mono text-foreground underline-offset-4 hover:underline"
          >
            {email}
          </a>
        </p>
      </FadeIn>

      <FadeIn className="mt-14" delay={0.1}>
        <Link
          href={fromChawan ? "/chawan" : "/"}
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          {fromChawan ? m.chawanPage.title : m.contactPage.backHome}
        </Link>
      </FadeIn>
    </div>
  )
}
