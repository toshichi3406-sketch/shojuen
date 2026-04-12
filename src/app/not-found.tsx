"use client"

import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { FadeIn } from "@/components/motion/fade-in"
import { useLanguage } from "@/i18n/language-context"

export default function NotFound() {
  const { m } = useLanguage()

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col justify-center px-4 py-24 text-center sm:px-6">
      <FadeIn>
        <p className="font-heading text-6xl font-medium text-primary/80">404</p>
        <h1 className="font-heading mt-4 text-2xl text-foreground">
          {m.notFound.title}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          {m.notFound.body}
        </p>
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "mt-8 inline-flex rounded-full"
          )}
        >
          {m.notFound.backHome}
        </Link>
      </FadeIn>
    </div>
  )
}
