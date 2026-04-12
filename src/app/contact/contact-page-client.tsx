"use client"

import Link from "next/link"
import { MailIcon } from "lucide-react"

import { FadeIn } from "@/components/motion/fade-in"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/i18n/language-context"
import { getContactEmail } from "@/data/site-contact"

export function ContactPageClient() {
  const { m } = useLanguage()
  const email = getContactEmail()
  const mailto = `mailto:${email}?subject=${encodeURIComponent(m.contactPage.mailSubject)}`

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6 sm:py-24">
      <FadeIn>
        <h1 className="font-heading text-3xl font-medium tracking-wide text-foreground sm:text-4xl">
          {m.contactPage.title}
        </h1>
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

      <FadeIn className="mt-14" delay={0.1}>
        <Link
          href="/"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          {m.contactPage.backHome}
        </Link>
      </FadeIn>
    </div>
  )
}
