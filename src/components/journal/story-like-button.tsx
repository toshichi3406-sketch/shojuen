"use client"

import { useEffect, useState } from "react"
import { HeartIcon } from "lucide-react"

import { journalReactionStartingCounts } from "@/data/journal-reactions"
import type { Locale } from "@/i18n/types"
import { cn } from "@/lib/utils"

const labels = {
  ja: { button: "このお話スキ", thanks: "ありがとうございます。", hint: "心に残ったら、ハートをひとつ。" },
  en: { button: "I love this story", thanks: "Thank you.", hint: "If this story stayed with you, leave a heart." },
  ko: { button: "이 이야기가 좋아요", thanks: "감사합니다.", hint: "마음에 남았다면 하트를 눌러 주세요." },
  zh: { button: "喜歡這個故事", thanks: "謝謝您。", hint: "若這個故事留在心中，請留下一顆心。" },
}

export function StoryLikeButton({ slug, locale }: { slug: string; locale: Locale | "ko" }) {
  const [liked, setLiked] = useState(false)
  const [ready, setReady] = useState(false)
  const storageKey = `shojuen:story-like:${slug}`
  const copy = labels[locale]
  const count = (journalReactionStartingCounts[slug] ?? 0) + (liked ? 1 : 0)

  useEffect(() => {
    const read = () => {
      try { setLiked(localStorage.getItem(storageKey) === "1") } catch { /* Keep the in-memory reaction when storage is unavailable. */ }
      setReady(true)
    }
    read()
    const sync = (event: StorageEvent) => {
      if (event.key === storageKey || event.key === null) read()
    }
    window.addEventListener("storage", sync)
    return () => window.removeEventListener("storage", sync)
  }, [storageKey])

  const toggle = () => {
    const next = !liked
    setLiked(next)
    try {
      if (next) localStorage.setItem(storageKey, "1")
      else localStorage.removeItem(storageKey)
    } catch { /* The button still works for this visit. */ }
  }

  return (
    <section className="mt-16 border-t border-border/70 pt-10 text-center">
      <p className="mb-5 text-sm text-muted-foreground">{copy.hint}</p>
      <button
        type="button"
        disabled={!ready}
        onClick={toggle}
        aria-pressed={liked}
        className={cn(
          "inline-flex min-h-12 items-center justify-center gap-3 rounded-full border px-6 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 disabled:cursor-wait motion-reduce:transition-none",
          liked
            ? "border-rose-300 bg-rose-50 text-rose-700"
            : "border-border bg-background text-foreground hover:border-rose-300 hover:bg-rose-50/60 hover:text-rose-700"
        )}
      >
        <HeartIcon aria-hidden="true" className="size-5" fill={liked ? "currentColor" : "none"} />
        <span>{copy.button}</span>
        <span aria-live="polite" aria-atomic="true" className="border-l border-current/20 pl-3 tabular-nums">{count}</span>
      </button>
      <p aria-live="polite" className="mt-3 min-h-5 text-xs text-muted-foreground">{liked ? copy.thanks : ""}</p>
    </section>
  )
}
